const express = require('express');
const router = express.Router();
const {protect} = require("../../middlewares/authMiddlewares.js")

const ddlVehiclePageController = require('../../controller/ddlVehiclePageController/ddlVehiclePage.controller')

router.get('/getVehicleClass',protect,ddlVehiclePageController.getVehicleClass);
router.get('/getVehicleCategory',protect,ddlVehiclePageController.getVehicleCategory);
router.get('/getInsuranceDetails',protect,ddlVehiclePageController.getInsuranceDetails);



module.exports = router;