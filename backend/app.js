const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const userActivity = require('./modules/userActivity');
const frontend = require('./modules/frontend');
const databasepg = require('./modules/databasepg');

const app = express();
const port = 8000;


// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

frontend.createRoutes(app);
userActivity.createRoutes(app);
//databasepg.insert_activity('ENTERING', [11.344333560704627, 44.50253708822598]); //ZONE 3
//databasepg.insert_activity('ENTERING', [11.330262, 44.504243]); //ZONE 7
//databasepg.update_activity(null, 'UNKNOWN', [11.374815632916402, 44.498454238865584]);
//databasepg.getParkings([11.344333560704627, 44.50253708822598]).then((result) => {console.log(result);});
databasepg.getParkingsInterpolation([11.344333560704627, 44.50253708822598]);


const server = http.createServer(app);
server.listen(port, () => {
    console.log(`Server listening behind port ${port}`);
});
