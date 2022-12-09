const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const userActivity = require('./userActivity');
const databasepg = require('./databasepg');

const app = express();
const port = 8000;


// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


userActivity.createRoutes(app);
databasepg.insert_activity('EXITING', [11.341679676337476, 44.50092740499525]);
//databasepg.check_zone([11.341679676337476, 44.50092740499525])




const server = http.createServer(app);
server.listen(port, () => {
    console.log(`Server listening behind port ${port}`);
});
