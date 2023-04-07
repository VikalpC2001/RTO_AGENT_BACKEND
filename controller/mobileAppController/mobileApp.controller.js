const mysql = require('mysql');
const pool = require('../../database');

const getBookList = async(req,res,next)=>{

   sql_Book_List = `SELECT vehicleRegistrationId ,vehicleRegistrationNumber FROM vehicle_registration_details`    
   pool.query(sql_Book_List,(err,data)=>{
    if(err) return res.send(err);
        return res.json(data);
   })              
}

const getDealerList = async(req,res,next)=>{

    sql_Book_List = `SELECT dealerFirmName,dealerDisplayName FROM dealer_details`    
    pool.query(sql_Book_List,(err,data)=>{
     if(err) return res.send(err);
         return res.json(data);
    })              
 }

module.exports = { getBookList , getDealerList }
