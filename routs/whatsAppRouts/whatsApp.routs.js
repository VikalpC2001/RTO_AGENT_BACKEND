'use strict';
const router = require('express').Router();
require('dotenv').config();


const whatsAppController = require('../../controller/WhatsAppController/whatsApp.controller');

router.get('/meta_wa_callbackurl',whatsAppController.sendReceipte);
router.post('/sendReceipte',whatsAppController.sendReceipte);

module.exports = router;