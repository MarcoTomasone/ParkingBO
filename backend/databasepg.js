const { Client } = require('pg');
const client = new Client({
    host: 'localhost',
    user: 'postgres',
    port: 5432,
    password: 'root',
    database: 'User_Activity',
    });

module.exports = {
    doQuery: (query, values = null) => {
        client.connect();
        client.query(query, values ? values : null)
            .then((res) => console.log(res.rows))
            .catch((err) => console.error('Error executing query', err.stack))
            .finally(() => client.end());
    }
}