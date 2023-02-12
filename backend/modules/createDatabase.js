const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const {CREATE_DB_CONFIGURATION , QUERY_CONFIGURATION } = require("./Configurations");

module.exports = {
    /**
     * This function create the database if it doesn't exist
     * @param {int} total_parking_zone1 the number of parking in zone 1
     * @returns true if the database is created, false if it already exists
     * @throws an error if the database cannot be created
     */
    create_database: async (total_parking_zone1) => {
        const client = new Client(CREATE_DB_CONFIGURATION);
        const tableClient = new Client(QUERY_CONFIGURATION);
        await client.connect();
        try {
            console.log("Trying to creating Database");
            await client.query(`CREATE DATABASE User_Activity`);
            await client.end();
            await tableClient.connect();
            await tableClient.query("CREATE EXTENSION postgis;");
            await initialize_zone_table(total_parking_zone1, tableClient);
            await initialize_charge_stations_table(tableClient);
            await create_history_table(tableClient);
            await create_user_events_table(tableClient);
            await create_parking_requests_table(tableClient);
            console.log("Database Created");
            return true;
        }
        catch (e) {
            //If the database already exists, return false
            if (e.code === '42P04') {
                console.log("Database Already Exists")
                return false;
            }
            else {
                throw e;
            }
        } 
        finally {
            await tableClient.end();
        }
    },
}



/**
 * This function creates a table for the zone
 * This table has four fields
 * id_zone: the id of the zone
 * total_parking: the total number of parking in the zone
 * available_parking: the number of available parking in the zone
 * polygon: the polygon of the zone
 * @param {*} client the client of the database
*/
const create_zones_table = async (client) => {
    try {
        await client.query(`CREATE TABLE IF NOT EXISTS zones(
            id_zone SERIAL PRIMARY KEY,
            total_parking INT NOT NULL,
            available_parking INT NOT NULL,
            polygon GEOMETRY(Polygon, 4326) NOT NULL
            )`);
            console.log("Table zones created");
        }
        catch (e) {
            console.error(e);
            return e;
        }
    }
    
/** 
 * This function transforms a geoJson file into a list of coordinates
 * @param {geojson} geojson the geojson file
 * @returns a string with the coordinates of the polygon
*/
const transformGeojsonToPolygonList = (geojson) => {
    const coordinatesList = geojson.geometry.coordinates.flat(1);
    let geom = '';
    coordinatesList.forEach(element => {
        geom += `${element[0]} ${element[1]}, `;
    });
    geom = geom.substring(0, geom.length - 2); //remove the last comma and last space
    return geom;
}

/**
 * This function inizialize the zone table, it must be called only once
 * Takes the number of parking for zone1 and inizialize other in function of the area of others
 * @param {int} total_parking_zone1 the number of parking in zone 1
 * @param {*} client the client of the database
 */
const initialize_zone_table = async (total_parking_zone1, client) => {
    try {
        //Create an empty table
        await create_zones_table(client);
        
        //Get the geojson file and read it
        const filePath = path.join(__dirname, "/../files/zone.geojson");
        const file = fs.readFileSync(filePath, 'utf8');
        var features = JSON.parse(file).features;
        //Compute area of first zone
        let coordinates = transformGeojsonToPolygonList(features[0]);
        const polygon = `POLYGON((${coordinates}))`;
        
        //compute area of the polygon using ST_Area
        const result = await client.query(`SELECT ST_Area('${polygon}') as area`);
        const areaZone1 = result.rows[0].area;
        const total_parking = total_parking_zone1 ;
        const available_parking = total_parking;
        await client.query(`INSERT INTO zones (total_parking, available_parking, polygon) VALUES (${total_parking}, ${available_parking}, ST_GeomFromText('${polygon}', 4326))`);
        
        for(let i = 1; i < features.length; i++) {
            let coordinates = transformGeojsonToPolygonList(features[i]);
            const polygon = `POLYGON((${coordinates}))`;
            //compute area of the polygon using ST_Area
            const result = await client.query(`SELECT ST_Area('${polygon}') as area`);
            const area = result.rows[0].area;
            //compute the number of parking in the zone using the area of the zone and the area of zone1
            const total_parking = total_parking_zone1 * (area/ areaZone1);
            const available_parking = total_parking;
            await client.query(`INSERT INTO zones (total_parking, available_parking, polygon) VALUES (${total_parking}, ${available_parking}, ST_GeomFromText('${polygon}', 4326))`);
        }
        console.log("Table zones initialized");
    }
    catch (e) {
        console.error(e);
        return e;
    }   
}
    
/**
 * This function creates a table for the user activity    
 * This table has four fields:
 * id_user: the id of the user
 * parking_type: the type of parking (exiting, entering)
 * position: the position of the user
 * zone: the zone in which the user is
 * @param {*} client the client of the database
 */
