const express = require('express');
const router = express.Router();

const stateCityController = require("../../controller/stateAndCityController/stateCity.controller");

router.get('/getstateDetails',stateCityController.getStateDetails);
router.get('/getcityDetails',stateCityController.getCityDetails);

module.exports = router;