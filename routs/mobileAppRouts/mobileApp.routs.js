const express = require('express')
const router = express.Router();
const {protect} = require("../../middlewares/authMiddlewares.js");

const mobileAppController = require("../../controller/mobileAppController/mobileApp.controller")

router.get('/getBookList',protect,mobileAppController.getBookList);
router.get('/getDealerList',protect,mobileAppController.getDealerList);
router.get('/getBookbyDealerId',protect,mobileAppController.getBookbyDealerId);
router.get('/getInsuranceExpiredBookList',protect,mobileAppController.getInsuranceExpiredBookList);


module.exports = router;