const create_user_events_table = async (client) => {
    try {
        await client.query(`CREATE TABLE IF NOT EXISTS user_events(
            id_user SERIAL PRIMARY KEY,
            parking_type TEXT NOT NULL,
            position GEOMETRY(Point, 4326) NOT NULL,
            zone INT NOT NULL,
            id_station INT,
            FOREIGN KEY(zone) REFERENCES zones(id_zone),
            FOREIGN KEY(id_station) REFERENCES charge_stations(id_station)
        )`);
        console.log("Table user_events created");
    }
    catch (e) {
        console.error(e);
        return e;
    }
}

/**
 * This function creates a table for the user activity
 * This table has four fields:
 * id_event: the id of the event to be stored in the history
 * parking_type: the type of parking (exiting, entering)
 * position: the position of the user
 * zone: the zone in which the user is
 * @param {*} client the client of the database
 */
const create_history_table = async (client) => {
    try {
        await client.query(`CREATE TABLE IF NOT EXISTS history(
            id_event SERIAL PRIMARY KEY,
            parking_type TEXT NOT NULL,
            position GEOMETRY(Point, 4326) NOT NULL,
            zone INT NOT NULL,
            FOREIGN KEY(zone) REFERENCES zones(id_zone)
        )`);
        console.log("Table history created");
    } catch (e) {
        console.error(e);
        return e;
    }
}
 /**
 * This function creates a table for parking requests 
 * This table has three fields:
 * id_request: the id of the request 
 * position: the position of the user
 * zone: the zone in which the user is
 * @param {*} client the client of the database
 */
const create_parking_requests_table = async (client) => {
    try {
        await client.query(`CREATE TABLE IF NOT EXISTS parking_requests(
            id_request SERIAL PRIMARY KEY,
            position GEOMETRY(Point, 4326) NOT NULL,
            zone INT NOT NULL,
            FOREIGN KEY(zone) REFERENCES zones(id_zone)
        )`);
        console.log("Table parking_requests created");
    } catch (e) {
        console.error(e);
        return e;
    }
}
/** 
 * This function creates a table for the charge stations
 * This table has nine fields:
 * id_station: the id of the station
 * operator: the name of electric operator of the station
 * location: the location of the station
 * disctrict: the district of the station
 * year: the year of installation of the station
 * n_charging_points: the number of charging points of the station
 * n_charging_points_available: the number of available charging points of the station
 * state: the state of the station
 * owner: the owner of the station
 * point: the position of the station
 * @param {*} client the client of the database
 * 
*/
const create_charge_stations_table = async (client) => {
    try{
        console.log("Creating table charge_stations");
        await client.query(`CREATE TABLE IF NOT EXISTS charge_stations(
            id_station SERIAL PRIMARY KEY,
            operator TEXT NOT NULL,
            location TEXT NOT NULL,
            district TEXT NOT NULL,
            year INT NOT NULL,
            n_charging_points INT NOT NULL,
            n_charging_points_available INT NOT NULL,
            state TEXT NOT NULL,
            owner TEXT NOT NULL,
            point GEOMETRY(Point, 4326) NOT NULL
        )`);
        console.log("Table charge_stations created");   
    }
    catch (e) {
        console.error(e);
        return e;
    }
}


/**
 * This function initializes the table charge_stations starting from data in a geojson file
 * @param {*} client the client of the database
 */
const initialize_charge_stations_table = async (client) => {
    try{
        await create_charge_stations_table(client);
        console.log("Initializing table charge_stations");
        const filePath = path.join(__dirname, "/../files/colonnine-elettriche.geojson");
        const file = fs.readFileSync(filePath, 'utf8');
        var features = JSON.parse(file).features;
        for (var i = 0; i < features.length; i++) {
            var properties = features[i].properties;
            const geom = `${features[i].geometry.coordinates[0]} ${features[i].geometry.coordinates[1]}`;
            //If the the station is not inside a polygon, it is not inserted in the database
            if( await checkStationInPolygon(geom, client) )
                await client.query(`INSERT INTO charge_stations (operator, location, district, year, n_charging_points, n_charging_points_available, state, owner, point) VALUES ('${properties.operatore}', '${properties.ubicazione}', '${properties.quartiere}', ${properties.anno}, ${1}, ${1}, '${properties.stato}', '${properties.proprieta}', ST_GeomFromText('POINT(${geom})', 4326))`);
        } //TODO: in query change 1 to properties.numstalli 
        console.log("Table charge_stations initialized");
    }
    catch (e) {
        console.error(e);
        return e;
    }
}

/**
 * This functions takes a geometry and checks if it is inside a polygon
 * @param {POINT} geom the geometry of the station 
 */
const checkStationInPolygon = async  (geom, client) => {
    const result = await client.query(`SELECT id_zone FROM zones WHERE ST_Contains(polygon, ST_GeomFromText('POINT(${geom})', 4326))`);
    console.log(result.rows.length);
    if(result.rows.length == 1)
        return true; 
    else 
        return false;
}