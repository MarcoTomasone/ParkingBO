const databasepg = require("./databasepg");

module.exports = {
    createRoutes: (app) => {
        app.post('/sendTransition', async (req, res) => {
            if(req.body.type == null || req.body.position == null) {
                await res.status(400).send("Bad request");
                return;
            }
            else {
                let id_user = req.body.id_user;
                const parking_type = req.body.type;
                const position = req.body.position.coordinates;
                //if user is not in the database, insert it
                if(id_user == null) {
                    const result = await databasepg.insert_activity(parking_type, position);
                    if(result instanceof Error) {
                        //if the user is not in a parking zone, return an error
                        if(result.message == "Zone not found")
                            await res.status(404).send("User is not in a parking zone");
                        else
                            await res.status(400).send("Bad request");
                        return;
                    }
                    else
                        id_user = result; 
                }
                //else update it
                else {
                    const result = await databasepg.update_activity(id_user, parking_type, position);
                    if(result instanceof Error) {
                        //if the user is not in a parking zone, return an error
                        if(result.message == "Zone not found")
                            await res.status(404).send("User is not in a parking zone");
                        else
                            await res.status(400).send("Bad request");
                        return;
                    }
                    else
                        id_user = result;
                }
                const encoded = JSON.stringify({id_user: id_user});
                res.status(200).send(encoded);
            } 
        });


        //This function return the number of parkings in a zone
        app.get('/getParkings', async (req, res) => {
            if(req.query.coordinates == null) {
                await res.status(400).send("Bad request");
                return;
            }
            else {
                const position = req.query.coordinates;
                const result = await databasepg.getParkings(position);
                if(result instanceof Error) {
                    //if the user is not in a parking zone, return an error
                    if(result.message == "Zone not found")
                        await res.status(404).send("User is not in a parking zone");
                    else
                        await res.status(400).send("Bad request");
                    return;
                }
                else {
                    const encoded = JSON.stringify({parkings: result});
                    res.status(200).send(encoded);
                }
            }
        });
    },

}

