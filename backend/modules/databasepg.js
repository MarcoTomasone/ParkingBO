const { Client } = require('pg');
const configuration = {
    host: 'localhost',
    user: 'postgres',
    port: 5432,
    password: 'root',
    database: 'User_Activity',
}



module.exports = {
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
            const result = await client.query(`INSERT INTO users(parking_type, zone, position) VALUES($1, $2, ST_GeomFromText('POINT(${geom})', 4326)) RETURNING id_user`, [parking_type, zone]);
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
                result = await client.query(`UPDATE users SET parking_type = $1, zone = $2, position = ST_GeomFromText('POINT(${geom})', 4326) WHERE id_user = $3 RETURNING id_user`, [parking_type, zone, id]);
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
            await client.query(`DELETE FROM users WHERE id_user = $1;`, [id]);
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
        const geom = `${position[0]} ${position[1]}`;
        try {
            const result = await client.query(`INSERT INTO parking_requests(position, id_user, zone) VALUES(ST_GeomFromText('POINT(${geom})', 4326), $1, $2) RETURNING id_user`, [id, zone]);
            //console.log(result);            
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
            const result = await client.query(`SELECT * FROM parking_requests WHERE zone = ${zone}`);
            return result.rows;
        } catch (e) {
            console.error(e);
        }
        finally {
            await client.end();
        }
    },
    

    /**
     * This function return all events from a zone
     * @param {number} zone is the zone of which we want to know the events
     */
    getAllEventsFromZone: async (zone) => {
        const client = new Client(configuration);
        await client.connect();
        try {
            const result = await client.query(`SELECT * FROM history WHERE zone = ${zone}`);
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
            const result = await client.query(`SELECT * FROM users`);
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
    getParkings: async (position) => {
        const client = new Client(configuration);
        await client.connect();
        try {
            const zone = await module.exports.find_zone(position);
            if (zone instanceof Error)
                throw new Error(zone.message);
            await module.exports.insertParkingRequest(0, position, zone);
            const result = await client.query(`SELECT parking FROM zone WHERE id_zone = ${zone}`);
            const n_parkings = result.rows[0]['parking'];
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
            const result = await client.query(`SELECT parking FROM zone`);
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
            const result = await client.query(`SELECT parking FROM zone WHERE id_zone = ${zone}`);
            const n_parkings = result.rows[0]['parking'];
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
            //    const result = await client.query(`SELECT parking FROM zone WHERE id_zone = ${zone}`);
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
        geom = `${position[0]} ${position[1]}`;
        const result = await client.query(`SELECT Z.id_zone FROM zone as Z WHERE ST_Contains(Z.polygon, ST_GeomFromText('POINT(${geom})', 4326))`);
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
     * THis function check if the user exists in the database
     * @param {id} id is the id of the user
     * @returns true or false if the user exists
     */
const check_user = async (id) => {
    const client = new Client(configuration);
    await client.connect();
    try {
        const result = await client.query(`SELECT COUNT(1) FROM users WHERE id_user = ${id};`);
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
            await client.query(`UPDATE zone SET parking = parking - 1 WHERE id_zone = $1`, [zone]);
        }
        else {
            //if the user is exiting from a parking, update the parking number in the zone table
            await client.query(`UPDATE zone SET parking = parking + 1 WHERE id_zone = $1`, [zone]);
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
        const nParkEventsForZone = await client.query(`SELECT parking FROM zone WHERE id_zone = ${zone}`);
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
        const result = await client.query(`SELECT ST_AsText(ST_Centroid(polygon)) FROM zone WHERE id_zone = ${zone}`);
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
              
