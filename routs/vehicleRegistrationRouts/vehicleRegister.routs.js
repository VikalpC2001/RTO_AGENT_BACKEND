const express = require('express');
const router = express.Router();
const {protect} = require("../../middlewares/authMiddlewares.js")

const vehicleRegistrationController = require('../../controller/vehicleRegistrationController/vehicleRegister.controller');
const formController = require("../../controller/formController/ttoForm.Controller")

router.get('/getVehicleRegistrationDetails',vehicleRegistrationController.getVehicleRegistrationDetails);
router.post('/getVehicleRegistrationDetailsById',vehicleRegistrationController.getVehicleRegistrationDetailsById);
router.get('/getVehicleRegistrationDetailsBydealerId',protect,vehicleRegistrationController.getVehicleRegistrationDetailsBydealerId);
router.post('/getVehicleRegistrationDetailsByAgentId',protect,vehicleRegistrationController.getVehicleRegistrationDetailsByAgentId);
router.post('/addVehicleRegistrationDetails',protect,vehicleRegistrationController.addVehicleRegistrationDetails,formController.genrateTTOform);
router.post('/removeVehicleRegistrationDetails',protect,vehicleRegistrationController.removeVehicleRegistrationDetails);
router.post('/updateVehicleRegistrationDetails',protect,vehicleRegistrationController.updateVehicleRegistrationDetails);

module.exports = router;