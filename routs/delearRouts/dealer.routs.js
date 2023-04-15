const express = require('express');
const router = express.Router();
const {protect} = require("../../middlewares/authMiddlewares.js")

const dealerController = require("../../controller/dealerController/dealerDetails.controller")

router.get('/getDealerDetails',protect,dealerController.getDealerDetails);
router.post('/addDealerDetails',protect,dealerController.addDealerDetails);
router.get('/getDealerDetailsByAgentId',protect,dealerController.getDealerDetailsByAgentId);
router.delete('/removeDealerDetails',protect,dealerController.removeDealerDetails);
router.get('/getDealerDetailsById',protect,dealerController.getDealerDetailsById);
router.get('/ddlDealerByAgentId',protect,dealerController.ddlDealerByAgentId);
router.post('/updateDealerDetails',protect,dealerController.updateDealerDetails);

module.exports = router;