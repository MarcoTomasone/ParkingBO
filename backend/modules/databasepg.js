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
     * @param {string} parking_type 
     * @param {[lat, long]} position 
     * @returns user_id of the inserted user
     */
    insert_activity: async (parking_type, position) => {
        const client = new Client(configuration);
        await client.connect();
        const geom = `${position[0]} ${position[1]}`;
        try {
            //find the zone of the user
            const zone = await find_zone(position);
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
     * @param {int} id 
     * @param {string} parking_type 
     * @param {[lat, long]} position
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
                const zone = await find_zone(position);
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
     * @param {int} id 
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
     * @param {[lat, long]} position 
     * @returns number of parkings in the zone
     */
    getParkings: async (position) => {
        const client = new Client(configuration);
        await client.connect();
        try {
            const zone = await find_zone(position);
            if (zone instanceof Error)
                throw new Error(zone.message);
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
     * @param {[lat, long]} position 
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
    }
    
}

/* -------------------------------------------------------UTILS-----------------------------------------------------------------------------*/

/**
     * THis function check if the user exists in the database
     * @param {id} id 
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
     * This function find the zone in which the user is
     * @param {[lat, long]} position 
     * @returns zone in which the user is
     */
const find_zone = async (position) => {
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
        //new Error(e);
        return new Error('Zone not found');
        console.error(e);
        return e;
    }
    finally {
        await client.end();
    }
};

/**
     * This function insert a new event in history table of the database
     * @param {string} parking_type 
     * @param {int} zone 
     * @param {[lat, long]} position 
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
 * @param {string} parking_type 
 * @param {int} zone 
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
              
