const express = require('express')
const router = express.Router();

const agentController = require("../../controller/agentController/agentDetail.controller")

router.get('/getAgentDetails',agentController.getAgentDetails);
router.post('/addAgentDetails',agentController.addAgentDetails);
router.post('/removeAgentDetails',agentController.removeAgentDetails);
router.post('/updateAgentDetails',agentController.updateAgentDetails);

module.exports = router;