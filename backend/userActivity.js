const databasepg = require("./databasepg");

module.exports = {
    createRoutes: (app) => {
        app.post('/sendTransition', (req, res) => {
            if(req.body.type ==null || req.body.position == null)
                res.status(400).send("Bad request");
            const transition = req.body.type;
            const location = req.body.position.coordinates;
            if(!transition) 
                res.status(400).send({ message: "Failed to send user transition" });
            else {
                if(transition == 'ENTERING') {
                    console.log("Nuovo parcheggio occupato")
                }
                else {
                    console.log("Nuovo parcheggio libero")
                }
                res.status(200).end();
            }             
        });
    },

    insertPosition: (spatialData) => {
        const text = `INSERT INTO users(userid, position) VALUES($1, $2) RETURNING *`;
        const values = [2, spatialData];
        databasepg.doQuery(text, values);
    }

}