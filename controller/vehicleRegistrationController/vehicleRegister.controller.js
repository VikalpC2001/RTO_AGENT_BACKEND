const mysql = require('mysql');
const pool = require('../../database');
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { PDFDocument } = require("pdf-lib");
const { writeFileSync, readFileSync } = require("fs");
var {google} = require('googleapis');
const { Readable } =  require('stream');

const getVehicleRegistrationDetails = async(req,res)=>{
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

const getVehicleRegistrationDetailsById = async(req,res) =>{
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

const getVehicleRegistrationDetailsByAgentId = async(req,res) =>{

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

const getVehicleRegistrationDetailsBydealerId = async(req,res) => {

    // console.log('>>>><<<<<',req.query);
    const page = req.query.page;
    const numPerPage = req.query.numPerPage;
    const skip = (page-1) * numPerPage; 
    const limit = skip + ',' + numPerPage;
    const data = {
        dealerId : req.query.dealerId
    }
    const sql_querry_getdetailsBYdealerId = `SELECT count(*) as numRows FROM vehicle_registration_details WHERE dealerId = '${data.dealerId}'`;
    pool.query(sql_querry_getdetailsBYdealerId,(err, rows, fields)=>{
        if(err) {
            console.log("error: ", err);
            result(err, null);
        }else{
            const numRows = rows[0].numRows;
            const numPages = Math.ceil(numRows / numPerPage);
            pool.query(`SELECT vehicle_registration_details.vehicleRegistrationId, vehicleRegistrationNumber, GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType, CONCAT(vehicleMake,"/",vehicleModel) AS vehicleModelMake, clientWhatsAppNumber FROM vehicle_registration_details
                               INNER JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                               INNER JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                               WHERE vehicle_registration_details.dealerId  = '${data.dealerId}' GROUP BY work_list.vehicleRegistrationId LIMIT ` + limit,(err, rows, fields) =>{
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
        // if(err) return res.send(err)
        // return res.json(data)
    })
}

const addVehicleRegistrationDetails = async(req,res,next) =>{
    try{
        const uid1 = new Date();
        const uid2 = (new Date().getTime()).toString(36);
        const id = String("vehicleRegistration_" + uid1.getTime() + "_" + uid2);
        

        const isRRF = ()=>{
            if(req.body.RenewalofRegistration == true){
                return true;
            }else{
                return false;
            }
        }

        const isTTO = ()=>{
            if(req.body.TransferofOwnership == true){
                return true;
            }else{
                return false;
            }
        }

        const isOther = ()=>{
            if(req.body.TerminationofHypothecation == true || 
               req.body.DuplicateRC == true || 
               req.body.ChangeofAddress == true || 
               req.body.AdditionofHypothecation == true || 
               req.body.ContinuationofHypothecation == true || 
               req.body.ApplicationforNoObjectionCertificate == true ||
               req.body.AlterationofVehicle == true){
                return true;
               }else{
                return false;
               }
        }

        const getCurrentState = ()=>{
            if(isRRF()){
                return 1;
            }else if(isTTO()){
                return 2;
            }else if(isOther()){
                return 3;
            }else if(isTTO() && isOther){
                return 2;
            }else{
                return 3;
            }
        }

        const getNextState = ()=>{
            if(getCurrentState() == 1 && isTTO()){
                return 2;
            }else if(getCurrentState() == 1 && isOther()){
                return 3;
            }else{
                return 4;
            }
        }

        const insertWorkList = ()=>{
            var row = []
    
            if(req.body.TransferofOwnership){
                row.push("('"+id+"',1)");
            }if(req.body.TerminationofHypothecation){
                row.push("('"+id+"',2)");
            }if(req.body.DuplicateRC){
                row.push("('"+id+"',3)");
            }if(req.body.ChangeofAddress){
                row.push("('"+id+"',4)");
            }if(req.body.AdditionofHypothecation){
                row.push("('"+id+"',5)")
            }if(req.body.ContinuationofHypothecationn){
                row.push("('"+id+"',6)");
            }if(req.body.RenewalofRegistration){
                row.push("('"+id+"',7)");
            }if(req.body.ApplicationforNoObjectionCertificate){
                row.push("('"+id+"',8)");
            }if(req.body.AlterationofVehicle){
                row.push("('"+id+"',9)");
            }
            console.log(row)
            var string = ''
            row.forEach((data,index) => {
                if(index == 0)
                    string=string+data;
                else
                    string=string+','+data;
            });
            return string;
        }
        let token;
        token = req.headers.authorization.split(" ")[1];
        if(token){
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const agentId = decoded.id.id;    
            const data = {
                vehicleRegistrationNumber            :   req.body.vehicleRegistrationNumber,        
                vehicleChassisNumber                 :   req.body.vehicleChassisNumber,        
                vehicleEngineNumber                  :   req.body.vehicleEngineNumber,         
                vehicleClass                         :   req.body.vehicleClass ? req.body.vehicleClass : null,               
                vehicleCategory                      :   req.body.vehicleCategory ? req.body.vehicleCategory : null,             
                vehicleMake                          :   req.body.vehicleMake,                 
                vehicleModel                         :   req.body.vehicleModel,                
                vehicleRegistrationDate              :   new Date(req.body.vehicleRegistrationDate?req.body.vehicleRegistrationDate:"01/01/2001").toISOString().slice(0, 10), 
                currentState                         :   getCurrentState(),
                nextState                            :   getNextState(),
                rrf                                  :   isRRF() ? 1 : 0,
                tto                                  :   isTTO() ? 1 : 0,
                Other                                :   isOther() ? 1 : 0,             
                sellerFirstName                      :   req.body.sellerFirstName,             
                sellerMiddleName                     :   req.body.sellerMiddleName,            
                sellerLastName                       :   req.body.sellerLastName,              
                sellerAddress                        :   req.body.sellerAddress,               
                buyerFirstName                       :   req.body.buyerFirstName ? req.body.buyerFirstName : '',                 
                buyerMiddleName                      :   req.body.buyerMiddleName ? req.body.buyerMiddleName : '',           
                buyerLastName                        :   req.body.buyerLastName ? req.body.buyerLastName : '',               
                buyerAddressLine1                    :   req.body.buyerAddressLine1 ? req.body.buyerAddressLine1 : '',           
                buyerAddressLine2                    :   req.body.buyerAddressLine2 ? req.body.buyerAddressLine2 : '',          
                buyerAddressLine3                    :   req.body.buyerAddressLine3 ? req.body.buyerAddressLine3 : '',                   
                buyerState                           :   req.body.buyerState ? req.body.buyerState : null,                  
                buyerCity                            :   req.body.buyerCity ? req.body.buyerCity : null,                   
                buyerPincode                         :   req.body.buyerPincode ? req.body.buyerPincode : null,                
                clientWhatsAppNumber                 :   req.body.clientWhatsAppNumber,        
                serviceAuthority                     :   req.body.serviceAuthority,            
                dealerId                             :   req.body.dealerId,                    
                insuranceType                        :   req.body.insuranceType ? req.body.insuranceType : '',       
                insuranceCompanyNameId               :   req.body.insuranceCompanyNameId ? req.body.insuranceCompanyNameId : null,
                policyNumber                         :   req.body.policyNumber ? req.body.policyNumber : '',                
                insuranceStartDate                   :   new Date(req.body.insuranceStartDate?req.body.insuranceStartDate:null).toISOString().slice(0, 10),          
                insuranceEndDate                     :   new Date(req.body.insuranceEndDate?req.body.insuranceEndDate:null).toISOString().slice(0, 10),            
                vehicleWorkStatus                    :   "Pending",           
                comment                              :   req.body.comment
            }   
            if(!data.vehicleRegistrationNumber || !data.vehicleChassisNumber || !data.vehicleEngineNumber ||  
               !data.sellerFirstName || !data.sellerMiddleName || !data.sellerLastName || 
               !data.sellerAddress || !data.clientWhatsAppNumber || !data.serviceAuthority|| !data.dealerId || !data.vehicleWorkStatus){
                res.status(401);
                res.send("Please Fill all the feilds")
            }else{
            sql_queries_adddetails = `INSERT INTO vehicle_registration_details (vehicleRegistrationId, agentId, vehicleRegistrationNumber, vehicleChassisNumber, vehicleEngineNumber, 
                                                                                vehicleClass, vehicleCategory, vehicleMake, vehicleModel, 
                                                                                vehicleRegistrationDate, currentState, nextState, RRF ,TTO, Other,
                                                                                sellerFirstName, sellerMiddleName, sellerLastName, sellerAddress, 
                                                                                buyerFirstName, buyerMiddleName, buyerLastName,
                                                                                buyerAddressLine1, buyerAddressLine2, buyerAddressLine3, 
                                                                                buyerState, buyerCity, buyerPincode, clientWhatsAppNumber, 
                                                                                serviceAuthority, dealerId, 
                                                                                insuranceType, insuranceCompanyNameId, policyNumber, insuranceStartDate, insuranceEndDate, 
                                                                                vehicleWorkStatus, comment)
                                      VALUES ('${id}','${agentId}','${data.vehicleRegistrationNumber}','${data.vehicleChassisNumber}','${data.vehicleEngineNumber}',
                                               ${data.vehicleClass},${data.vehicleCategory},'${data.vehicleMake}','${data.vehicleModel}',
                                              '${data.vehicleRegistrationDate}','${data.currentState}','${data.nextState}','${data.rrf}','${data.tto}','${data.Other}',
                                              '${data.sellerFirstName}','${data.sellerMiddleName}','${data.sellerLastName}','${data.sellerAddress}',
                                              '${data.buyerFirstName}','${data.buyerMiddleName}','${data.buyerLastName}',
                                              '${data.buyerAddressLine1}','${data.buyerAddressLine2}','${data.buyerAddressLine3}',
                                               ${data.buyerState},${data.buyerCity},${data.buyerPincode},'${data.clientWhatsAppNumber}',
                                              '${data.serviceAuthority}','${data.dealerId}',
                                              '${data.insuranceType}',${data.insuranceCompanyNameId},'${data.policyNumber}','${data.insuranceStartDate}','${data.insuranceEndDate}',
                                              '${data.vehicleWorkStatus}','${data.comment}')`;
                                              console.log(sql_queries_adddetails);
            pool.query(sql_queries_adddetails,(err,data) =>{
                if(err) return res.send(err);
                // return res.json(data);
                else if(data){
                    res.locals.id = id
                     sql_queries_addworkdetails = `INSERT INTO work_list (vehicleRegistrationId, workId) VALUES ${insertWorkList()}`;
                     pool.query(sql_queries_addworkdetails,(err,data)=>{
                        if(err) return res.send(err);
                        // return res.json(data);
                        if(req.body.TransferofOwnership == true){
                            next();
                        }else{
                            return res.status(200),
                                   res.json("Data Inserted Successfully");
                        }
                     })
                }    
                // return res.json(data);
            })}
        }else{
            res.send("Please Login Firest....!");
        }
    }catch(error){
        res.status(400);
        res.send("Please Login Firest....>>>.!");
    }                         
}

const removeVehicleRegistrationDetails = async(req,res)=>{

    try{
        const data = {
            vehicleRegistrationId : req.body.vehicleRegistrationId
        }
        sql_queries_removedetails = `DELETE FROM vehicle_registration_details WHERE vehicleRegistrationId = '${data.vehicleRegistrationId}'`;
        pool.query(sql_queries_removedetails,(err,data)=>{
            if(err) return res.send(err);
            return res.json(data);
        })
    }catch(error){
        throw new Error('UnsuccessFull',error);
    }                      
}

const updateVehicleRegistrationDetails = async(req,res) =>{

    try{
        const data = {
                vehicleRegistrationId       :   req.body.vehicleRegistrationId,
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
        const sql_querry_updatedetails = `UPDATE vehicle_registration_details SET  vehicleRegistrationNumber = '${data.vehicleRegistrationNumber}',
                                                                                   vehicleChassisNumber = '${data.vehicleChassisNumber}',   
                                                                                   vehicleEngineNumber = '${data.vehicleEngineNumber}',      
                                                                                   vehicleClass = '${data.vehicleClass}',            
                                                                                   vehicleCategory = '${data.vehicleCategory}',          
                                                                                   vehicleMake = '${data.vehicleMake}',              
                                                                                   vehicleModel = '${data.vehicleModel}',             
                                                                                   vehicleRegistrationDate = '${data.vehicleRegistrationDate}',  
                                                                                   vehicleWorkType = '${data.vehicleWorkType}',          
                                                                                   sellerFirstName = '${data.sellerFirstName}',          
                                                                                   sellerMiddleName = '${data.sellerMiddleName}',         
                                                                                   sellerLastName = '${data.sellerLastName}',           
                                                                                   sellerAddress = '${data.sellerAddress}',            
                                                                                   buyerFirstName = '${data.buyerFirstName}',           
                                                                                   buyerMiddleName = '${data.buyerMiddleName}',          
                                                                                   buyerLastName = '${data.buyerLastName}',            
                                                                                   buyerAddressLine1 = '${data.buyerAddressLine1}',        
                                                                                   buyerAddressLine2 = '${data.buyerAddressLine2}',        
                                                                                   buyerAddressLine3 = '${data.buyerAddressLine3}',        
                                                                                   buyerState = '${data.buyerState}',               
                                                                                   buyerCity = '${data.buyerCity}',                
                                                                                   buyerPincode = '${data.buyerPincode}',             
                                                                                   clientWhatsAppNumber = '${data.clientWhatsAppNumber}',     
                                                                                   serviceAuthority = '${data.serviceAuthority}',         
                                                                                   dealerId = '${data.dealerId}',                 
                                                                                   insuranceType = '${data.insuranceType}',            
                                                                                   insuranceCompanyNameId = '${data.insuranceCompanyNameId}',   
                                                                                   policyNumber = '${data.policyNumber}',             
                                                                                   insuranceStartDate = '${data.insuranceStartDate}',       
                                                                                   insuranceEndDate = '${data.insuranceEndDate}',         
                                                                                   vehicleWorkStatus = '${data.vehicleWorkStatus}',        
                                                                                   comment = '${data.comment}'
                                                                                   WHERE vehicleRegistrationId = '${data.vehicleRegistrationId}'`;
        pool.query(sql_querry_updatedetails,(err,data) =>{ 
            if(err) return res.json(err)
            return res.json(data)
        })
    }catch(error){
        throw new Error('UnsuccessFull',error);
    }   
}

module.exports = { 
                    getVehicleRegistrationDetails,
                    getVehicleRegistrationDetailsById,
                    getVehicleRegistrationDetailsBydealerId,
                    getVehicleRegistrationDetailsByAgentId,
                    addVehicleRegistrationDetails,
                    removeVehicleRegistrationDetails,
                    updateVehicleRegistrationDetails,
                 };