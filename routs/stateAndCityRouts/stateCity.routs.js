const express = require('express');
const router = express.Router();
const {protect} = require("../../middlewares/authMiddlewares.js")

const stateCityController = require("../../controller/stateAndCityController/stateCity.controller");

router.get('/getstateDetails',protect,stateCityController.getStateDetails);
router.get('/getcityDetails',protect,stateCityController.getCityDetails);
router.get('/getCityDetailswithRTOcode',protect,stateCityController.getCityDetailswithRTOcode);
router.get('/getRTOcityDetails',protect,stateCityController.getRTOcityDetails);

module.exports = router;