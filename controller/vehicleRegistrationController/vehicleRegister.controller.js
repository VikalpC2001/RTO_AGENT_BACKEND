const mysql = require('mysql');
const pool = require('../../database');
const jwt = require("jsonwebtoken");
const asyncHandler = require('express-async-handler');

const getVehicleRegistrationDetails = async(req,res)=>{
    try{
        sql_queries_getdetails = `SELECT * FROM vehicle_registration_details`;
        pool.query(sql_queries_getdetails,(data,err) =>{
            if(err) return res.status(404).send(err);
            return res.json(data);
        })
    }catch(error){
        throw new Error(error);
    }
}

const getVehicleRegistrationDetailsById = async(req,res) =>{
    try{
        const data = {
            vehicleRegistrationId : req.query.vehicleRegistrationId
        }
        sql_queries_getdetailsByid = `SELECT UPPER(vehicleRegistrationNumber) AS "Regsitration Number", vehicleChassisNumber AS "Chassis Number", vehicleEngineNumber AS "Engine Number", (vehicle_class_data.vehicleClassName) AS "Vehicle Class",
                                             (vehicle_category_data.vehicleCategoryName) AS "Vehicle Category", UPPER(vehicleMake) AS " Vehicle Make", UPPER(vehicleModel) AS "Vehicle Model", DATE_FORMAT(vehicleRegistrationDate, '%d-%M-%Y') AS "Registration Date", (rto_city_data.cityRTOName) AS "Serviceing Authority"
                                             FROM vehicle_registration_details
                                             INNER JOIN vehicle_category_data ON vehicle_category_data.vehicleCategoryId = vehicle_registration_details.vehicleCategory
                                             INNER JOIN vehicle_class_data ON vehicle_class_data.vehicleClassId = vehicle_registration_details.vehicleClass
                                             INNER JOIN rto_city_data ON rto_city_data.RTOcityId = vehicle_registration_details.serviceAuthority
                                             WHERE vehicleRegistrationId = '${data.vehicleRegistrationId}';
                                      SELECT CONCAT(sellerFirstName," ",sellerMiddleName," ",sellerLastName) AS "Owner Name", sellerAddress AS "Address"
                                             FROM vehicle_registration_details
                                             WHERE vehicleRegistrationId = '${data.vehicleRegistrationId}';
                                      SELECT CONCAT(buyerFirstName," ",buyerMiddleName," ",buyerLastName) AS "Buyer Name",
                                             CONCAT(buyerAddressLine1,", ",buyerAddressLine2,", ",buyerAddressLine3) AS "Address", CONCAT(city_data.cityName,", ",state_data.stateName) AS "City/State", buyerPincode AS "Pincode"
                                             FROM vehicle_registration_details
                                             INNER JOIN city_data ON city_data.cityId = vehicle_registration_details.buyerCity
                                             INNER JOIN state_data ON state_data.stateId = vehicle_registration_details.buyerState
                                             WHERE vehicleRegistrationId = '${data.vehicleRegistrationId}';
                                      SELECT insuranceType AS "Insurance Type", (insurance_data.insuranceCompanyName) AS "Insurance Company", policyNumber AS "Policy Number", DATE_FORMAT(insuranceStartDate, '%d-%M-%y') AS "Insurance from", DATE_FORMAT(insuranceEndDate, '%d/%M/%y') AS "Insurance upto"
                                             FROM vehicle_registration_details
                                             INNER JOIN insurance_data ON insurance_data.insuranceId = vehicle_registration_details.insuranceCompanyNameId
                                             WHERE vehicleRegistrationId = '${data.vehicleRegistrationId}';
                                      SELECT vehicleWorkStatus AS "Status", comment AS "Comment"
                                             FROM vehicle_registration_details
                                             WHERE vehicleRegistrationId = '${data.vehicleRegistrationId}';
                                      SELECT GROUP_CONCAT(rto_work_data.workName SEPARATOR ', ') as workType, COALESCE(CONCAT(dealer_details.dealerFirmName,"(",dealer_details.dealerDisplayName,")"),privateCustomerName) AS "Dealer/Customer", clientWhatsAppNumber AS "WhatsApp Number"
                                             FROM vehicle_registration_details
                                             INNER JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                             INNER JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                                             LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                             WHERE vehicle_registration_details.vehicleRegistrationId = '${data.vehicleRegistrationId}' GROUP BY work_list.vehicleRegistrationId;
                                      SELECT pdfURL FROM tto_form_data WHERE vehicleRegistrationId = '${data.vehicleRegistrationId}'`;
        pool.query(sql_queries_getdetailsByid,(err,data)=>{
            if(err) return res.status(404).send(err);
            const resData = {
                'Vehicle Details'       : data[0][0],
                'Owner Details'         : data[1][0],
                'Buyer Details'         : data[2][0],
                'Insurance Details'     : data[3][0],
                'Status'                : data[4][0],
                'Customer Details'      : data[5][0],
                'TTO Form Link'         : data[6][0]    
             }
            console.log(">>>>",data)
            return res.json(resData);

        })
    }catch(error){
        throw new Error(error);
    }   
}

