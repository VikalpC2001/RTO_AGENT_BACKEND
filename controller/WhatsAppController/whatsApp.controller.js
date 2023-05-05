'use strict';
const asyncHandler = require('express-async-handler');
const axios=require("axios");
const pool = require('../../database');
require('dotenv').config();
const token = process.env.Meta_WA_accessToken;
const phoneNumberId = process.env.Meta_WA_SenderPhoneNumberId;

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

const sendReceipte = asyncHandler(async(req, res) => {
    try {

        const receiptId = res.locals.id;
        console.log("local2",receiptId);
        const sql_getMsg_data = `SELECT UPPER(vehicle_registration_details.vehicleRegistrationNumber) AS vehicleRegistrationNumber, UPPER(vehicle_registration_details.vehicleMake) AS vehicleMake ,UPPER(vehicle_registration_details.vehicleModel) AS vehicleModel,COALESCE(dealer_details.dealerFirmName,privateCustomerName) AS "Dealer/Customer", dealer_details.dealerWhatsAppNumber AS dealerWhatsappNumber, rto_receipt_data.receiptURL as URL, vehicle_registration_details.clientWhatsAppNumber AS clientWhatsAppNumber FROM rto_receipt_data
                                 LEFT JOIN vehicle_registration_details ON vehicle_registration_details.vehicleRegistrationId = rto_receipt_data.vehicleRegistrationId
                                 LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                 WHERE rto_receipt_data.receiptId = '${receiptId}'`;
        pool.query(sql_getMsg_data,async(err,data) => {
            if(err) return res.status(404).send(err);
            // return res.status(200),
            //        res.json(data);
            const vehicleNumber = data[0].vehicleRegistrationNumber;
            const pdfURL = data[0].URL;
            const vehicleMake = data[0].vehicleMake;
            const vehicleModel = data[0].vehicleModel;
            const dealerWhatsappNumber = data[0].dealerWhatsappNumber;
            const clientWhatsAppNumber = data[0].clientWhatsAppNumber;
            console.log("pdfffffff",data[0].URL)
            const url = `https://graph.facebook.com/v16.0/${phoneNumberId}/messages/`;
            console.log(">>>>>><><><???",url);
            
        await axios({
            method:"POST",
            url:`https://graph.facebook.com/v16.0/${phoneNumberId}/messages/`,
            data:{
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": "91"+dealerWhatsappNumber,
                "type": "template",
                "template": {
                  "name": "rtowithnumber",
                  "language": {
                    "code": "en"
                  },
                  "components": [
                    {
                      "type": "header",
                      "parameters": [
                        {
                          "type": "document",
                          "document": {
                            "link": pdfURL,
                            "filename":vehicleNumber
                          }
                        }
                      ]
                    },
                    {
                      "type":"body",
                      "parameters":[
                        {
                          "type":"text",
                          "text":vehicleNumber
                        },
                        {
                          "type":"text",
                          "text":vehicleMake
                        },
                        {
                          "type":"text",
                          "text":vehicleModel
                        },
                      ]
                    }
                  ]
                }
              },
            headers:{
                 'Authorization': 'Bearer '+token,
                'Content-Type':"application/json"
            }
        }).then(async(resp)=>{
           await axios({
            method:"POST",
            url:`https://graph.facebook.com/v16.0/${phoneNumberId}/messages/`,
            data:{
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": "91"+clientWhatsAppNumber,
                "type": "template",
                "template": {
                  "name": "rtowithnumber",
                  "language": {
                    "code": "en"
                  },
                  "components": [
                    {
                      "type": "header",
                      "parameters": [
                        {
                          "type": "document",
                          "document": {
                            "link": pdfURL,
                            "filename":vehicleNumber
                          }
                        }
                      ]
                    },
                    {
                      "type":"body",
                      "parameters":[
                        {
                          "type":"text",
                          "text":vehicleNumber
                        },
                        {
                          "type":"text",
                          "text":vehicleMake
                        },
                        {
                          "type":"text",
                          "text":vehicleModel
                        },
                      ]
                    }
                  ]
                }
              },
            headers:{
                 'Authorization': 'Bearer '+token,
                'Content-Type':"application/json"
            }
        }).then((resp)=>{
            console.log(resp);
            res.sendStatus(200)
       })
       .catch((error)=>{
        console.log(error)
        res.send(error)
       })
        })
        .catch((error)=>{
         console.log(error)
         res.send(error)
        })
    })
    } catch(error) {
                console.error({error})
        return res.sendStatus(500);
    }
})

