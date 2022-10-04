// external packages
const express = require('express');
require('dotenv').config();

// Start the webapp
const webApp = express();

// Webapp settings
webApp.use(express.urlencoded({
    extended: true
}));
webApp.use(express.json());

// Server Port
const PORT = process.env.PORT;

// Home route
webApp.get('/', (req, res) => {
    res.send(`Hello World.!`);
});

webApp.post('/webhook', (req, res) => {

    console.log(JSON.stringify(req.body, 2, ' '));
    console.log(req.body.queryResult.queryText);
    let msg = req.body.queryResult.queryText;
    let text = "tyw";
    if (msg == "help"){
        res.send({
            fulfillmentText: text
            
        });
    } 
});

// Start the server
webApp.listen(PORT, () => {
    console.log(`Server is up and running at ${PORT}`);
});