const getVehicleRegistrationDetailsByAgentId = async(req,res) =>{

    try{
        const page = req.query.page;
        const numPerPage = req.query.numPerPage;
        const skip = (page-1) * numPerPage; 
        const limit = skip + ',' + numPerPage;
        let token;
        token = req.headers.authorization.split(" ")[1];
        if(token){
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const agentId = decoded.id.id;
            var TTO;
            var RRF;
            var OTHER;
            console.log(">?>?>?",req.body);
            if(req.query.type === 'TTO'){
               TTO = true;
               RRF = false;
               OTHER = false;
            } else if(req.query.type === 'RRF'){
                TTO = false;
                RRF = true;
                OTHER =false;
            } else if(req.query.type === 'OTHER'){
                TTO = false;
                RRF = false;
                OTHER = true;
            }
            const workStatus = req.query.workStatus;
            if(req.query.type === 'TTO'){
                sql_queries_getdetailsByagentid = `SELECT count(*) as numRows FROM vehicle_registration_details WHERE agentId = '${agentId}' AND ((TTO = true AND Other = true) OR TTO = true) AND vehicleWorkStatus = '${workStatus}'`;
            }else{
                sql_queries_getdetailsByagentid = `SELECT count(*) as numRows FROM vehicle_registration_details WHERE agentId = '${agentId}' AND (TTO = ${TTO} AND Other = ${OTHER} AND RRF = ${RRF}) AND vehicleWorkStatus = '${workStatus}'`;
            }
            
            pool.query(sql_queries_getdetailsByagentid,(err,rows) =>{
                if(err) {
                    console.log("error: ", err);
                    result(err, null);
                }else{
                    const numRows = rows[0].numRows;
                    const numPages = Math.ceil(numRows / numPerPage);
                    if(req.query.type === 'TTO'){
                        sql_query = `SELECT ROW_NUMBER() OVER(ORDER BY (SELECT 1)) AS serial_number,vehicle_registration_details.vehicleRegistrationId,UPPER(vehicleRegistrationNumber) AS vehicleRegistrationNumber, GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType,
                                            UPPER(CONCAT(vehicleMake,"/",vehicleModel)) AS vehicleModelMake, COALESCE(CONCAT(dealer_details.dealerFirmName,"(",dealer_details.dealerDisplayName,")"),privateCustomerName) AS "Dealer/Customer" 
                                            FROM vehicle_registration_details
                                            INNER JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                            INNER JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                                            LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                            WHERE vehicle_registration_details.agentId = '${agentId}' AND ((TTO = true AND Other = true) OR TTO = true) AND vehicleWorkStatus = '${workStatus}' GROUP BY work_list.vehicleRegistrationId ORDER BY serial_number LIMIT ${limit}`;
                    }else{
                        sql_query = `SELECT ROW_NUMBER() OVER(ORDER BY (SELECT 1)) AS serial_number,vehicle_registration_details.vehicleRegistrationId,UPPER(vehicleRegistrationNumber) AS vehicleRegistrationNumber, GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType,
                                            UPPER(CONCAT(vehicleMake,"/",vehicleModel)) AS vehicleModelMake, COALESCE(CONCAT(dealer_details.dealerFirmName,"(",dealer_details.dealerDisplayName,")"),privateCustomerName) AS "Dealer/Customer" 
                                            FROM vehicle_registration_details
                                            INNER JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                            INNER JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                                            LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                            WHERE vehicle_registration_details.agentId = '${agentId}' AND (TTO = ${TTO} AND Other = ${OTHER} AND RRF = ${RRF}) AND vehicleWorkStatus = '${workStatus}' GROUP BY work_list.vehicleRegistrationId ORDER BY serial_number LIMIT ${limit}`;
                    }
                    pool.query(sql_query,(err, rows, fields) =>{
                        console.log(":::::",sql_query);
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
                // if(err) return res.send(err);
                // return res.json(data);
            })
        }else{
            res.status(401);
            res.send("Please Login Firest.....!");
        }
    }catch(error){
        throw new Error(error);
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
            pool.query(`SELECT @a:=@a+1 AS serial_number,vehicle_registration_details.vehicleRegistrationId, UPPER(vehicleRegistrationNumber) AS vehicleRegistrationNumber, GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType,
                               UPPER(CONCAT(vehicleMake,"/",vehicleModel)) AS vehicleModelMake, clientWhatsAppNumber 
                               FROM (SELECT @a:= 0) AS a, vehicle_registration_details
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
            if(req.body.RRF == true){
                return true;
            }else{
                return false;
            }
        }

        const isTTO = ()=>{
            if(req.body.TO == true){
                return true;
            }else{
                return false;
            }
        }

        const isOther = ()=>{
            if(req.body.HPT == true || 
               req.body.DRC == true || 
               req.body.addressChange == true || 
               req.body.HPA == true || 
               req.body.HPC == true || 
               req.body.NOC == true ||
               req.body.AV == true){
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
    
            if(req.body.TO){
                row.push("('"+id+"',1)");
            }if(req.body.HPT){
                row.push("('"+id+"',2)");
            }if(req.body.DRC){
                row.push("('"+id+"',3)");
            }if(req.body.addressChange){
                row.push("('"+id+"',4)");
            }if(req.body.HPA){
                row.push("('"+id+"',5)")
            }if(req.body.HPC){
                row.push("('"+id+"',6)");
            }if(req.body.RRF){
                row.push("('"+id+"',7)");
            }if(req.body.NOC){
                row.push("('"+id+"',8)");
            }if(req.body.AV){
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
                vehicleRegistrationDate              :   new Date(req.body.vehicleRegistrationDate?req.body.vehicleRegistrationDate:"01/01/2001").toString().slice(4,15),
                currentState                         :   getCurrentState(),
                nextState                            :   getNextState(),
                rrf                                  :   isRRF() ? 1 : 0,
                tto                                  :   isTTO() ? 1 : 0,
                Other                                :   isOther() ? 1 : 0,             
                sellerFirstName                      :   req.body.sellerFirstName,             
                sellerMiddleName                     :   req.body.sellerMiddleName,            
                sellerLastName                       :   req.body.sellerLastName,              
                sellerAddress                        :   req.body.sellerAddress,               
                buyerFirstName                       :   req.body.buyerFirstName ? req.body.buyerFirstName : null,                 
                buyerMiddleName                      :   req.body.buyerMiddleName ? req.body.buyerMiddleName : null,           
                buyerLastName                        :   req.body.buyerLastName ? req.body.buyerLastName : null,               
                buyerAddressLine1                    :   req.body.buyerAddressLine1 ? req.body.buyerAddressLine1 : null,           
                buyerAddressLine2                    :   req.body.buyerAddressLine2 ? req.body.buyerAddressLine2 : null,          
                buyerAddressLine3                    :   req.body.buyerAddressLine3 ? req.body.buyerAddressLine3 : null,                   
                buyerState                           :   req.body.buyerState ? req.body.buyerState : null,                  
                buyerCity                            :   req.body.buyerCity ? req.body.buyerCity : null,                   
                buyerPincode                         :   req.body.buyerPincode ? req.body.buyerPincode : null,                
                clientWhatsAppNumber                 :   req.body.clientWhatsAppNumber,        
                serviceAuthority                     :   req.body.serviceAuthority,            
                dealerId                             :   req.body.dealerId ? req.body.dealerId : null,
                privateCustomerName                  :   req.body.privateCustomerName ? req.body.privateCustomerName : null,                    
                insuranceType                        :   req.body.insuranceType ? req.body.insuranceType : null,       
                insuranceCompanyNameId               :   req.body.insuranceCompanyNameId ? req.body.insuranceCompanyNameId : null,
                policyNumber                         :   req.body.policyNumber ? req.body.policyNumber : null,                
                insuranceStartDate                   :   new Date(req.body.insuranceStartDate?req.body.insuranceStartDate:"01/01/2001").toString().slice(4,15),          
                insuranceEndDate                     :   new Date(req.body.insuranceEndDate?req.body.insuranceEndDate:"01/01/2001").toString().slice(4,15),            
                vehicleWorkStatus                    :   "Pending",           
                comment                              :   req.body.comment ? req.body.comment : null
            }   
            if(!data.vehicleRegistrationNumber || !data.vehicleChassisNumber || !data.vehicleEngineNumber ||  
               !data.sellerFirstName || !data.sellerMiddleName || !data.sellerLastName || 
               !data.sellerAddress || !data.clientWhatsAppNumber || !data.serviceAuthority || !data.vehicleWorkStatus){
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
                                                                                serviceAuthority, dealerId, privateCustomerName, 
                                                                                insuranceType, insuranceCompanyNameId, policyNumber, insuranceStartDate, insuranceEndDate, 
                                                                                vehicleWorkStatus, comment)
                                      VALUES ('${id}','${agentId}','${data.vehicleRegistrationNumber}','${data.vehicleChassisNumber}','${data.vehicleEngineNumber}',
                                               ${data.vehicleClass},${data.vehicleCategory},'${data.vehicleMake}','${data.vehicleModel}',
                                               STR_TO_DATE('${data.vehicleRegistrationDate}','%b %d %Y'),'${data.currentState}','${data.nextState}','${data.rrf}','${data.tto}','${data.Other}',
                                              '${data.sellerFirstName}','${data.sellerMiddleName}','${data.sellerLastName}','${data.sellerAddress}',
                                              NULLIF('${data.buyerFirstName}','null'),NULLIF('${data.buyerMiddleName}','null'),NULLIF('${data.buyerLastName}','null'),
                                              NULLIF('${data.buyerAddressLine1}','null'),NULLIF('${data.buyerAddressLine2}','null'),NULLIF('${data.buyerAddressLine3}','null'),
                                               ${data.buyerState},${data.buyerCity},${data.buyerPincode},'${data.clientWhatsAppNumber}',
                                              '${data.serviceAuthority}',NULLIF('${data.dealerId}','null'),NULLIF('${data.privateCustomerName}','null'),
                                              NULLIF('${data.insuranceType}','null'),${data.insuranceCompanyNameId},NULLIF('${data.policyNumber}','null'), STR_TO_DATE('${data.insuranceStartDate}','%b %d %Y'), STR_TO_DATE('${data.insuranceEndDate}','%b %d %Y'),
                                              '${data.vehicleWorkStatus}',NULLIF('${data.comment}','null'))`;
                                              console.log(">?>?>?>",sql_queries_adddetails);
            pool.query(sql_queries_adddetails,(err,data) =>{
                if(err) return res.status(404).send(err);
                // return res.json(data);
                else if(data){
                    res.locals.id = id
                     sql_queries_addworkdetails = `INSERT INTO work_list (vehicleRegistrationId, workId) VALUES ${insertWorkList()}`;
                     pool.query(sql_queries_addworkdetails,(err,data)=>{
                        if(err) return res.status(404).send(err);
                        // return res.json(data);
                        if(req.body.TO == true){
                            next();
                        }else{
                            return res.json({status:200, message:"Data Inserted Successfully"});
                        }
                     })
                }    
                // return res.json(data);
            })}
        }else{
            res.send("Please Login Firest....!");
        }
    }catch(error){
        throw new Error(error);
        // res.send("Please Login Firest....>>>.!");
    }                         
}

const removeVehicleRegistrationDetails = async(req,res,next)=>{

    try{
        const data = {
            vehicleRegistrationId : req.body.vehicleRegistrationId
        }
        sql_queries_removedetails = `DELETE FROM vehicle_registration_details WHERE vehicleRegistrationId = '${data.vehicleRegistrationId}'`;
        pool.query(sql_queries_removedetails,(err,data)=>{
            if(data){
            if(err) return res.send(err);
            return res.json({status:200, message:"Data Deleted Successfully"});
            }
        })
    }catch(error){
        throw new Error(error);
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
            if(err) return res.status(404).send(err);
            return res.json(data)
        })
    }catch(error){
        throw new Error(error);
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