const sendReceiptOnWapp = (req,res) => {
    const vehicleRegistrationId = req.query.vehicleRegistrationId;
    const sql_query_getReceiptId = `SELECT receiptId FROM rto_receipt_data WHERE vehicleRegistrationId = '${vehicleRegistrationId}' AND receiptCreationDate = (SELECT MAX(receiptCreationDate) FROM rto_receipt_data WHERE vehicleRegistrationId = '${vehicleRegistrationId}');`
    pool.query(sql_query_getReceiptId,(err,data)=>{
        if(err) return res.status(404).send(err);
        console.log(":::",data[0]['receiptId']);
        const receipteId = data[0]['receiptId'];

         try {
        const sql_getMsg_data = `SELECT UPPER(vehicle_registration_details.vehicleRegistrationNumber) AS vehicleRegistrationNumber, UPPER(vehicle_registration_details.vehicleMake) AS vehicleMake ,UPPER(vehicle_registration_details.vehicleModel) AS vehicleModel,COALESCE(dealer_details.dealerFirmName,privateCustomerName) AS "Dealer/Customer", dealer_details.dealerWhatsAppNumber AS dealerWhatsappNumber, rto_receipt_data.receiptURL as URL, vehicle_registration_details.clientWhatsAppNumber AS clientWhatsAppNumber FROM rto_receipt_data
                                 LEFT JOIN vehicle_registration_details ON vehicle_registration_details.vehicleRegistrationId = rto_receipt_data.vehicleRegistrationId
                                 LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                 WHERE rto_receipt_data.receiptId = '${receipteId}'`;
        pool.query(sql_getMsg_data,async(err,data) => {
            if(err) return res.status(404).send(err);
            // return res.status(200),
            //        res.json(data);
            const vehicleNumber = data[0].vehicleRegistrationNumber ? data[0].vehicleRegistrationNumber : null;
            const pdfURL = data[0].URL;
            const vehicleMake = data[0].vehicleMake ? data[0].vehicleMake : null;
            const vehicleModel = data[0].vehicleModel ? data[0].vehicleModel : null;
            const dealerWhatsappNumber = data[0].dealerWhatsappNumber ? data[0].dealerWhatsappNumber : "9825246338";
            const clientWhatsAppNumber = data[0].clientWhatsAppNumber ? data[0].clientWhatsAppNumber: "9825246338";
            console.log("pdfffffff",data[0].URL)
            const url = `https://graph.facebook.com/v16.0/${phoneNumberId}/messages/`;
            console.log(">>>>>><><><???",url);
            // res.send(data)
            await axios({
              method:"POST",
              url:`https://graph.facebook.com/v16.0/${phoneNumberId}/messages/`,
              data:{
                  "messaging_product": "whatsapp",
                  "recipient_type": "individual",
                  "to": "91"+dealerWhatsappNumber,
                  "type": "template",
                  "template": {
                    "name": "rtowithnumber",
                    "language": {
                      "code": "en"
                    },
                    "components": [
                      {
                        "type": "header",
                        "parameters": [
                          {
                            "type": "document",
                            "document": {
                              "link": pdfURL,
                              "filename":vehicleNumber
                            }
                          }
                        ]
                      },
                      {
                        "type":"body",
                        "parameters":[
                          {
                            "type":"text",
                            "text":vehicleNumber
                          },
                          {
                            "type":"text",
                            "text":vehicleMake
                          },
                          {
                            "type":"text",
                            "text":vehicleModel
                          },
                        ]
                      }
                    ]
                  }
                },
              headers:{
                   'Authorization': 'Bearer '+token,
                  'Content-Type':"application/json"
              }
          }).then(async(resp)=>{
             await axios({
              method:"POST",
              url:`https://graph.facebook.com/v16.0/${phoneNumberId}/messages/`,
              data:{
                  "messaging_product": "whatsapp",
                  "recipient_type": "individual",
                  "to": "91"+clientWhatsAppNumber,
                  "type": "template",
                  "template": {
                    "name": "rtowithnumber",
                    "language": {
                      "code": "en"
                    },
                    "components": [
                      {
                        "type": "header",
                        "parameters": [
                          {
                            "type": "document",
                            "document": {
                              "link": pdfURL,
                              "filename":vehicleNumber
                            }
                          }
                        ]
                      },
                      {
                        "type":"body",
                        "parameters":[
                          {
                            "type":"text",
                            "text":"gj03er2323"
                          },
                          {
                            "type":"text",
                            "text":"honda"
                          },
                          {
                            "type":"text",
                            "text":"activa"
                          },
                        ]
                      }
                    ]
                  }
                },
              headers:{
                   'Authorization': 'Bearer '+token,
                  'Content-Type':"application/json"
              }
          }).then((resp)=>{
              console.log(resp);
              res.sendStatus(200)
         })
         .catch((error)=>{
          console.log(error)
          res.send(error)
         })
          })
          .catch((error)=>{
           console.log(error)
           res.send(error)
          })
    })
    } catch(error) {
                console.error({error})
        return res.sendStatus(500);
    }

    })
}

module.exports = {sendReceipte, meta_wa_callbackurl , getWhtsappMsgData , sendReceiptOnWapp };