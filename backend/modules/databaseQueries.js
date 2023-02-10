const { Client } = require('pg');
const { QUERY_CONFIGURATION } = require( './Configurations');

/*
Per resettare l'autoincrement di una tabella
DELETE FROM history;
DELETE FROM user_events;
SELECT setval(pg_get_serial_sequence('history', 'id_event'), 1);
SELECT setval(pg_get_serial_sequence('user_events', 'id_user'), 1);
*/


module.exports = { 
    /**
     * This function insert a new user activity in the database
     * @param {string} parking_type is the type of parking (ENTERING or EXITING)
     * @param {[lat, long]} position is the position of the user
     * @returns user_id of the inserted user
     */
    insert_activity: async (parking_type, position) => {
        const client = new Client(QUERY_CONFIGURATION);
        await client.connect();
        const geom = `${position[0]} ${position[1]}`;
        try {
            //find the zone of the user
            const zone = await module.exports.find_zone(position);
            if(zone instanceof Error)
            throw new Error(zone.message)
            var result = await client.query(`INSERT INTO user_events(parking_type, zone, position, id_station) VALUES($1, $2, ST_GeomFromText('POINT(${geom})', 4326), null) RETURNING id_user`, [parking_type, zone]);
            const id_user = result.rows[0].id_user;
            //insert the event in history table
            await insert_event_history(parking_type, zone, position);
            await update_parkings(parking_type, zone);
            if(parking_type == "ENTERING") {
                var charge_station = await module.exports.checkNearEChargers(position);
                if(charge_station[0].id != null)
                    return {id_user, charge_station: charge_station[0].id}; //return the id to attach to the app
            }
            return  {id_user: id_user};
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
        const client = new Client(QUERY_CONFIGURATION);
        await client.connect();
        const geom = `${position[0]} ${position[1]}`;
        try {
            const exist = await check_user(id);
            let result;
            let id_user;
            if(exist > 0) {
                const zone = await module.exports.find_zone(position);
                if(zone instanceof Error)
                    throw new Error(zone.message)
                result = await client.query(`UPDATE user_events SET parking_type = $1, zone = $2, position = ST_GeomFromText('POINT(${geom})', 4326) WHERE id_user = $3 RETURNING id_user, id_station `, [parking_type, zone, id]);
                await insert_event_history(parking_type, zone, position);
                await update_parkings(parking_type, zone);
                id_user = result.rows[0].id_user;
                if(result.rows[0].id_station != null)
                    await update_charging_station( parking_type, result.rows[0].id_station);
            }
            else{
                result = await module.exports.insert_activity(parking_type, position); 
                //TO DO: verificare di mandare l'id al cellulare (lo mandiamo a prescindere)
                 id_user = result.id_user;
            }
            if(parking_type == "ENTERING"){
                var charge_station = await module.exports.checkNearEChargers(position);
                if(charge_station[0].id != null)
                    return {id_user, charge_station: charge_station[0].id};
            } 
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
        const client = new Client(QUERY_CONFIGURATION);
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
        const client = new Client(QUERY_CONFIGURATION);
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
        const client = new Client(QUERY_CONFIGURATION);
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
        const client = new Client(QUERY_CONFIGURATION);
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
        const client = new Client(QUERY_CONFIGURATION);
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
        const client = new Client(QUERY_CONFIGURATION);
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
        const client = new Client(QUERY_CONFIGURATION);
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
        const client = new Client(QUERY_CONFIGURATION);
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
        const client = new Client(QUERY_CONFIGURATION);
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
        const client = new Client(QUERY_CONFIGURATION);
        await client.connect();
        try {
            const zone = await module.exports.find_zone(position);
            let n_parkings;
            if (zone instanceof Error)
            throw new Error(zone.message);
            const parkingInZone = await get_nParkingEvents_for_zone(zone);
            console.log("Eventi di parcheggio in zona: " + zone)
            console.log(parkingInZone);
            if(parkingInZone < 5){ //TODO: prendere total_parking - parking in zone 
                console.log("I'm interpolating the result from other zones")
                n_parkings = await parkingIDWInterpolation(zone);
                console.log("Posti occupati interpolati in zona: " + zone)
                console.log(n_parkings);
                const total_parking = await client.query(`SELECT total_parking FROM zones WHERE id_zone = ${zone}`);
                n_parkings =  total_parking.rows[0]['total_parking'] - parseInt(n_parkings);
            } else {
                n_parkings = await module.exports.getParkingsFromZone(zone);
            }
            console.log("Posti liberi in zona: " + zone)
            console.log(n_parkings);
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
     * This function find the zone in which the user is
     * @param {[lat, long]} position  is the position of the user
     * @returns zone in which the user is
    */
   find_zone : async (position) => {
        if(typeof(position) === 'string')
            position = JSON.parse(position);
        const client = new Client(QUERY_CONFIGURATION);
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

    /** 
     * 
     * @returns all the e-chargers position and number of available slots
    */
    getEChargers: async () => {
        const client = new Client(QUERY_CONFIGURATION);
        await client.connect();
        try {
            const result = await client.query(`SELECT id_station as id, n_charging_points_available, ST_X(point) as x, ST_Y(point) as y FROM charge_stations`);
            const echargers = result.rows;
            return echargers;
        } catch (e) {
            console.error(e);
            return e;
        }
        finally {
            await client.end();
        }
    
    },

    /**
     * Function that returns the e-chargers near the user if exists, null else 
     * parameter 3857 in query is the projection of the map to obtain results in meters
     * @param {[lat, long]} position is the position of the user
     * @returns the e-chargers near the user if exists, null else
     */
    checkNearEChargers: async (position) => {
        const client = new Client(QUERY_CONFIGURATION);
        await client.connect();
        try {
            const geom = `${position[0]} ${position[1]}`;
            const result = await client.query(
                `SELECT  id_station as id, n_charging_points_available, ST_X(point) as x, ST_Y(point) as y, 
                    ST_Distance(
                    ST_TRANSFORM(point, 3857),
                    ST_TRANSFORM(ST_GeomFromText('POINT(${geom})', 4326), 3857)) * cosd(42.3521) as distance
                FROM charge_stations 
                WHERE ST_DWithin(point, ST_GeomFromText('POINT(${geom})', 4326), 150, true)
                ORDER BY distance ASC
                LIMIT 1`);
            const echargers = result.rows; //TODO: check if the result is empty
            return echargers;
        } catch (e) {
            console.error(e);
            return e;
        }
        finally {
            await client.end();
        }
    },

    /**
     * This function get the centroid of a multipoint
     * @param {*} coordinates is an array of coordinates
     * @returns the centroid of the multipoint
     */
    computeMultipointCentroid: async (coordinates) => {
        const client = new Client(configuration);
        await client.connect();
        try {
            let multipoint = '';
            coordinates.forEach(element => {
                multipoint += `${element[0]} ${element[1]}, `;
            });
            multipoint = multipoint.substring(0, multipoint.length - 2); //remove the last comma and last space
            const result = await client.query(`SELECT ST_X(centroid), ST_Y(centroid) FROM ST_Centroid('MULTIPOINT ( ${multipoint} )') as centroid;`);
            const centroid = [result.rows[0].st_x, result.rows[0].st_y];
            return centroid;
        } catch (e) {
            console.error(e);
            return e;
        } finally {
            client.end();
            
        }
    },

    update_parking_event_charging_station: async (id_user, id_station) => {
        const client = new Client(QUERY_CONFIGURATION);
        await client.connect();
        try {
            await client.query(`UPDATE user_events SET id_station = ${id_station} WHERE id_user = ${id_user}`);
            await update_charging_station("ENTERING", id_station);
            return true;
        } catch (e) {
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
     * THis function check if the user exists in the database
     * @param {id} id is the id of the user
     * @returns true or false if the user exists
     */
const check_user = async (id) => {
    const client = new Client(QUERY_CONFIGURATION);
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
    const client = new Client(QUERY_CONFIGURATION);
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
    const client = new Client(QUERY_CONFIGURATION);
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
 * This function update the parking number in the zone table
 * @param {string} parking_type is the type of parking (ENTERING, EXITING)
 * @param {int} zone is the zone in which the user is
 */
const update_charging_station = async (parking_type, id_station) => {
    const client = new Client(QUERY_CONFIGURATION);
    await client.connect();
    try {
        if(parking_type == 'ENTERING') {
            //if the user is entering in a parking, update the parking number in the zone table
            await client.query(`UPDATE charge_stations SET n_charging_points_available = n_charging_points_available - 1 WHERE id_station = $1`, [id_station]);
        }
        else {
            //if the user is exiting from a parking, update the parking number in the zone table
            await client.query(`UPDATE charge_stations SET n_charging_points_available = n_charging_points_available + 1 WHERE id_station = $1`, [id_station]);
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
    const client = new Client(QUERY_CONFIGURATION);
    await client.connect();
    try {
        const result = await client.query(`SELECT (total_parking - available_parking) as nEvents FROM zones WHERE id_zone = ${zone}`);
        const nEvents = result.rows[0].nevents;
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
    const client = new Client(QUERY_CONFIGURATION);
    await client.connect();
    try {
        //Access to data through nParkEventsForZone.rows.count and nParkEventsForZone.rows.zone
        const nParkEventsForZone = await client.query(`SELECT (total_parking - available_parking) as count, id_zone as zone FROM zones`);
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
    const client = new Client(QUERY_CONFIGURATION);
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
              
