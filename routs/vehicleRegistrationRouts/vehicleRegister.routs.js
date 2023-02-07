const express = require('express');
const router = express.Router();
const {protect} = require("../../middlewares/authMiddlewares.js")

const vehicleRegistrationController = require('../../controller/vehicleRegistrationController/vehicleRegister.controller');

router.get('/getVehicleDetail',vehicleRegistrationController.getVehicleDetail);
router.post('/getVehicleDetailsById',vehicleRegistrationController.getVehicleDetailsById);
router.post('/getvehicleDetailsByAgentId',protect,vehicleRegistrationController.getvehicleDetailsByAgentId);
router.post('/addVehicleRegistrationDetails',protect,vehicleRegistrationController.addVehicleRegistrationDetails);

module.exports = router;