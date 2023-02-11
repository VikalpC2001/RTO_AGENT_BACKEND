const express = require('express');
const router = express.Router();
const {protect} = require("../../middlewares/authMiddlewares.js")

const insuranceController = require("../../controller/insuranceController/insurance.Controller");

router.get('/getInsuranceDetails',insuranceController.getInsuranceDetails);


module.exports = router;