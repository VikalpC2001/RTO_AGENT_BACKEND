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
const cert = fs.readFileSync('./13.53.171.161_cert.crt');

// app.get('/.well-known/pki-validation/3B1826F0A0EA5F045A05513B1E3F35CD.txt',(req,res)=>{
//   res.sendFile('/home/ec2-user/RTO_AGENT_BACKEND/3B1826F0A0EA5F045A05513B1E3F35CD.txt')
// })

const cred = {
  key,
  cert
}

const httpsServer = https. createServer (cred, app)
    httpsServer. listen (8443)

app.use(cors({
    credentials: true, origin: [
      "http://localhost:3000",
      "http://localhost:5000"
    ],
    exposedHeaders: ["set-cookie"],
  }));

app.use(bodyparser.urlencoded({extended: false}))
app.use(bodyparser.json())

// app.use('/events',events);

app.use('/agentrouter',agentrouter);
app.use('/stateCityrouter',stateCityrouter);
app.use('/dealerrouter',dealerrouter);
app.use('/vehicleRegistrationrouter',vehicleRegistrationrouter);
app.use('/ddlVehiclePagerouter',ddlVehiclePagerouter);
app.use('/mobileApprouter',mobileApprouter);
app.use('/',whatsApprouter);

app.use(notFound);
app.use(erroHandler); 
//Listen or Enviroment port or 5000
app.listen(port ,() => console.log(`Connecion suceesfull ${port}`)) 