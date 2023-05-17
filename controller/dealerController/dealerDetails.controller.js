const mysql = require('mysql');
const pool = require('../../database');
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const GoogleDelete = require("../vehicleRegistrationController/vehicleRegister.controller");

const fillUpdateDetailForDealer = async(req,res) =>{

    try{
        const dealerId = req.query.dealerId;
        sql_queries_getdetails = `SELECT dealerFirstName,dealerLastName,dealerGender,dealerFirmName,dealerFirmAddressLine1,dealerFirmAddressLine2,dealerFirmState,dealerFirmCity,dealerFirmPincode,dealerDisplayName,dealerMobileNumber,dealerWhatsAppNumber,dealerEmailId FROM dealer_details 
                                  WHERE dealerId = '${dealerId}'`;
        pool.query(sql_queries_getdetails,(err,data)=>{
        if(err) return res.status(404).send(err);
        console.log(">>>>",data);  
        return res.json(data[0]);
    })
    }catch(error){
        throw new Error(error);
    }   
}

const getDealerDetailsById = async(req,res) =>{
    try{
        var date = new Date(), y = date.getFullYear(), m = (date.getMonth()-1);
        var firstDay = new Date(y, m, 1).toString().slice(4,15);
        var lastDay = new Date(y, m + 1, 0).toString().slice(4,15);

        console.log("1111>>>>",firstDay);
        console.log("1111>>>>",lastDay);
        const data = {
            dealerId : req.query.dealerId
        }
        sql_queries_getdetailsByid = `SELECT dealerId,CONCAT(dealerFirstName," ",dealerLastName) AS dealerName, dealerFirmName, 
                                                      CONCAT(dealerFirmAddressLine1,", ",dealerFirmAddressLine2) AS Address, 
                                                      CONCAT(city_data.cityName,",",state_data.stateName) AS StateandCity, dealerFirmPincode, 
                                                      dealerDisplayName, dealerMobileNumber, dealerWhatsAppNumber, dealerEmailId 
                                                      FROM dealer_details 
                                                      INNER JOIN state_data ON dealer_details.dealerFirmState = state_data.stateId
                                                      INNER JOIN city_data ON dealer_details.dealerFirmCity = city_data.cityId
                                                      WHERE dealerId = '${data.dealerId}';
                                                      SELECT COUNT(*) AS TotalBooksOfDealer FROM vehicle_registration_details WHERE dealerId = '${data.dealerId}';
                                                      SELECT COUNT(*) AS PendingBooksOfDealer FROM vehicle_registration_details WHERE dealerId = '${data.dealerId}' AND vehicleWorkStatus = "PENDING";
                                                      SELECT COUNT(*) AS AppointmentBooksOfDealer FROM vehicle_registration_details WHERE dealerId = '${data.dealerId}' AND vehicleWorkStatus = "APPOINTMENT";
                                                      SELECT COUNT(*) AS CompleteBooksOfDealer FROM vehicle_registration_details WHERE dealerId = '${data.dealerId}' AND vehicleWorkStatus = "COMPLETE";
                                                      SELECT COUNT(*) AS LastMonthBooksOfDealer FROM vehicle_registration_details WHERE dealerId = '${data.dealerId}' AND vehicleRegistrationCreationDate BETWEEN STR_TO_DATE('${firstDay}','%b %d %Y') AND STR_TO_DATE('${lastDay}','%b %d %Y');                                    
                                                      SELECT COUNT(*) AS LastUpdatedBooksOfDealer FROM vehicle_registration_details WHERE dealerId = '${data.dealerId}' AND vehicleRegistrationCreationDate = (SELECT MAX(vehicleRegistrationCreationDate) FROM vehicle_registration_details WHERE dealerId = '${data.dealerId}');`;

        pool.query(sql_queries_getdetailsByid,(err,data)=>{
            if(err) return res.status(404).send(err);
            const Dealerdetails = data[0][0]
            const DealerCounterdetails = {
                'TotalBooksOfDealer'        : data[1][0]['TotalBooksOfDealer'],
                'PendingBooksOfDealer'      : data[2][0]['PendingBooksOfDealer'],
                'AppointmentBooksOfDealer'  : data[3][0]['AppointmentBooksOfDealer'],
                'CompleteBooksOfDealer'     : data[4][0]['CompleteBooksOfDealer'],
                'LastMonthBooksOfDealer'    : data[5][0]['LastMonthBooksOfDealer'],
                'LastUpdatedBooksOfDealer'  : data[6][0]['LastUpdatedBooksOfDealer']
            }
            return res.json({Dealerdetails,DealerCounterdetails});
        })
    }catch(error){
        throw new Error('UnsuccessFull',error);
    }   
}

