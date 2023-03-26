const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

console.log('ENVIRONMENT    ', process.env.NODE_ENV)
console.log('PORT    ', process.env.PORT)
console.log('MONGO_CONNECTION_STRING    ', process.env.MONGO_CONNECTION_STRING)

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const taskController = require('./controller/task.controller')

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '/ui/dist')));

app.use(bodyParser.json());

const onWebhook = (req, res) => {
    let hmac = crypto.createHmac('sha1', process.env.SECRET);
    let sig = `sha1=${hmac.update(JSON.stringify(req.body)).digest('hex')}`;

    if (req.headers['x-github-event'] === 'push' && sig === req.headers['x-hub-signature']) {
        cmd.run('chmod 777 ./git.sh');

        cmd.get('./git.sh', (err, data) => {
            if (data) {
                console.log(data);
            }
            if (err) {
                console.log(err);
            }
        })

        cmd.run('refresh');
    }

    return res.sendStatus(200);
}

app.post('/git', onWebhook);

app.get('/api/tasks', (req, res) => {
    taskController.getTasks().then(data => res.json(data));
});

app.post('/api/task', (req, res) => {
    console.log(req.body);
    taskController.createTask(req.body.task).then(data => res.json(data));
});

app.put('/api/task', (req, res) => {
    taskController.updateTask(req.body.task).then(data => res.json(data));
});

app.delete('/api/task/:id', (req, res) => {
    taskController.deleteTask(req.params.id).then(data => res.json(data));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/ui/dist/index.html'));
});

const listener = app.listen(port, () => {
    console.log(`Server listening on the port  ${port}`);
});