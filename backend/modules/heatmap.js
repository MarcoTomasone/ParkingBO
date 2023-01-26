const databasepg = require('./databasepg');

module.exports = {
    createRoutes: (app) => {
        //This function return a file saved in the server
        app.get('/heatmap', async (req, res) => {
            var data = await databasepg.getPointsParkingEventsGrouped();
            let vectors = new Array();
            for (let i = 0 ; i < data.length ; i++) {
                vectors[i] = [ data[i].x , data[i].y , data[i].nparking, data[i].zone ];
            }
            res.header("Access-Control-Allow-Origin", "*");
            return res.status(200).send(vectors);
        });
    }
};
