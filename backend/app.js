const http = require('http');
const express = require('express');
const userActivity = require('./userActivity');
const bodyParser = require('body-parser');

const app = express();
const port = 8000;

// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


userActivity.createRoutes(app);

const server = http.createServer(app);
server.listen(port, () => {
    console.log(`Server listening behind port ${port}`);
});
