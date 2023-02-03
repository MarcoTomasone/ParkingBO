const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const userActivity = require('./modules/userActivity');
const frontend = require('./modules/frontend');
const databasepg = require('./modules/databasepg');
const { inizialize_zone_table } = require('./modules/databasepg');

const app = express();
const port = 8000;


// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

frontend.createRoutes(app);
userActivity.createRoutes(app);

databasepg.create_database(100);
//databasepg.insert_activity('ENTERING', [11.333112801431849, 44.49986947592486]); //ZONE 1
//databasepg.find_zone([11.346645867644199, 44.48810035688256]).then((result) => {console.log(result);});
//databasepg.getParkingsInterpolation([11.344333560704627, 44.50253708822598]);
//databasepg.insertParkingRequest(0, [11.346639157565917, 44.50244800031392], 3)
//databasepg.getParkingRequestsFromZone(3).then((result) => {console.log(result);});
//databasepg.getPointsParkingEventsGrouped().then((result) => {console.log(result);});

//uno = [11.332168663873928, 44.493318684275344]
//due = [11.333112801431849, 44.49986947592486]
//tre = [11.346639157565917, 44.50244800031392]
//quattro = [11.343592168174437, 44.49825453943108]
//cinque = [11.354406834747014, 44.495193428653465]
//sei = [11.346645867644199, 44.48810035688256]
//sette = [11.33273458625832, 44.50581479439516]

const server = http.createServer(app);
server.listen(port, () => {
    console.log(`Server listening behind port ${port}`);
});
