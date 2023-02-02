const express = require('express');
const router = express.Router();
const {protect} = require("../../middlewares/authMiddlewares.js")

const dealerController = require("../../controller/dealerController/dealerDetails.controller")

router.get('/getDealerDetails',protect,dealerController.getDealerDetails);
router.post('/addDealerDetails',protect,dealerController.addDealerDetails);
router.post('/getDealerDetailsByAgentId',protect,dealerController.getDealerDetailsByAgentId);
router.post('/removeDealerDetails',protect,dealerController.removeDealerDetails);
router.post('/getDealerDetailsById',protect,dealerController.getDealerDetailsById);
router.post('/updateDealerDetails',protect,dealerController.updateDealerDetails);

module.exports = router;