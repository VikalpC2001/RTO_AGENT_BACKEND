'use strict';
const router = require('express').Router();
const asyncHandler = require('express-async-handler');
const axios=require("axios");
const fs = require('fs');
const { type } = require('os');
require('dotenv').config();
// import t from '../document_recipt/'

const token=process.env.Meta_WA_accessToken;
console.log("token",token);
// const WhatsappCloudAPI = require('../whatsappcloudapi_wrapper');
// const Whatsapp = new WhatsappCloudAPI({
//     accessToken: process.env.Meta_WA_accessToken,
//     senderPhoneNumberId: process.env.Meta_WA_SenderPhoneNumberId,
//     WABA_ID: process.env.Meta_WA_wabaId, 
//     graphAPIVersion: 'v15.0'
// });

router.get('/hello',(req,res)=>{
    console.log(__dirname)
    // var data =fs.readFileSync('/Users/jayparmar/Desktop/whatsapp/document_recipt/recipte_test.pdf');
    var data =fs.readFileSync('/home/ubuntu/whatsapp_api_test/document_recipt/recipte_test.pdf');
res.contentType("application/pdf");
res.send(data);
    // res.sendFile("/home/ubuntu/whatsapp_api_test/document_recipt/recipte_test.pdf")
})

router.get('/meta_wa_callbackurl', (req, res) => {
    console.log(">>>")
    try {
        console.log('GET: Someone is pinging me!');
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
});



router.post('/meta_wa_callbackurl', asyncHandler(async(req, res) => {
    console.log(">>><<<")
    try {
        console.log('POST: Someone is pinging me!');

    //     let data = Whatsapp.parseMessage(req.body);

    //     if (data && data.isMessage) {
    //         let incomingMessage = data.message;
    //         let recipientPhone = incomingMessage.from.phone; // extract the phone number of sender
    //         let recipientName = incomingMessage.from.name;
    //         let typeOfMsg = incomingMessage.type; // extract the type of message (some are text, others are images, others are responses to buttons etc...)
    //         let message_id = incomingMessage.message_id; // extract the message id

    //         if (typeOfMsg === 'text_message') {
    //             await Whatsapp.sendSimpleButtons({
    //                 message: `Hey ${recipientName}, \nYou are speaking to a chatbot.\nWhat do you want to do next?`,
    //                 recipientPhone: recipientPhone, 
    //                 listOfButtons: [
    //                     {
    //                         title: 'Send PDF',
    //                         id: 'send_pdf',
    //                     },
    //                 ],
    //             });
    //         }

    //         if (typeOfMsg === 'simple_button_message') {
    //             let button_id = incomingMessage.button_reply.id;
            
    //             if (button_id === 'send_pdf') {
    //                 await Whatsapp.sendDocument({
    //                     recipientPhone: "9825312229",
    //                     file_path: `../document_recipt/recipte.pdf`,
    //                 });
    //             }
    //         };
    // }

    let body_param=req.body;

    console.log(JSON.stringify(body_param,null,2));

    if(body_param.object){
        console.log("inside body param");
        if(body_param.entry && 
            body_param.entry[0].changes && 
            body_param.entry[0].changes[0].value.messages && 
            body_param.entry[0].changes[0].value.messages[0]  
            ){
               let phon_no_id=body_param.entry[0].changes[0].value.metadata.phone_number_id;
               let from = body_param.entry[0].changes[0].value.messages[0].from; 
               let msg_body = body_param.entry[0].changes[0].value.messages[0].text.body;

               console.log("phone number "+phon_no_id);
               console.log("from "+from);
               console.log("boady param "+msg_body);
                
              await axios({
                   method:"POST",
                   url:"https://graph.facebook.com/v15.0/"+phon_no_id+"/messages/",
                   data:{
                       messaging_product:"whatsapp",
                       to:from,
                       type:"document",
                    //    text:{
                    //        body:"Hi.. I'm jay, your message is "+msg_body
                    //    },
                       document: {
                        link: "https://drive.google.com/uc?export=view&id=1j0SwOtanRKIBmcaJYq3n59Pc1KpYyyUt",
                        caption: "your-document-caption"
                      }
                      
                   },
                   headers:{
                        'Authorization': 'Bearer '+token,
                       'Content-Type':"application/json"
                   }

               })
               res.sendStatus(200)
            }else{
                res.sendStatus(404);
            }

    }

        // return res.sendStatus(200);
    } catch (error) {
                console.error({error})
        return res.sendStatus(500);
    }
}));

module.exports = router;