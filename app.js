const express = require('express');
const bodyparser = require('body-parser');
const mysql = require('mysql');
const dotenv = require('dotenv').config();
const agentrouter = require('./routs/agentRouts/agent.routs');
const dealerrouter = require('./routs/delearRouts/dealer.routs');
const stateCityrouter = require('./routs/stateAndCityRouts/stateCity.routs');
const vehicleRegistrationrouter = require('./routs/vehicleRegistrationRouts/vehicleRegister.routs');
const ddlVehiclePagerouter = require('./routs/ddlVehiclePageRouts/ddlVehiclePage.routs');
const mobileApprouter = require("./routs/mobileAppRouts/mobileApp.routs")
const whatsApprouter = require('./routs/whatsAppRouts/whatsApp.routs')
const cors = require('cors');
const { notFound, erroHandler } = require('./middlewares/errorMiddleware');
const https = require ('https')
const fs = require('fs');
const app = express()
const port = process.env.PORT

const key = fs.readFileSync('./private.key');
const cert = fs.readFileSync('./103.177.194.54.chained+root.crt');

// app.get('/.well-known/pki-validation/24B5BA6E0DD80C41F108F7E409271914.txt',(req,res)=>{
//   res.sendFile('/Users/vikalp/Desktop/RTO_AGENT_BACKEND/24B5BA6E0DD80C41F108F7E409271914.txt')
// })

const cred = {
  key,
  cert
}

const httpsServer = https. createServer (cred, app)

app.use(cors());

  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });
app.use(bodyparser.urlencoded({extended: false}))
app.use(bodyparser.json())

// app.use('/events',events);

app.use('/agentrouter',agentrouter);
app.use('/stateCityrouter',stateCityrouter);
app.use('/dealerrouter',dealerrouter);
app.use('/vehicleRegistrationrouter',vehicleRegistrationrouter);
app.use('/ddlVehiclePagerouter',ddlVehiclePagerouter);
app.use('/mobileApprouter',mobileApprouter);
app.use('/whatsApprouter',whatsApprouter);

app.use(notFound);
app.use(erroHandler); 

//Listen or Enviroment port or 5000
httpsServer. listen (8443)
app.listen(port ,() => console.log(`Connecion suceesfull ${port}`)) 