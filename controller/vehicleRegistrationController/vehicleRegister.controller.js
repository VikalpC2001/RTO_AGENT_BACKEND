const mysql = require('mysql');
const pool = require('../../database');
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const getVehicleDetail = async(req,res)=>{
    try{
        sql_queries_getdetails = `SELECT * FROM vehicle_registration_details`;
        pool.query(sql_queries_getdetails,(data,err) =>{
            if(err) return res.send(err);
            return res.json(data);
        })
    }catch(error){
        throw new Error('UnsuccessFull',error);
    }
}

const getVehicleDetailsById = async(req,res) =>{
    try{
        const data = {
            vehicleRegistrationId : req.body.vehicleRegistrationId
        }
        sql_queries_getdetailsByid = `SELECT vehicleRegistrationNumber, vehicleChassisNumber, vehicleEngineNumber, vehicleClass,
                                             vehicleCategory, vehicleMake, vehicleModel, vehicleRegistrationDate, vehicleWorkType, sellerFirstName, 
                                             sellerMiddleName, sellerLastName, sellerAddress, buyerFirstName, buyerMiddleName, buyerLastName,
                                             buyerAddressLine1, buyerAddressLine2, buyerAddressLine3, buyerState, buyerCity, buyerPincode,
                                             clientWhatsAppNumber, serviceAuthority, dealerId, insuranceType, insuranceCompanyNameId,
                                             policyNumber, insuranceStartDate, insuranceEndDate, vehicleWorkStatus, comment
                                             FROM vehicle_registration_details WHERE vehicleRegistrationId = ${data.vehicleRegistrationId}`;
        pool.query(sql_queries_getdetailsByid,(err,data)=>{
            if(err) return res.send(err);
            return res.json(data);
        })
    }catch(error){
        throw new Error('UnsuccessFull',error);
    }   
}

const getvehicleDetailsByAgentId = async(req,res) =>{

    try{
        let token;
        token = req.headers.authorization.split(" ")[1];
        if(token){
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const agentId = decoded.id.id;

            sql_queries_getdetailsByagentid = `SELECT * FROM vehicle_registration_details WHERE agentId = ${agentId}`;
            pool.query(sql_queries_getdetailsByagentid,(err,data) =>{
                if(err) return res.send(err);
                return res.json(data);
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

const addVehicleRegistrationDetails = async(req,res) =>{

    try{
        let token;
        token = req.headers.authorization.split(" ")[1];
        if(token){
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const agentId = decoded.id.id;    
    
            const data = {
                vehicleRegistrationNumber   :   req.body.vehicleRegistrationNumber,        
                vehicleChassisNumber        :   req.body.vehicleChassisNumber,        
                vehicleEngineNumber         :   req.body.vehicleEngineNumber,         
                vehicleClass                :   req.body.vehicleClass,                
                vehicleCategory             :   req.body.vehicleCategory,             
                vehicleMake                 :   req.body.vehicleMake,                 
                vehicleModel                :   req.body.vehicleModel,                
                vehicleRegistrationDate     :   new Date(req.body.vehicleRegistrationDate?req.body.vehicleRegistrationDate:"01/01/2001").toISOString().slice(0, 10), 
                vehicleWorkType             :   req.body.vehicleWorkType,             
                sellerFirstName             :   req.body.sellerFirstName,             
                sellerMiddleName            :   req.body.sellerMiddleName,            
                sellerLastName              :   req.body.sellerLastName,              
                sellerAddress               :   req.body.sellerAddress,               
                buyerFirstName              :   req.body.buyerFirstName,                 
                buyerMiddleName             :   req.body.buyerMiddleName,             
                buyerLastName               :   req.body.buyerLastName,                   
                buyerAddressLine1           :   req.body.buyerAddressLine1,           
                buyerAddressLine2           :   req.body.buyerAddressLine2,          
                buyerAddressLine3           :   req.body.buyerAddressLine3,                   
                buyerState                  :   req.body.buyerState,                  
                buyerCity                   :   req.body.buyerCity,                   
                buyerPincode                :   req.body.buyerPincode,                
                clientWhatsAppNumber        :   req.body.clientWhatsAppNumber,        
                serviceAuthority            :   req.body.serviceAuthority,            
                dealerId                    :   req.body.dealerId,                    
                insuranceType               :   req.body.insuranceType,               
                insuranceCompanyNameId      :   req.body.insuranceCompanyNameId,      
                policyNumber                :   req.body.policyNumber,                
                insuranceStartDate          :   new Date(req.body.insuranceStartDate?req.body.insuranceStartDate:"01/01/2001").toISOString().slice(0, 10),          
                insuranceEndDate            :   new Date(req.body.insuranceEndDate?req.body.insuranceEndDate:"01/01/2001").toISOString().slice(0, 10),            
                vehicleWorkStatus           :   req.body.vehicleWorkStatus,           
                comment                     :   req.body.comment                  
            }   
            
            if(!data.vehicleRegistrationNumber || !data.vehicleChassisNumber || !data.vehicleEngineNumber || !data.vehicleRegistrationDate || 
               !data.vehicleWorkType || !data.sellerFirstName || !data.sellerMiddleName || !data.sellerLastName || 
               !data.sellerAddress || !data.clientWhatsAppNumber || !data.serviceAuthority|| !data.dealerId || !data.vehicleWorkStatus){
                res.status(401);
                res.send("Please Fill all the feilds")
            }else{
            sql_queries_adddetails = `INSERT INTO vehicle_registration_details (agentId, vehicleRegistrationNumber, vehicleChassisNumber, vehicleEngineNumber, 
                                                                                vehicleClass, vehicleCategory, vehicleMake, vehicleModel, 
                                                                                vehicleRegistrationDate, vehicleWorkType, 
                                                                                sellerFirstName, sellerMiddleName, sellerLastName, sellerAddress, 
                                                                                buyerFirstName, buyerMiddleName, buyerLastName,
                                                                                buyerAddressLine1, buyerAddressLine2, buyerAddressLine3, 
                                                                                buyerState, buyerCity, buyerPincode, clientWhatsAppNumber, 
                                                                                serviceAuthority, dealerId, 
                                                                                insuranceType, insuranceCompanyNameId, policyNumber, insuranceStartDate, insuranceEndDate, 
                                                                                vehicleWorkStatus, comment)
                                      VALUES ('${agentId}','${data.vehicleRegistrationNumber}','${data.vehicleChassisNumber}','${data.vehicleEngineNumber}',
                                              '${data.vehicleClass}','${data.vehicleCategory}','${data.vehicleMake}','${data.vehicleModel}',
                                              '${data.vehicleRegistrationDate}','${data.vehicleWorkType}',
                                              '${data.sellerFirstName}','${data.sellerMiddleName}','${data.sellerLastName}','${data.sellerAddress}',
                                              '${data.buyerFirstName}','${data.buyerMiddleName}','${data.buyerLastName}',
                                              '${data.buyerAddressLine1}','${data.buyerAddressLine2}','${data.buyerAddressLine3}',
                                              '${data.buyerState}','${data.buyerCity}','${data.buyerPincode}','${data.clientWhatsAppNumber}',
                                              '${data.serviceAuthority}','${data.dealerId}',
                                              '${data.insuranceType}','${data.insuranceCompanyNameId}','${data.policyNumber}','${data.insuranceStartDate}','${data.insuranceEndDate}',
                                              '${data.vehicleWorkStatus}','${data.comment}')`;
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

module.exports = { 
                    getVehicleDetail,
                    getVehicleDetailsById,
                    getvehicleDetailsByAgentId,
                    addVehicleRegistrationDetails
                 };