const getDealerDetailsByAgentId = async(req,res) =>{

    try{
        const sort = req.body.sort ? req.body.sort : "dealerFirmName";
        const page = req.query.page;
        const numPerPage = req.query.numPerPage;
        const skip = (page-1) * numPerPage; 
        const limit = skip + ',' + numPerPage;
        let token;
        token = req.headers.authorization.split(" ")[1];
        if(token){
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const agentId = decoded.id.id;
            const sql_querry_getdetails = `SELECT count(*) as numRows FROM dealer_details WHERE agentId = '${agentId}'`;
            pool.query(sql_querry_getdetails,(err, rows, fields)=>{
                if(err) {
                    console.log("error: ", err);
                    result(err, null);
                }else{
                    const numRows = rows[0].numRows;
                    const numPages = Math.ceil(numRows / numPerPage);
                    const sql_sortquery_getdetails = `SELECT dealerId, dealerFirmName,CONCAT(dealerFirstName," ",dealerLastName) AS dealerName, dealerDisplayName, dealerMobileNumber, dealerWhatsAppNumber FROM dealer_details WHERE agentId = '${agentId}' ORDER BY ${sort} LIMIT `
                    pool.query(sql_sortquery_getdetails + limit,(err, rows, fields) =>{
                        if(err) {
                            return res.status(404).send(err);
                        }else{
                            console.log(rows);
                            console.log(numRows);
                            console.log("Total Page :-",numPages);
                            if(numRows === 0){
                                const rows = [{
                                    'msg' : 'No Data Found'
                                }]
                                return res.send({rows,numRows});
                            }else{
                                return res.send({rows,numRows});
                            }
                            // res.send(null,fields,data,numPages);
                        }
                    });
                }
            })
        }else{
            res.status(401);
            res.send("Please Login Firest.....!");
        }
    }catch(error){
        throw new Error(error);
    }   
}

const addDealerDetails = async(req,res) =>{

    try{

        const uid1 = new Date();
        const uid2 = (new Date().getTime()).toString(36);
        console.log("Milisecond Id :-","Agent_" + uid1.getTime() + "_" + uid2);
        const id = String("Dealer_" + uid1.getTime() + "_" + uid2);

        let token;
        token = req.headers.authorization.split(" ")[1];
        if(token){
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const agentId = decoded.id.id;    
    
            const data = {
                dealerFirstName         :   req.body.dealerFirstName,   
                dealerLastName          :   req.body.dealerLastName,
                dealerGender            :   req.body.dealerGender,
                dealerFirmName          :   req.body.dealerFirmName,
                dealerFirmAddressLine1  :   req.body.dealerFirmAddressLine1,
                dealerFirmAddressLine2  :   req.body.dealerFirmAddressLine2,
                dealerFirmState         :   req.body.dealerFirmState,   
                dealerFirmCity          :   req.body.dealerFirmCity,
                dealerFirmPincode       :   req.body.dealerFirmPincode,
                dealerDisplayName       :   req.body.dealerDisplayName,
                dealerMobileNumber      :   req.body.dealerMobileNumber,
                dealerWhatsAppNumber    :   req.body.dealerWhatsAppNumber,
                dealerEmailId           :   req.body.dealerEmailId
            }
            
            if(!data.dealerFirstName || !data.dealerLastName || !data.dealerGender || 
               !data.dealerFirmName || !data.dealerFirmAddressLine1 || !data.dealerFirmAddressLine2 ||
               !data.dealerFirmState || !data.dealerFirmCity || !data.dealerFirmPincode || !data.dealerDisplayName ||
               !data.dealerMobileNumber|| !data.dealerWhatsAppNumber) {
                res.status(401);
                res.send("Please Fill all the feilds")
            }else{
            sql_queries_adddetails = `INSERT INTO dealer_details (dealerId, agentId, dealerFirstName, dealerLastName, 
                                                                  dealerGender, dealerFirmName, dealerFirmAddressLine1, 
                                                                  dealerFirmAddressLine2, dealerFirmState, dealerFirmCity,
                                                                  dealerFirmPincode, dealerDisplayName, dealerMobileNumber, 
                                                                  dealerWhatsAppNumber, dealerEmailId)
                                      VALUES ('${id}','${agentId}','${data.dealerFirstName}','${data.dealerLastName}',
                                              '${data.dealerGender}','${data.dealerFirmName}','${data.dealerFirmAddressLine1}',
                                              '${data.dealerFirmAddressLine2}','${data.dealerFirmState}','${data.dealerFirmCity}',
                                              '${data.dealerFirmPincode}','${data.dealerDisplayName}','${data.dealerMobileNumber}',
                                              '${data.dealerWhatsAppNumber}','${data.dealerEmailId}')`;
            pool.query(sql_queries_adddetails,(err,data) =>{
                if(err) return res.status(404).send(err);
                return res.status(200),
                res.json("Dealer Inserted Successfully");
            })}
        }else{
            res.send("Please Login Firest....!");
        }
    }catch(error){
        res.status(400);
        res.send("Please Login Firest....>>>.!");
    }                         
}


