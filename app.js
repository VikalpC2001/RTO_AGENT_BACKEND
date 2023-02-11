const express = require('express');
const bodyparser = require('body-parser');
const mysql = require('mysql');
const dotenv = require('dotenv').config()
const agentrouter = require('./routs/agentRouts/agent.routs');
const dealerrouter = require('./routs/delearRouts/dealer.routs');
const stateCityrouter = require('./routs/stateAndCityRouts/stateCity.routs');
const formrouter = require('./routs/formRouts/form.routs');
const vehicleRegisterrouter = require('./routs/vehicleRegistrationRouts/vehicleRegister.routs');
const insurancerouter = require('./routs/insuranceRouts/insurance.routs');
const cors = require('cors');
const { notFound, erroHandler } = require('./middlewares/errorMiddleware');

const app = express()
const port = process.env.PORT

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
app.use('/formrouter',formrouter);
app.use('/vehicleRegisterrouter',vehicleRegisterrouter);
app.use('/insurancerouter',insurancerouter);

app.use(notFound);
app.use(erroHandler); 
//Listen or Enviroment port or 5000
app.listen(port ,() => console.log(`Connecion suceesfull ${port}`)) 