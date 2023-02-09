const fs = require('fs');
const path = require('path');
const databasepg = require('./databasepg');
const kmeans = require('node-kmeans');
var clustering = require('density-clustering');

module.exports = {
    createRoutes: (app) => {
        //This function get the data from the local file system
        app.get('/getData', async (req, res) => {
            const data = req.query.data;
            if(data) {
                //check if file is present
                const filePath = path.join(__dirname, "/../files/" + data);
                if(fs.existsSync(filePath)) {
                    const file = fs.readFileSync(filePath, 'utf8');
                    res.header("Access-Control-Allow-Origin", "*");
                    res.status(200).send(file);
                    
                }
                else {
                    res.status(404).send("File not found");
                }
            }
            else
                res.status(400).send("Bad request");
        });

        //This function return the number of parkings in a zone
        app.get('/getAllParkings', async (req, res) => {
            const result = await databasepg.getAllParkings();
            if(result instanceof Error) {
                await res.status(400).send("Bad request");
                return;
            }
            else {
                const encoded = JSON.stringify({parkings: result});
                res.header("Access-Control-Allow-Origin", "*");
                res.status(200).send(encoded);
            }

        });

        //This function return the parking requests in a zone
        app.get('/getParkingRequests', async (req, res) => {
            const zone = req.query.zone;
                if(zone) {
                    const result = await databasepg.getParkingRequestsFromZone(zone);
                    if(result instanceof Error) {
                        await res.status(400).send("Bad request");
                        return;
                    }
                    else {
                        const encoded = JSON.stringify({requests: result});
                        res.header("Access-Control-Allow-Origin", "*");
                        res.status(200).send(encoded);
                    }
                }
                else
                    res.status(400).send("Bad request");
        });

        //This function return the number of parkings in a zone
        app.get('/getParkingsFromZone', async (req, res) => {
            const zone = req.query.zone;
            if(zone) {
                const parkings = await databasepg.getParkingsFromZone(zone);
                const encoded = JSON.stringify({parkings: parkings});
                res.header("Access-Control-Allow-Origin", "*");
                res.status(200).send(encoded);
            }
            else {
                res.status(400).send("Bad request");
            }

        });

        /**
         * This function get the clusters data from dbscan algorithm
         */
        app.get('/dbscan', async (req, res) => {
            const epsilon = req.query.epsilon;
            const minPoints = req.query.minPoints;
            const dbscan = new clustering.DBSCAN();
            const data = await databasepg.getPointsParkingEvents();  
            if(epsilon && minPoints) {
                let vectors = new Array();
                for (let i = 0 ; i < data.length ; i++) {
                    vectors[i] = [data[i].x , data[i].y];
                }
                const clusters = dbscan.run(vectors, epsilon, minPoints);
                clusters_dict = {};
                for (let i = 0 ; i < clusters.length ; i++) {
                    let cluster = [];
                    for(let j = 0 ; j < clusters[i].length ; j++) {
                        cluster.push(vectors[clusters[i][j]]);
                    }
                    const centroid = await databasepg.computeMultipointCentroid(cluster);
                    clusters_dict[i] = {'cluster' : cluster, centroid : centroid};
                }
                const encoded = JSON.stringify(Object.values(clusters_dict));
                res.header("Access-Control-Allow-Origin", "*");
                return res.status(200).send(encoded);
            }
            else {
                res.header("Access-Control-Allow-Origin", "*");
                return res.status(400).send({'status' : 'Bad Request'});
            }
        });

        //This function get the clusters data from kmeans algorithm
        app.get('/kmeans', async (req, res) => {
            const size = req.query.size;
            const data = await databasepg.getPointsParkingEvents();
            res.header("Access-Control-Allow-Origin", "*");
            if(size) {
                let vectors = new Array();
                for (let i = 0 ; i < data.length ; i++) {
                    vectors[i] = [ data[i].x , data[i].y ];
                }             
                kmeans.clusterize(vectors, {k: size}, (err,result) => {
                    if (err) {
                        return res.status(200).send(JSON.stringify([]));
                    }
                    else {
                        const encoded = JSON.stringify(result);
                        return res.status(200).send(encoded);
                    }
                });
            }
            else {
                return res.status(400).send({'status' : 'Bad Request'});
            }
        });
        /*Return a dict with the points grouped by zone 
        *
        *   zone1 : [[x,y,nparking],[x,y,nparking]...]
        *   zone2 : [[x,y,nparking],[x,y,nparking]...]
        * */
        app.get('/heatmap', async (req, res) => {
            var data = await databasepg.getPointsParkingEventsGrouped();
            let pointsDict = {};
            for (let i = 0 ; i < data.length ; i++) {
                 //Transform the points array into a dict using zone as a key 
                if(pointsDict[data[i].zone] == null) pointsDict[data[i].zone] = [];
                    pointsDict[data[i].zone].push([data[i].x , data[i].y , data[i].nparking]);
            }
            res.header("Access-Control-Allow-Origin", "*");
            return res.status(200).send(JSON.stringify(pointsDict));
        });

        app.get('/e-chargers', async (req, res) => {  
            const result = await databasepg.getEChargers();
            if(result instanceof Error) {
                await res.status(400).send("Bad request");
                return;
            }
            else {
                const encoded = JSON.stringify({chargers: result});
                res.header("Access-Control-Allow-Origin", "*");
                return res.status(200).send(encoded);   
            }
        });
    }
}
