const express = require('express');
const router = express.Router();
const {protect} = require("../../middlewares/authMiddlewares.js");

const vehicleRegistrationController = require('../../controller/vehicleRegistrationController/vehicleRegister.controller');
const formController = require("../../controller/formController/ttoForm.Controller");
const rtoReceipt = require("../../controller/rtoReceiptController/rtoReceipt.controller");

router.get('/getVehicleRegistrationDetails',protect,vehicleRegistrationController.getVehicleRegistrationDetails);
router.get('/getVehicleRegistrationDetailsById',protect,vehicleRegistrationController.getVehicleRegistrationDetailsById);
router.get('/getVehicleRegistrationDetailsBydealerId',protect,vehicleRegistrationController.getVehicleRegistrationDetailsBydealerId);
router.get('/getVehicleRegistrationDetailsByAgentId',protect,vehicleRegistrationController.getVehicleRegistrationDetailsByAgentId);
router.post('/addVehicleRegistrationDetails',protect,vehicleRegistrationController.addVehicleRegistrationDetails,formController.genrateTTOform);
router.post('/removeVehicleRegistrationDetails',protect,vehicleRegistrationController.removeVehicleRegistrationDetails);
router.post('/updateVehicleRegistrationDetails',protect,vehicleRegistrationController.updateVehicleRegistrationDetails);
router.post('/uploadReceipt',rtoReceipt.uploadReceipt);

module.exports = router;