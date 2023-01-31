const express = require('express');
const router = express.Router();

const dealerController = require("../../controller/dealerController/dealerDetails.controller")

router.get('/getDealerDetails',dealerController.getDealerDetails);
router.post('/addDealerDetails',dealerController.addDealerDetails);
router.post('/getDealerDetailsByAgentId',dealerController.getDealerDetailsByAgentId);
router.post('/removeDealerDetails',dealerController.removeDealerDetails);
router.post('/getDealerDetailsById',dealerController.getDealerDetailsById);
router.post('/updateDealerDetails',dealerController.updateDealerDetails);

module.exports = router;