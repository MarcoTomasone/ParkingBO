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
//databasepg.insert_activity('ENTERING', [11.344333560704628, 44.50253708822598]);
//databasepg.update_activity(null, 'UNKNOWN', [11.374815632916402, 44.498454238865584]);
//databasepg.getParkings([11.374815632916402, 44.498454238865584]).then((result) => {console.log(result);});




const server = http.createServer(app);
server.listen(port, () => {
    console.log(`Server listening behind port ${port}`);
});
