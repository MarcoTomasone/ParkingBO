const fs = require('fs');
const path = require('path');

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
        app.get('/getParkingsFromZone', async (req, res) => {
            console.log("in get parkings from zone");
            if(req.query.zone == null) {
                await res.status(400).send("Bad request");
                return;
            }
            else {
                const zone = req.query.zone;
                const result = await databasepg.getParkingsFromZone(zone);
                if(result instanceof Error) {
                    await res.status(400).send("Bad request");
                    return;
                }
                else {
                    const encoded = JSON.stringify({parkings: result});
                    res.status(200).send(encoded);
                }
            }
        });
    }
}

