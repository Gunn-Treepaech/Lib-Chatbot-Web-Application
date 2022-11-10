// external packages
// npm install googleapis@105 @google-cloud/local-auth@2.1.0 --save
const express = require("express");
const {google} = require('googleapis');
const keys = require('./keys.json');

require("dotenv").config();
//--------------------------------------------------------------------------
// Website
// https://developers.google.com/sheets/api/quickstart/nodejs
// https://www.youtube.com/watch?v=MiPpQzW_ya0
// https://learn.microsoft.com/en-us/office/dev/add-ins/excel/excel-add-ins-tables
// https://medium.com/linedevth/%E0%B9%80%E0%B8%9E%E0%B8%B4%E0%B9%88%E0%B8%A1%E0%B8%84%E0%B8%A7%E0%B8%B2%E0%B8%A1%E0%B8%99%E0%B9%88%E0%B8%B2%E0%B8%AA%E0%B8%99%E0%B9%83%E0%B8%88%E0%B9%83%E0%B8%AB%E0%B9%89-line-bot-%E0%B8%82%E0%B8%AD%E0%B8%87%E0%B8%84%E0%B8%B8%E0%B8%93%E0%B8%94%E0%B9%89%E0%B8%A7%E0%B8%A2%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%AA%E0%B9%88%E0%B8%87%E0%B8%82%E0%B9%89%E0%B8%AD%E0%B8%84%E0%B8%A7%E0%B8%B2%E0%B8%A1%E0%B8%A3%E0%B8%B9%E0%B8%9B%E0%B9%81%E0%B8%9A%E0%B8%9A%E0%B8%95%E0%B9%88%E0%B8%B2%E0%B8%87%E0%B9%86%E0%B8%9C%E0%B9%88%E0%B8%B2%E0%B8%99-dialogflow-6ec1a9c2c05e
//-------------------------------------------------------------------------

// Start the webapp
const webApp = express();

// Webapp settings
webApp.use(
  express.urlencoded({
    extended: true,
  })
);
webApp.use(express.json());

// Server Port
const PORT = process.env.PORT;

// Home route
webApp.get("/", (req, res) => {
  res.send(`Welcome To Lib-ChatBot!!!`);
});

webApp.post("/webhook", (req, res) => {
  addToSheet(req);
});

// Start the server
webApp.listen(PORT, () => {
  console.log(`Server is up and running at ${PORT}`);
});

async function addToSheet(request){
  // Get answer form Dialogflow
  let answer = request.body.queryResult.fulfillmentText;
//console.log(answer);
  // Sheet API --------------------------------------------------------------
  const client = new google.auth.JWT(
    keys.client_email,
    null,
    keys.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
  );

  client.authorize(function(err,tokens){
    if(err){
        console.log(err);
        return;
    } else {
        console.log('Successfully connected to Sheet!');
        gsrun(client);
    }
  });

  async function gsrun(cl){
    const gsapi = google.sheets({version:'v4', auth: cl});
    const optSheet1  = {
      spreadsheetId:'1FMG9gwqwcboqjGctMQ1tQBc5xt6cyL7X5hK2O6Tg70k',
      range:'Sheet1!A2:B122'
    }
    const optSheet2  = {
      spreadsheetId:'1FMG9gwqwcboqjGctMQ1tQBc5xt6cyL7X5hK2O6Tg70k',
      range:'Sheet2!A2:B122'
    }
    let dataSheet1 = await gsapi.spreadsheets.values.get(optSheet1);
    let dataSheet2 = await gsapi.spreadsheets.values.get(optSheet2);
    let dataArraySheet1 = dataSheet1.data.values;
    let dataArraySheet2 = dataSheet2.data.values;
    //console.log(dataArraySheet1);
    //console.log(dataArraySheet2);

// Check Answer --------------------------------------------------------------
    //console.log(answer);
    let numberOfAnswer;
    let testV1;
    //console.log(dataArraySheet2[1][1]);
    for (let i = 0; i < dataArraySheet2.length; i++) {
      //console.log(dataArraySheet2[i]);
      let AnsweQ = dataArraySheet2[i][1];
      if (answer == AnsweQ){
        numberOfAnswer = i;
        testV1 = dataArraySheet1[i][1];
        //console.log(i);
      }
    }
// ---------------------------------------------------------------------------
// Update NumberOfTimesAsked -------------------------------------------------
    let NewdataSheet1 = await gsapi.spreadsheets.values.get(optSheet1);
    let NewdataArraySheet1 = NewdataSheet1.data.values;
    let cValue = NewdataArraySheet1[numberOfAnswer][1];
    //console.log(testV1);
    //console.log(cValue);
    if (testV1 != cValue){
      let upDateAsked = Number(cValue) + 1;
      dataArraySheet1[numberOfAnswer][1] = upDateAsked;
    } else {
      let asked = dataArraySheet1[numberOfAnswer][1];
      let upDateAsked = Number(asked) + 1;
      dataArraySheet1[numberOfAnswer][1] = upDateAsked;
    }
    const updateOptions  = {
      spreadsheetId:'1FMG9gwqwcboqjGctMQ1tQBc5xt6cyL7X5hK2O6Tg70k',
      range:'Sheet1!A2',
      valueInputOption: 'USER_ENTERED',
      resource: {values: dataArraySheet1}
    }
    let resSheet = await gsapi.spreadsheets.values.update(updateOptions);
    //console.log(resSheet);
// ---------------------------------------------------------------------------
  }
}