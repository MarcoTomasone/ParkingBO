const kmeans = require('node-kmeans');
const databasepg = require('./databasepg');

module.exports = {
    createRoutes: (app) => {
        //This function return a file saved in the server
        app.get('/kmeans', async (req, res) => {
            var size = req.query.size;
            var data = await databasepg.getPointsParkingEvents();

            if(size) {
                let vectors = new Array();
                for (let i = 0 ; i < data.length ; i++) {
                    vectors[i] = [ data[i].x , data[i].y ];
                }
                kmeans.clusterize(vectors, {k: size}, (err,result) => {
                    if (err)
                        return res.status(400).send({'status' : 'Error'});
                    else {
                        const encoded = JSON.stringify(result);
                        res.header("Access-Control-Allow-Origin", "*");
                        return res.status(200).send(encoded);
                    }
                });
            }
            else {
                res.header("Access-Control-Allow-Origin", "*");
                return res.status(400).send({'status' : 'Bad Request'});
            }
        });
    }
};