const removeDealerDetails = async(req,res)=>{

    try{
        const  dealerId = req.query.dealerId;
        const get_googleDriveId = `SELECT tto_form_data.pdfGoogleDriveId AS DriveId FROM dealer_details
                                   INNER JOIN vehicle_registration_details ON vehicle_registration_details.dealerId = dealer_details.dealerId
                                   LEFT JOIN tto_form_data ON tto_form_data.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                   WHERE vehicle_registration_details.dealerId = '${dealerId}';
                                   SELECT rto_receipt_data.receiptGoogleDriveId AS DriveId FROM dealer_details
                                   INNER JOIN vehicle_registration_details ON vehicle_registration_details.dealerId = dealer_details.dealerId
                                   LEFT JOIN rto_receipt_data ON rto_receipt_data.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                   WHERE vehicle_registration_details.dealerId = '${dealerId}'`;
        pool.query(get_googleDriveId,(err,data) =>{
        if(err) return res.status(404).send(err);
        const ttoGoogledriveId1 = data[0];
        const receiptGoogledriveId2 = data[1];
        const allId = ttoGoogledriveId1.concat(receiptGoogledriveId2);
        var GoogleDId = [];
        if(allId){
            GoogleDId = allId.filter(e => {
                return e.DriveId !== null;
              });
        }
          console.log("goglDiiiiiiiiiiiid",GoogleDId);
          if(GoogleDId){
            GoogleDId.map(a => {GoogleDelete.deleteGoogleFileforTTO(a.DriveId)});
          }
            req.query.agentEmailId = pool.query(`SELECT dealerId FROM dealer_details WHERE dealer_details.dealerId = '${dealerId}'`, (err, row)=>{
                if (row && row.length) {
                    sql_queries_removedetails = `DELETE FROM dealer_details WHERE dealer_details.dealerId = '${dealerId}'`;
                    pool.query(sql_queries_removedetails,(err,data)=>{
                if(data){
                if(err) return res.status(404).send(err);
                return res.json({status:200, message:"Dealer Deleted Successfully"});
                }
            })   
              }else {
                    return res.send('Dealer is Already Deleted');
              }
            })
    })
    }catch(error){
        throw new Error(error);
    }                      
}

const updateDealerDetails = async(req,res) =>{

    try{
        const data = {
            dealerId                :   req.body.dealerId,
            dealerFirstName         :   req.body.dealerFirstName,   
            dealerLastName          :   req.body.dealerLastName,
            dealerGender            :   req.body.dealerGender,
            dealerFirmName          :   req.body.dealerFirmName,
            dealerFirmAddressLine1  :   req.body.dealerFirmAddressLine1,
            dealerFirmAddressLine2  :   req.body.dealerFirmAddressLine2,
            dealerFirmState         :   req.body.dealerFirmState,   
            dealerFirmCity          :   req.body.dealerFirmCity,
            dealerFirmPincode       :   req.body.dealerFirmPincode,
            dealerDisplayName       :   req.body.dealerDisplayName,
            dealerMobileNumber      :   req.body.dealerMobileNumber,
            dealerWhatsAppNumber    :   req.body.dealerWhatsAppNumber,
            dealerEmailId           :   req.body.dealerEmailId
        }   
        const sql_querry_updatedetails = `UPDATE dealer_details SET dealerFirstName = '${data.dealerFirstName}', 
                                                                    dealerLastName = '${data.dealerLastName}', 
                                                                    dealerGender = '${data.dealerGender}', 
                                                                    dealerFirmName = '${data.dealerFirmName}', 
                                                                    dealerFirmAddressLine1 = '${data.dealerFirmAddressLine1}', 
                                                                    dealerFirmAddressLine2 = '${data.dealerFirmAddressLine2}', 
                                                                    dealerFirmState = ${data.dealerFirmState}, 
                                                                    dealerFirmCity = ${data.dealerFirmCity}, 
                                                                    dealerFirmPincode = ${data.dealerFirmPincode}, 
                                                                    dealerDisplayName = '${data.dealerDisplayName}', 
                                                                    dealerMobileNumber = '${data.dealerMobileNumber}', 
                                                                    dealerWhatsAppNumber = '${data.dealerWhatsAppNumber}', 
                                                                    dealerEmailId = '${data.dealerEmailId}' 
                                                                    WHERE dealerId = '${data.dealerId}'`;
        pool.query(sql_querry_updatedetails,(err,data) =>{ 
            if(err) return res.status(404).send(err);
            return res.send("Dealer Updated");
        })
    }catch(error){
        throw new Error('UnsuccessFull',error);
    }   
}

const ddlDealerByAgentId = async(req,res) =>{

    try{
        let token;
        token = req.headers.authorization.split(" ")[1];
        if(token){
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const agentId = decoded.id.id;
            const sql_querry_getdetails = `SELECT dealerId,CONCAT(dealerFirmName,'(',dealerDisplayName,')') as dealerDisplayName FROM dealer_details WHERE agentId = '${agentId}'`;
            pool.query(sql_querry_getdetails,(err,data)=>{
                if(err) return res.status(404).send(err);
                return res.json(data)
               })
        }else{
            res.status(401);
            res.send("Please Login Firest.....!");
        }
    }catch(error){
        throw new Error(error);
    }   
}



module.exports = { 
                   fillUpdateDetailForDealer, 
                   addDealerDetails, 
                   getDealerDetailsByAgentId, 
                   removeDealerDetails, 
                   getDealerDetailsById,
                   ddlDealerByAgentId,
                   updateDealerDetails 
                }