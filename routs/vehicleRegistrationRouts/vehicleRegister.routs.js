const express = require('express');
const router = express.Router();
const {protect} = require("../../middlewares/authMiddlewares.js")

const vehicleRegistrationController = require('../../controller/vehicleRegistrationController/vehicleRegister.controller');

router.get('/getVehicleRegistrationDetails',vehicleRegistrationController.getVehicleRegistrationDetails);
router.post('/getVehicleRegistrationDetailsById',vehicleRegistrationController.getVehicleRegistrationDetailsById);
router.post('/getVehicleRegistrationDetailsByAgentId',protect,vehicleRegistrationController.getVehicleRegistrationDetailsByAgentId);
router.post('/addVehicleRegistrationDetails',protect,vehicleRegistrationController.addVehicleRegistrationDetails);
router.post('/updateVehicleRegistrationDetails',protect,vehicleRegistrationController.updateVehicleRegistrationDetails);

module.exports = router;