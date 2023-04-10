'use strict';
const asyncHandler = require('express-async-handler');
const axios=require("axios");
require('dotenv').config();


const meta_wa_callbackurl = (req, res) => {
    console.log(">>>")
    try {
        console.log('GET: Someone is pinging me!');
        console.log('reqToken',req.query['hub.verify_token']);
        console.log('envtoken',process.env.Meta_WA_VerifyToken);
        console.log('verify',process.env.Meta_WA_VerifyToken == req.query['hub.verify_token']);
        console.log('token',process.env.Meta_WA_VerifyToken === req.query['hub.verify_token']);
        let mode = req.query['hub.mode'];
        let token = req.query['hub.verify_token'];
        let challenge = req.query['hub.challenge'];

        console.log(">>>>dfsfsa");

        if (
            mode &&
            token &&
            mode === 'subscribe' &&
            process.env.Meta_WA_VerifyToken === token
        ) {
            return res.status(200).send(challenge);
        } else {
            return res.sendStatus(403);
        }

    } catch (error) {
        console.error({error})
        return res.sendStatus(500);
    }
}

const sendReceipte = asyncHandler(async(req, res) => {
    try {
        await axios({
            method:"POST",
            url:"https://graph.facebook.com/v15.0/"+"110836215242868"+"/messages/",
            data:{
                messaging_product:"whatsapp",
                to:"919898266144",
                type:"document",
             //    text:{
             //        body:"Hi.. I'm jay, your message is "+msg_body
             //    },
                document: {
                 link: "https://drive.google.com/uc?export=view&id=1j0SwOtanRKIBmcaJYq3n59Pc1KpYyyUt",
                 caption: "🖕🖕🖕🖕🖕🖕🖕🖕🖕"
               }
               
            },
            headers:{
                 'Authorization': 'Bearer '+token,
                'Content-Type':"application/json"
            }

        })
        res.sendStatus(200)
    } catch (error) {
                console.error({error})
        return res.sendStatus(500);
    }
})

module.exports = { sendReceipte , meta_wa_callbackurl };