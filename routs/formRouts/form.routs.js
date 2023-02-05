const express = require('express');
const router = express.Router();

const formController = require("../../controller/formController/ttoForm.Controller");

router.post('/genrateTTOform',formController.genrateTTOform);

module.exports = router;