module.exports = {
    createRoutes: (app) => {
        app.post('/sendTransition', (req, res) => {
            const transition = req.body.type;
            console.log(transition);
            if(!activity) 
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

    }
}