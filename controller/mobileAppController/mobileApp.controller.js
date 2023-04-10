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
        sql_Book_List = `SELECT vehicleRegistrationId ,vehicleRegistrationNumber FROM vehicle_registration_details WHERE agentId = '${agentId}'`;
        pool.query(sql_Book_List,(err, rows)=>{
            console.log(">>>",rows);
            if(err) return res.json(err)
            return res.json(rows);
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
                if(err) return res.json(err)
                return res.json(rows);
            })
        }else{
            res.status(401);
            res.send("Please Login Firest.....!");
        }
    }catch(error){
        res.send("Please Login Firest.....!");
        throw new Error('UnsuccessFull',error);
    }   

    // sql_Book_List = `SELECT dealerFirmName,dealerDisplayName FROM dealer_details`    
    // pool.query(sql_Book_List,(err,data)=>{
    //  if(err) return res.send(err);
    //      return res.json(data);
    // })              
 }

module.exports = { getBookList , getDealerList }
