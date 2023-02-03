const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const { ClientRequest } = require('http');
const create_configuration = {
    host: 'localhost',
    user: 'postgres',
    port: 5432,
    password: 'root',
   
}

const configuration = {
    host: 'localhost',
    user: 'postgres',
    port: 5432,
    password: 'root',
    database: 'user_activity',
}

/*
Per resettare l'autoincrement di una tabella
DELETE FROM history;
DELETE FROM user_events;
SELECT setval(pg_get_serial_sequence('history', 'id_event'), 1);
SELECT setval(pg_get_serial_sequence('user_events', 'id_user'), 1);
*/


module.exports = {
    /**
     * This function create the database if it doesn't exist
     * @param {int} total_parking_zone1 the number of parking in zone 1
     * @returns true if the database is created, false if it already exists
     * @throws an error if the database cannot be created
     */
    create_database: async (total_parking_zone1) => {
        const client = new Client(create_configuration);
        const tableClient = new Client(configuration);
        await client.connect();
        try {
            console.log("Trying to creating Database");
            await client.query(`CREATE DATABASE User_Activity`);
            await client.end();
            await tableClient.connect();
            await tableClient.query("CREATE EXTENSION postgis;");
            await initialize_zone_table(total_parking_zone1, tableClient);
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
    
    /**
     * This function insert a new user activity in the database
     * @param {string} parking_type is the type of parking (ENTERING or EXITING)
     * @param {[lat, long]} position is the position of the user
     * @returns user_id of the inserted user
     */
    insert_activity: async (parking_type, position) => {
        const client = new Client(configuration);
        await client.connect();
        const geom = `${position[0]} ${position[1]}`;
        try {
            //find the zone of the user
            const zone = await module.exports.find_zone(position);
            if(zone instanceof Error)
            throw new Error(zone.message)
            const result = await client.query(`INSERT INTO user_events(parking_type, zone, position) VALUES($1, $2, ST_GeomFromText('POINT(${geom})', 4326)) RETURNING id_user`, [parking_type, zone]);
            const id_user = result.rows[0].id_user;
            //insert the event in history table
            await insert_event_history(parking_type, zone, position);
            await update_parkings(parking_type, zone);
            return id_user; //return the id to attach to the app
        } catch (e) {
            console.error(e);
            return e;
        }
        finally {
            await client.end();
        }
    },

    /**
     * This function update the user activity in the database
     * @param {int} id is the id of the user
     * @param {string} parking_type is the type of parking (ENTERING or EXITING)
     * @param {[lat, long]} position is the position of the user
     * @returns user_id of the updated user 
     */
    update_activity: async (id, parking_type, position) => {
        const client = new Client(configuration);
        await client.connect();
        const geom = `${position[0]} ${position[1]}`;
        try {
            const exist = await check_user(id);
            let result;
            if(exist > 0) {
                const zone = await module.exports.find_zone(position);
                if(zone instanceof Error)
                    throw new Error(zone.message)
                result = await client.query(`UPDATE user_events SET parking_type = $1, zone = $2, position = ST_GeomFromText('POINT(${geom})', 4326) WHERE id_user = $3 RETURNING id_user`, [parking_type, zone, id]);
                await insert_event_history(parking_type, zone, position);
                await update_parkings(parking_type, zone);
            }
            else
                result = await module.exports.insert_activity(parking_type, position); 
                //TO DO: verificare di mandare l'id al cellulare (lo mandiamo a prescindere)
            const id_user = result.rows[0].id_user;
            return id_user;
        } catch (e) {
            console.error(e);
            return e;
        }
        finally {
            await client.end();  
        } 
    },

    /**
     * This function delete an user activity in the database by an id
     * @param {int} id is the id of the user
     */
    delete_activity: async (id) => {
        const client = new Client(configuration);
        await client.connect();
        try {
            await client.query(`DELETE FROM user_events WHERE id_user = $1;`, [id]);
        } catch (e) {
            console.error(e);
        }
        finally {
            await client.end();  
        } 
    },
    
    /**
     * This function insert a new parking request in the database
     * @param {int} id is the id of the user
     * @param {[lat, long]} position is the position of the user
     * */
    insertParkingRequest: async (id, position, zone) => {
        const client = new Client(configuration);
        await client.connect();
        if(typeof(position) === 'string')
            position = JSON.parse(position);
        try {
            const geom = `${position[0]} ${position[1]}`;
            const result = await client.query(`INSERT INTO parking_requests(position, id_user, zone) VALUES(ST_GeomFromText('POINT(${geom})', 4326), $1, $2) RETURNING id_user`, [id, zone]);           
        } catch (e) {
            console.error(e);
        }
        finally {
            await client.end();
        }
    },

    /**
     * This function get all parking requests from a zone
     * @param {*} zone is the zone of which we want to know the parking requests
     * @returns all parking requests from a zone
    */
    getParkingRequestsFromZone: async (zone) => {
        const client = new Client(configuration);
        await client.connect();
        try {
            const result = await client.query(`SELECT id_request, ST_X(position) as x, ST_Y(position) as y FROM parking_requests WHERE zone = ${zone}`);
            return result.rows;
        } catch (e) {
            console.error(e);
        }
        finally {
            await client.end();
        }
    },
    
    /**
     * This function get all parking events in history table
     * @returns all parking events in history table
    */
   getPointsParkingEvents: async () => {
        const client = new Client(configuration);
        await client.connect();
        try {
            const result = await client.query(`SELECT ST_X(position) as x, ST_Y(position) as y FROM history WHERE parking_type = 'ENTERING'`);
            return result.rows;
        } catch (e) {
            console.error(e);
        }
        finally {
            await client.end();
        }
    },

    /**
     * Get for each point the number of parking events
     * @returns all parking events in history table
    */
   getPointsParkingEventsGrouped: async () => {
        const client = new Client(configuration);
        await client.connect();
        try {
            const result = await client.query(`SELECT ST_X(position) as x, ST_Y(position) as y, zone, COUNT(*) as nParking FROM history WHERE parking_type = 'ENTERING' GROUP BY x,y,zone`);
            return result.rows;
        } catch (e) {
            console.error(e);
        }
        finally {
            await client.end();
        }
    },
    
    

    /**
     * This function return all the users in the database
     * @returns all the users in the database
    */
   getAll_users: async () => {
        const client = new Client(configuration);
        await client.connect();
        try {
            const result = await client.query(`SELECT * FROM user_events`);
            return result;
        } catch (e) {
            console.error(e);
        }
        finally {
            await client.end();
        }
    },    

    /**
     * This function return the number of parkings in the zone from the position
     * @param {[lat, long]} position is the position of the user
     * @returns number of parkings in the zone
     */
    getParkingsFromPosition: async (position) => {
        const client = new Client(configuration);
        await client.connect();
        try {
            const zone = await module.exports.find_zone(position);
            if (zone instanceof Error)
                throw new Error(zone.message);
            await module.exports.insertParkingRequest(0, position, zone);
            const result = await client.query(`SELECT available_parking FROM zones WHERE id_zone = ${zone}`);
            const n_parkings = result.rows[0]['available_parking'];
            return n_parkings;
        } catch (e) {
            console.error(e);
            return e;
        }
        finally {
            await client.end();
        }
    },

    /**
     * This function return the number of parkings in the zone from the zone id
     * @param {[lat, long]} position is the position of the user
     * @returns number of parkings in the zone
    */
   getAllParkings: async () => {
        const client = new Client(configuration);
        await client.connect();
        try {
            const result = await client.query(`SELECT available_parking FROM zones`);
            const n_parkings = result.rows;
            return n_parkings;
        } catch (e) {
            console.error(e);
            return e;
        }
        finally {
            await client.end();
        }
    },
    
    /**
     * This function return the number of parkings in the zone from the zone id
     * @param {[lat, long]} position is the position of the user
     * @returns number of parkings in the zone
    */
   getParkingsFromZone: async (zone) => {
        const client = new Client(configuration);
        await client.connect();
        try {
            const result = await client.query(`SELECT available_parking FROM zones WHERE id_zone = ${zone}`);
            const n_parkings = result.rows[0]['available_parking'];
            return n_parkings;
        } catch (e) {
            console.error(e);
            return e;
        }
        finally {
            await client.end();
        }
    },
    
    /**
     * This function get the number of parking with an interpolation
     * @param {[lat, long]} position is the position of the user
     * @returns the number of interpolated parking in the zone
    */
    getParkingsInterpolation: async (position) => {
        const client = new Client(configuration);
        await client.connect();
        try {
            const zone = await module.exports.find_zone(position);
            let n_parkings;
            if (zone instanceof Error)
            throw new Error(zone.message);
            //if(get_nParkingEvents_for_zone(zone) < 5) //TODO: prendere total_parking - parking in zone 
                n_parkings = await parkingIDWInterpolation(zone);
                console.log(n_parkings);
                //else {
            //    const result = await client.query(`SELECT parking FROM zones WHERE id_zone = ${zone}`);
            //     n_parkings = result.rows[0]['parking'];
           // }
            //return n_parkings;
        } catch (e) {
            console.error(e);
            return e;
        }
        finally {
            await client.end();
        }
    },
    
    /**
     * This function find the zone in which the user is
     * @param {[lat, long]} position  is the position of the user
     * @returns zone in which the user is
    */
   find_zone : async (position) => {
        if(typeof(position) === 'string')
            position = JSON.parse(position);
        const client = new Client(configuration);
        await client.connect();
        try {
            const geom = `${position[0]} ${position[1]}`;
            const result = await client.query(`SELECT Z.id_zone FROM zones as Z WHERE ST_Contains(Z.polygon, ST_GeomFromText('POINT(${geom})', 4326))`);
            const zone = result.rows[0].id_zone;
            return zone;
        } catch (e) {
            if(e.message == "Cannot read properties of undefined (reading 'id_zone')")
            return new Error('Zone not found');
            
            console.error(e);
            return e;
        }
        finally {
            await client.end();
        }
    },
    
}

/* -------------------------------------------------------UTILS-----------------------------------------------------------------------------*/

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
        
    const transformGeojsonToPolygonList = (geojson) => {
        //console.log(geojson.features[0].geometry.coordinates.flat(1).toString());
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
                FOREIGN KEY(zone) REFERENCES zones(id_zone)
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
     * THis function check if the user exists in the database
     * @param {id} id is the id of the user
     * @returns true or false if the user exists
     */
const check_user = async (id) => {
    const client = new Client(configuration);
    await client.connect();
    try {
        const result = await client.query(`SELECT COUNT(1) FROM user_events WHERE id_user = ${id};`);
        const count = result.rows[0].count;
        return count;
    } catch (e) {
        console.error(e);
        return e;
    }
    finally {
        await client.end();
    }       
};




/**
     * This function insert a new event in history table of the database
     * @param {string} parking_type is the type of parking (ENTERING, EXITING)
     * @param {int} zone is the zone in which the user is
     * @param {[lat, long]} position is the position of the user
     */
const insert_event_history = async (parking_type, zone, position) => {
    const client = new Client(configuration);
    await client.connect();
    const geom = `${position[0]} ${position[1]}`;
    try {
        //TO DO:controllo di zone
        const result = await client.query(`INSERT INTO history(parking_type, zone, position) VALUES($1, $2, ST_GeomFromText('POINT(${geom})', 4326))`, [parking_type, zone]);
    } catch (e) {
        console.error(e);
    }
    finally {
        await client.end();
    }
};

/**
 * This function update the parking number in the zone table
 * @param {string} parking_type is the type of parking (ENTERING, EXITING)
 * @param {int} zone is the zone in which the user is
 */
const update_parkings = async (parking_type, zone) => {
    const client = new Client(configuration);
    await client.connect();
    try {
        if(parking_type == 'ENTERING') {
            //if the user is entering in a parking, update the parking number in the zone table
            await client.query(`UPDATE zones SET available_parking = available_parking - 1 WHERE id_zone = $1`, [zone]);
        }
        else {
            //if the user is exiting from a parking, update the parking number in the zone table
            await client.query(`UPDATE zones SET available_parking = available_parking + 1 WHERE id_zone = $1`, [zone]);
        }
    } catch (e) {
        console.error(e);
    }
    finally {
        await client.end();
    }
};

/**
 * This function get the number of parking events in a zone
 * @param {int} zone is the zone in which the user is 
 * @returns the number of parking events in the zone
 */
const get_nParkingEvents_for_zone = async (zone) => {
    const client = new Client(configuration);
    await client.connect();
    try {
        const result = await client.query(`SELECT COUNT(*) FROM history WHERE zone = ${zone}`);
        const nEvents = result.rows[0].count;
        return nEvents;
    } catch (e) {
        console.error(e);
        return e;
    }
    finally {
        await client.end();
    }
};

//https://en.wikipedia.org/wiki/Inverse_distance_weighting
const parkingIDWInterpolation = async (zone) => {
    const client = new Client(configuration);
    await client.connect();
    try {
        //Access to data through nParkEventsForZone.rows.count and nParkEventsForZone.rows.zone
        const nParkEventsForZone = await client.query(`SELECT available_parking FROM zones WHERE id_zone = ${zone}`);
        //Compute centroid for each zone
        for(row in nParkEventsForZone.rows) {
            centroid = await computeCentroid(nParkEventsForZone.rows[row].zone);
            centroid = centroid.toString().replace("POINT(","").replace(")","").split(" ");
            nParkEventsForZone.rows[row].centroid = [centroid[1], centroid[0]];
        }
        result = await computeCentroid(zone);
        result = result.toString().replace("POINT(","").replace(")","").split(" ");
        centroidOfZoneOfInterest = [result[1], result[0]];
        //Compute distance between centroid of other zones and the zone of interest
        for(row in nParkEventsForZone.rows) {
            nParkEventsForZone.rows[row].distance = computeDistance(nParkEventsForZone.rows[row].centroid, centroidOfZoneOfInterest);
        }
        interpolatedValue = 0;
        //Compute result
        for(row in nParkEventsForZone.rows) {
            interpolatedValue += nParkEventsForZone.rows[row].count * nParkEventsForZone.rows[row].distance;
        }
        
        sumOfDistances = 0;
        for(row in nParkEventsForZone.rows) 
            sumOfDistances += nParkEventsForZone.rows[row].distance;
        
        interpolatedValue =interpolatedValue / sumOfDistances;
        return interpolatedValue;
    } catch (e) {
        console.error(e);
        return e;
    }
    finally {
        await client.end();
    }
}

const computeCentroid = async (zone) => {
    const client = new Client(configuration);
    await client.connect();
    try {
        const result = await client.query(`SELECT ST_AsText(ST_Centroid(polygon)) FROM zones WHERE id_zone = ${zone}`);
        const centroid = result.rows[0].st_astext;
        return centroid;
    } catch (e) {
        console.error(e);
        return e;
    }
    finally {
        await client.end();
    }
};

const computeDistance = (p, q) =>{
    distance = (Math.sqrt( Math.pow((q[0]-p[0]),2) + Math.pow((p[1]-q[1]),2)));
    return distance;
}
              
