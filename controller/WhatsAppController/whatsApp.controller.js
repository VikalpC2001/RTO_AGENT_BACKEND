'use strict';
const asyncHandler = require('express-async-handler');
const axios=require("axios");
const pool = require('../../database');
require('dotenv').config();
const token = process.env.Meta_WA_accessToken;

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

const getWhtsappMsgData = async(req,res) =>{

    const receiptId = res.locals.id;
    console.log("local2",receiptId);
    const sql_getMsg_data = `SELECT UPPER(vehicle_registration_details.vehicleRegistrationNumber) AS vehicleRegistrationNumber, COALESCE(dealer_details.dealerFirmName,privateCustomerName) AS "Dealer/Customer", dealer_details.dealerWhatsAppNumber, rto_receipt_data.receiptURL as URL, vehicle_registration_details.clientWhatsAppNumber, DATE_FORMAT(appointmentDate, '%d-%M-%Y') AS appointmentDate FROM rto_receipt_data
                              LEFT JOIN vehicle_registration_details ON vehicle_registration_details.vehicleRegistrationId = rto_receipt_data.vehicleRegistrationId
                              LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                              WHERE rto_receipt_data.receiptId = '${receiptId}'`;
    pool.query(sql_getMsg_data,(err,data)=>{
        if(err) return res.status(404).send(err);
        var id = data[0].URL
        console.log(">>>>>>>>>>>>>",id);
    })
}

// const sendReceipte = asyncHandler(async(req, res) => {
//     try {

//         // const receiptId = res.locals.id;
//         // console.log("local2",receiptId);
//         // const sql_getMsg_data = `SELECT UPPER(vehicle_registration_details.vehicleRegistrationNumber) AS vehicleRegistrationNumber, COALESCE(dealer_details.dealerFirmName,privateCustomerName) AS "Dealer/Customer", dealer_details.dealerWhatsAppNumber, rto_receipt_data.receiptURL, vehicle_registration_details.clientWhatsAppNumber, DATE_FORMAT(appointmentDate, '%d-%M-%Y') AS appointmentDate FROM rto_receipt_data
//         //                          LEFT JOIN vehicle_registration_details ON vehicle_registration_details.vehicleRegistrationId = rto_receipt_data.vehicleRegistrationId
//         //                          LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
//         //                          WHERE rto_receipt_data.receiptId = '${receiptId}'`;
//         // pool.query(sql_getMsg_data,async(err,data) => {
//         //     if(err) return res.status(404).send(err);
//         //     // return res.status(200),
//         //     //        res.json(data);
//         //     const vehicleNumber = data[0].vehicleRegistrationNumber;
//         //     const pdfURL = data[0].URL;
            
//     // })
//         // await axios({
//         //     method:"POST",
//         //     url:"https://graph.facebook.com/v15.0/"+"110836215242868"+"/messages/",
//         //     data:{
//         //         messaging_product:"whatsapp",
//         //         to:"919898266144",
//         //         type:"document",
//         //      //    text:{
//         //      //        body:"Hi.. I'm jay, your message is "+msg_body
//         //      //    },
//         //         document: {
//         //          link: pdfURL,
//         //          caption: "Vehicle Number = "+vehicleNumber+"dealerName"
//         //        }
               
//         //     },
//         //     headers:{
//         //          'Authorization': 'Bearer '+token,
//         //         'Content-Type':"application/json"
//         //     }
//         // })
//         await axios({
//             method:"POST",
//             url:"https://graph.facebook.com/v15.0/"+"110836215242868"+"/messages/",
//             data:{
//                 messaging_product:"whatsapp",
//                 to:"919825312229",
//                 type:"document",
//              //    text:{
//              //        body:"Hi.. I'm jay, your message is "+msg_body
//              //    },
//                 document: {
//                  link: "https://drive.google.com/uc?export=view&id=1WUWMRx2g0JIfRNZjJWU1Bui7iuBph6XM",
//                  caption: "Vehicle Number = "+vehicleNumber+"dealerName"
//                }
               
//             },
//             headers:{
//                  'Authorization': 'Bearer '+token,
//                 'Content-Type':"application/json"
//             }
//         })
//         res.sendStatus(200)
//     // })
//     } catch (error) {
//                 console.error({error})
//         return res.sendStatus(500);
//     }
// })

module.exports = { meta_wa_callbackurl , getWhtsappMsgData };