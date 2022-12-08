const { Client } = require('pg');
const configuration = {
    host: 'localhost',
    user: 'postgres',
    port: 5432,
    password: 'root',
    database: 'User_Activity',
}



module.exports = {
    doQuery: (query, values = null) => {
        client = new Client(configuration)
        client.connect();
        client.query(query, values ? values : null)
            .then((res) => console.log(res.rows))
            .catch((err) => console.error('Error executing query', err.stack))
            .finally(() => client.end());
    },
    insert_activity: async (position) => {
        const client = new Client(configuration);
        await client.connect();
        try {
            const result = await client.query(`INSERT INTO users(position) VALUES($1) RETURNING id_user`, [position]);
            const id_user = result.rows[0].userid;
            return id_user; //ritorno l'id da attaccare all'app
        } catch (e) {
            console.error(e);
        }
        finally {
            await client.end();
        }
    },

    update_activity: async (id, position) => {
        const client = new Client(configuration);
        await client.connect();
        try {
            const exist = this.check(id);
            let result;
            if(exist)
                result = await client.query(`UPDATE users SET position = $1 WHERE id_user = $2 RETURNING id_user`, [position, id]);
            else
                result = this.insert(position); //verificare di mandare l'id al cellulare (lo mandiamo a prescindere)
            const id_user = result.rows[0].userid;
            console.log(id_user);
        } catch (e) {
            console.error(e);
        }
        finally {
            await client.end();  
        } 
    },

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
    
    check_user: async (id) => {
        const client = new Client(configuration);
        await client.connect();
        try {
            const result = await client.query(`SELECT COUNT(1) FROM users WHERE unique_key = ${id};`);
            return result;
        } catch (e) {
            console.error(e);
        }
        finally {
            await client.end();
        }       
    },

    getAll_users: async () => {
        const client = new Client(configuration);
        await client.connect();
        try {
            const result = await client.query(`SELECT * FROM users`);
            console.log(result.rows);
            return result; //ritorno l'id da attaccare all'app
        } catch (e) {
            console.error(e);
        }
        finally {
            await client.end();
        }
    },
    
    check_zone: async (position) => {
        const client = new Client(configuration);
        await client.connect();
        const geom = `${position[0]} ${position[1]}`
        try {
            const result = await client.query(`SELECT Z.id_zone FROM zone as Z WHERE ST_Contains(Z.polygon, ST_GeomFromText('POINT(${geom})', 4326))`);
            const zone = result.rows[0].id_zone;
            return zone; //la zona in cui si trova
        } catch (e) {
            console.error(e);
        }
        finally {
            await client.end();
        }
    },

}

              
