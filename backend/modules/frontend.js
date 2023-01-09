const fs = require('fs');
const path = require('path');
const databasepg = require('./databasepg');

module.exports = {
    createRoutes: (app) => {
        //This function return a file saved in the server
        app.get('/getData', async (req, res) => {
            const data = req.query.data;
            if(data) {
                //check if file is present
                const filePath = path.join(__dirname, "/../files/" + data);
                if(fs.existsSync(filePath)) {
                    const file = fs.readFileSync(filePath, 'utf8');
                    res.status(200).send(file);
                    
                }
                else {
                    res.status(404).send("File not found");
                }
            }
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

        //This function return the number of parkings in a zone
        app.get('/getAllEventsFromZone', async (req, res) => {
            const zone = req.query.zone;
            if(zone) {
                const events = await databasepg.getAllEventsFromZone(zone);
                const encoded = JSON.stringify({events: events});
                res.header("Access-Control-Allow-Origin", "*");
                res.status(200).send(encoded);
            }
            else {
                res.status(400).send("Bad request");
            }

        });
    }
}

