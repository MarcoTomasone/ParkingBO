module.exports = {
    createRoutes: (app) => {
        app.post('/sendActivity', (req, res) => {
            const activity = req.body;
            console.log(activity);
            if(!activity) 
                res.status(400).send({ message: "Failed to send user activity" });
            else
                res.status(200).end();           
        });

    }
}