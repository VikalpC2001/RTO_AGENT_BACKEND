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
const https = require('https')
const fs = require('fs');
const app = express()
const port = process.env.PORT
const axios = require('axios');
const cron = require('node-cron');

// Define your API endpoint
const apiUrl = 'https://rtoagentdms.com/api/whatsApprouter/autoMessageOnExpired';

// Schedule the API call every Morning 6 AM
cron.schedule('0 6 * * *', () => {
  axios.get(apiUrl)
    .then((response) => {
      console.log('API call successful:', response.data);
    })
    .catch((error) => {
      console.error('API call failed:', error);
    });
});

app.use(cors());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(bodyparser.urlencoded({ extended: false }))
app.use(bodyparser.json())

// app.use('/events',events);

app.use('/api/agentrouter', agentrouter);
app.use('/api/stateCityrouter', stateCityrouter);
app.use('/api/dealerrouter', dealerrouter);
app.use('/api/vehicleRegistrationrouter', vehicleRegistrationrouter);
app.use('/api/ddlVehiclePagerouter', ddlVehiclePagerouter);
app.use('/api/mobileApprouter', mobileApprouter);
app.use('/api/whatsApprouter', whatsApprouter);

app.use(notFound);
app.use(erroHandler);

app.listen(port, () => console.log(`Connecion suceesfull ${port}`)) 