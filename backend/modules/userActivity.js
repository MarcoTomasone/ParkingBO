const databasepg = require("./databaseQueries");

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
                var charge_station = null;
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
                    else {
                        id_user = result.id_user;
                        if(result.charge_station[0].id != null)
                            charge_station = result.charge_station[0].id;
                    }
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
                    else{
                        id_user = result.id_user;
                        if(result.charge_station != undefined && result.charge_station[0].id != null)
                            charge_station = result.charge_station[0].id;
                    }
                }
                const encoded = JSON.stringify({id_user: id_user, charge_station: charge_station});
                res.status(200).send(encoded);
            } 
        });


        //This function return the number of parkings in a zone
        app.get('/getParkingsFromPosition', async (req, res) => {
            if(req.query.coordinates == null) {
                await res.status(400).send("Bad request");
                return;
            }
            else {
                const position = req.query.coordinates;
                const result = await databasepg.getParkingsInterpolation(position);
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
                    res.header("Access-Control-Allow-Origin", "*");
                    res.status(200).send(encoded);
                }
            }
        });

        app.post('/updateParkingForChargingStation', async (req, res) => {
            if(req.body.id_user == null || req.body.id_station == null) {
                await res.status(400).send("Bad request");
                return;
            }
            else {
                const id_user = req.body.id_user;
                const id_station = req.body.id_station;
                const result = await databasepg.update_parking_event_charging_station(id_user, id_station);
                
            }
        });


    },


}

