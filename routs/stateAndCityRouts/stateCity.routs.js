const express = require('express');
const router = express.Router();

const stateCityController = require("../../controller/stateAndCityController/stateCity.controller");

router.get('/getstateDetails',stateCityController.getStateDetails);
router.get('/getcityDetails',stateCityController.getCityDetails);
router.get('/getCityDetailswithRTOcode',stateCityController.getCityDetailswithRTOcode);

module.exports = router;