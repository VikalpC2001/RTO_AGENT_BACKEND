const mysql = require('mysql');
const pool = require('../../database');
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const getDealerDetails = async(req,res) =>{

    try{
        const search = req.body.search;
        sql_queries_getdetails = `SELECT * FROM dealer_details;`;
        pool.query(sql_queries_getdetails,(err,data)=>{
        if(err) return res.send(err);
        console.log(">>>>",data[1]);  
        return res.json(data);
    })
    }catch(error){
        throw new Error('UnsuccessFull',error);
    }   
}

const getDealerDetailsById = async(req,res) =>{
    try{
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
                                                      SELECT * From tto_form_data`;

        pool.query(sql_queries_getdetailsByid,(err,data)=>{
            if(err) return res.send(err);
            return res.json(data);
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
                            console.log("error: ", err);
                            res.send(err, null);
                        }else{
                            console.log(rows);
                            console.log(numRows);
                            console.log("Total Page :-",numPages);
                            return res.send({rows,numRows});
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
        res.send("Please Login Firest.....!");
        throw new Error('UnsuccessFull',error);
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
            
            if(!data.dealerFirstName || !data.dealerLastName || !data.dealerGender || !data.dealerFirmName || !data.dealerFirmAddressLine1 || !data.dealerFirmAddressLine2 || !data.dealerFirmState || !data.dealerFirmCity || !data.dealerFirmPincode || !data.dealerDisplayName || !data.dealerMobileNumber|| !data.dealerWhatsAppNumber) {
                res.status(401);
                res.send("Please Fill all the feilds")
            }else{
            sql_queries_adddetails = `INSERT INTO dealer_details (dealerId, agentId, dealerFirstName, dealerLastName, 
                                                                  dealerGender, dealerFirmName, dealerFirmAddressLine1, 
                                                                  dealerFirmAddressLine2, dealerFirmState, dealerFirmCity
                                                                  ,dealerFirmPincode, dealerDisplayName, dealerMobileNumber, 
                                                                  dealerWhatsAppNumber, dealerEmailId)
                                      VALUES ('${id}','${agentId}','${data.dealerFirstName}','${data.dealerLastName}',
                                              '${data.dealerGender}','${data.dealerFirmName}','${data.dealerFirmAddressLine1}',
                                              '${data.dealerFirmAddressLine2}','${data.dealerFirmState}','${data.dealerFirmCity}',
                                              '${data.dealerFirmPincode}','${data.dealerDisplayName}','${data.dealerMobileNumber}',
                                              '${data.dealerWhatsAppNumber}','${data.dealerEmailId}')`;
            pool.query(sql_queries_adddetails,(err,data) =>{
                if(err) return res.send(err);
                return res.json(data);
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
        const data = {
            dealerId : req.body.dealerId
        }
        sql_queries_removedetails = `DELETE FROM dealer_details WHERE dealerId = '${data.dealerId}'`;
        pool.query(sql_queries_removedetails,(err,data)=>{
            if(err) return res.send(err);
            return res.json(data);
        })
    }catch(error){
        throw new Error('UnsuccessFull',error);
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
                                                                    dealerFirmState = '${data.dealerFirmState}', 
                                                                    dealerFirmCity = '${data.dealerFirmCity}', 
                                                                    dealerFirmPincode = '${data.dealerFirmPincode}', 
                                                                    dealerDisplayName = '${data.dealerDisplayName}', 
                                                                    dealerMobileNumber = '${data.dealerMobileNumber}', 
                                                                    dealerWhatsAppNumber = '${data.dealerWhatsAppNumber}', 
                                                                    dealerEmailId = '${data.dealerEmailId}' 
                                                                    WHERE dealerId = '${data.dealerId}'`;
        pool.query(sql_querry_updatedetails,(err,data) =>{ 
            if(err) return res.json(err)
            return res.json(data)
        })
    }catch(error){
        throw new Error('UnsuccessFull',error);
    }   
}

module.exports = { 
                   getDealerDetails, 
                   addDealerDetails, 
                   getDealerDetailsByAgentId, 
                   removeDealerDetails, 
                   getDealerDetailsById,
                   updateDealerDetails 
                }