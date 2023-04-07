const express = require('express')
const router = express.Router();

const mobileAppController = require("../../controller/mobileAppController/mobileApp.controller")

router.get('/getBookList',mobileAppController.getBookList);
router.get('/getDealerList',mobileAppController.getDealerList);


module.exports = router;