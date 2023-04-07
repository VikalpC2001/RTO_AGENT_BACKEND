const express = require('express');
const router = express.Router();
const {protect} = require("../../middlewares/authMiddlewares.js");

const vehicleRegistrationController = require('../../controller/vehicleRegistrationController/vehicleRegister.controller');
const formController = require("../../controller/formController/ttoForm.Controller");
const rtoReceipt = require("../../controller/rtoReceiptController/rtoReceipt.controller");

router.get('/getListOfVehicleRegistrationDetails',protect,vehicleRegistrationController.getListOfVehicleRegistrationDetails);
router.get('/getVehicleRegistrationDetailsById',protect,vehicleRegistrationController.getVehicleRegistrationDetailsById);
router.get('/getVehicleRegistrationDetailsBydealerId',protect,vehicleRegistrationController.getVehicleRegistrationDetailsBydealerId);
router.post('/addVehicleRegistrationDetails',protect,vehicleRegistrationController.addVehicleRegistrationDetails,formController.genrateTTOform);
router.delete('/removeVehicleRegistrationDetails',protect,vehicleRegistrationController.removeVehicleRegistrationDetails);
router.post('/updateVehicleRegistrationDetails',protect,vehicleRegistrationController.updateVehicleRegistrationDetails);
router.post('/uploadReceipt',rtoReceipt.uploadReceipt);
router.get('/exportExcelSheetForVehicleDetails',protect,vehicleRegistrationController.exportExcelSheetForVehicleDetails);
router.post('/moveToComplete',vehicleRegistrationController.moveToComplete);
router.get('/WhatsAppHyy',vehicleRegistrationController.WhatsAppHyy);

module.exports = router;