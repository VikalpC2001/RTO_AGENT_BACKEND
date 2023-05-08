const mysql = require('mysql');
const pool = require('../../database');
const jwt = require("jsonwebtoken");

const getBookList = async(req,res,next)=>{

   try{
    let token;
    console.log("token",req.headers.authorization);
    token = req.headers.authorization.split(" ")[1];
    if(token){
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(">>>",decoded);
        const agentId = decoded.id.id;
        const data = {
            workStatus      :  req.query.workStatus,
            workCategory    :  req.query.workCategory,
            searchWord      :  req.query.searchWord
        }

        if(req.query.workStatus && req.query.searchWord){

            sql_Book_List = `SELECT vehicleRegistrationId, UPPER(vehicleRegistrationNumber) As vehicleRegistrationNumber, COALESCE(dealer_details.dealerDisplayName,privateCustomerName) AS "Dealer/Customer"
                             FROM vehicle_registration_details
                             LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                             WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicleWorkStatus = '${data.workStatus}' AND vehicleRegistrationNumber LIKE'%`+data.searchWord+`%'
                             ORDER BY RIGHT(vehicleRegistrationNumber,4)`;

        }else if(req.query.workCategory && req.query.searchWord){

            sql_Book_List = `SELECT vehicleRegistrationId, UPPER(vehicleRegistrationNumber) As vehicleRegistrationNumber, COALESCE(dealer_details.dealerDisplayName,privateCustomerName) AS "Dealer/Customer"
                             FROM vehicle_registration_details
                             LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                             WHERE vehicle_registration_details.agentId = '${agentId}' AND currentState = ${data.workCategory} AND vehicleRegistrationNumber LIKE'%`+data.searchWord+`%'
                             ORDER BY RIGHT(vehicleRegistrationNumber,4)`;

        }else if(req.query.workStatus){

            sql_Book_List = `SELECT vehicleRegistrationId, UPPER(vehicleRegistrationNumber) As vehicleRegistrationNumber, COALESCE(dealer_details.dealerDisplayName,privateCustomerName) AS "Dealer/Customer"
                             FROM vehicle_registration_details
                             LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                             WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicleWorkStatus = '${data.workStatus}'
                             ORDER BY RIGHT(vehicleRegistrationNumber,4)`;

        }else if(req.query.workCategory){

            sql_Book_List = `SELECT vehicleRegistrationId, UPPER(vehicleRegistrationNumber) As vehicleRegistrationNumber, COALESCE(dealer_details.dealerDisplayName,privateCustomerName) AS "Dealer/Customer"
                             FROM vehicle_registration_details
                             LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                             WHERE vehicle_registration_details.agentId = '${agentId}' AND currentState = ${data.workCategory}
                             ORDER BY RIGHT(vehicleRegistrationNumber,4)`;

        }else if(req.query.searchWord){

            sql_Book_List = `SELECT vehicleRegistrationId, UPPER(vehicleRegistrationNumber) As vehicleRegistrationNumber, COALESCE(dealer_details.dealerDisplayName,privateCustomerName) AS "Dealer/Customer"
                             FROM vehicle_registration_details
                             LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                             WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicleRegistrationNumber LIKE'%`+data.searchWord+`%'
                             ORDER BY RIGHT(vehicleRegistrationNumber,4)`;

        }else{
            
            sql_Book_List = `SELECT vehicleRegistrationId, UPPER(vehicleRegistrationNumber) As vehicleRegistrationNumber, COALESCE(dealer_details.dealerDisplayName,privateCustomerName) AS "Dealer/Customer"
                             FROM vehicle_registration_details
                             LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                             WHERE vehicle_registration_details.agentId = '${agentId}'
                             ORDER BY RIGHT(vehicleRegistrationNumber,4)`;

        }
        
        pool.query(sql_Book_List,(err, rows)=>{
            console.log(">>>",rows);
            if(err) return res.status(404).send(err);
            return res.json(rows);
        })
    }else{
        res.status(401);
        res.send("Please Login Firest.....!");
    }
}catch(error){
    res.send("Please Login Firest.....!");
    throw new Error(error);
}       
    
}

const getDealerList = async(req,res,next)=>{

    try{
        let token;
        console.log("token",req.headers.authorization);
        token = req.headers.authorization.split(" ")[1];
        if(token){
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log(">>>",decoded);
            const agentId = decoded.id.id;
            const sql_sortquery_getdetails = `SELECT dealerId, dealerFirmName, dealerDisplayName FROM dealer_details WHERE agentId = '${agentId}'`;
            pool.query(sql_sortquery_getdetails,(err, rows)=>{
                console.log(">>>",rows);
                if(err) return res.status(404).send(err);
                return res.json(rows);
            })
        }else{
            res.status(401);
            res.send("Please Login Firest.....!");
        }
    }catch(error){
        throw new Error(error);
    }   

    // sql_Book_List = `SELECT dealerFirmName,dealerDisplayName FROM dealer_details`    
    // pool.query(sql_Book_List,(err,data)=>{
    //  if(err) return res.send(err);
    //      return res.json(data);
    // })              
 }

module.exports = { getBookList , getDealerList }
