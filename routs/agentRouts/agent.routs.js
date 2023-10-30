const express = require('express')
const router = express.Router();
const { protect } = require("../../middlewares/authMiddlewares.js")

const agentController = require("../../controller/agentController/agentDetail.controller")

router.get('/getAgentDetails', protect, agentController.getAgentDetails);
router.post('/addAgentDetails', protect, agentController.addAgentDetails);
router.post('/removeAgentDetails', protect, agentController.removeAgentDetails);
router.post('/updateAgentDetails', protect, agentController.updateAgentDetails);
router.post('/authUser', agentController.authUser);
router.get('/CheckJwtTokenExpiredOrNot', agentController.CheckJwtTokenExpiredOrNot);

module.exports = router;