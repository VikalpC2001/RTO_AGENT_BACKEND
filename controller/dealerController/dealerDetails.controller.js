const mysql = require('mysql');
const pool = require('../../database');

const getDealerDetails = async(req,res) =>{
    sql_queries_getdetails = `SELECT * FROM dealer_details`;
    pool.query(sql_queries_getdetails,(err,data)=>{
        if(err) return res.send(err);
        return res.json(data);
    })
}

const getDealerDetailsById = async(req,res) =>{
    const data = {
        dealerId : req.body.dealerId
    }
    sql_queries_getdetailsByid = `SELECT dealerFirstName, dealerLastName, dealerGender, 
                                         dealerFirmName, dealerFirmAddressLine1, dealerFirmAddressLine2, 
                                         dealerFirmState, dealerFirmCity, dealerFirmPincode, 
                                         dealerDisplayName, dealerMobileNumber, dealerWhatsAppNumber, 
                                         dealerEmailId 
                                         FROM dealer_details WHERE dealerId = ${data.dealerId}`;
    pool.query(sql_queries_getdetailsByid,(err,data)=>{
        if(err) return res.send(err);
        return res.json(data);
    })
}

const getDealerDetailsByAgentId = async(req,res) =>{
    const data = {
        agentId : req.body.agentId
    }
    sql_queries_getdetailsByagentid = `SELECT * FROM dealer_details WHERE agentId = ${data.agentId}`;
    pool.query(sql_queries_getdetailsByagentid,(err,data) =>{
        if(err) return res.send(err);
        return res.json(data);
    })
}

const addDealerDetails = async(req,res) =>{
    const data = {
        agentId                 :   req.body.agentId,
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
    sql_queries_adddetails = `INSERT INTO dealer_details (agentId, dealerFirstName, dealerLastName, 
                                                          dealerGender, dealerFirmName, dealerFirmAddressLine1, 
                                                          dealerFirmAddressLine2, dealerFirmState, dealerFirmCity
                                                          ,dealerFirmPincode, dealerDisplayName, dealerMobileNumber, 
                                                          dealerWhatsAppNumber, dealerEmailId)
                              VALUES ('${data.agentId}','${data.dealerFirstName}','${data.dealerLastName}',
                                      '${data.dealerGender}','${data.dealerFirmName}','${data.dealerFirmAddressLine1}',
                                      '${data.dealerFirmAddressLine2}','${data.dealerFirmState}','${data.dealerFirmCity}',
                                      '${data.dealerFirmPincode}','${data.dealerDisplayName}','${data.dealerMobileNumber}',
                                      '${data.dealerWhatsAppNumber}','${data.dealerEmailId}')`;
    pool.query(sql_queries_adddetails,(err,data) =>{
        if(err) return res.send(err);
        return res.json(data);
    })                          
}

const removeDealerDetails = async(req,res)=>{
    const data = {
        dealerId : req.body.dealerId
    }
    sql_queries_removedetails = `DELETE FROM dealer_details WHERE dealerId = ${data.dealerId}`;
    pool.query(sql_queries_removedetails,(err,data)=>{
        if(err) return res.send(err);
        return res.json(data);
    })
}

// const updateDealerDetails = async(req,res) =>{
//     const data = {
//         dealerFirstName         :   req.body.dealerFirstName,   
//         dealerLastName          :   req.body.dealerLastName,
//         dealerGender            :   req.body.dealerGender,
//         dealerFirmName          :   req.body.dealerFirmName,
//         dealerFirmAddressLine1  :   req.body.dealerFirmAddressLine1,
//         dealerFirmAddressLine2  :   req.body.dealerFirmAddressLine2,
//         dealerFirmState         :   req.body.dealerFirmState,   
//         dealerFirmCity          :   req.body.dealerFirmCity,
//         dealerFirmPincode       :   req.body.dealerFirmPincode,
//         dealerDisplayName       :   req.body.dealerDisplayName,
//         dealerMobileNumber      :   req.body.dealerMobileNumber,
//         dealerWhatsAppNumber    :   req.body.dealerWhatsAppNumber,
//         dealerEmailId           :   req.body.dealerEmailId
//     }   
//     sql_queries_updatedetails = `UPDATE dealer_details SET dealerFirstName = '${data.dealerFirstName}',  
//                                                            dealerLastName = '${data.dealerLastName}', 
//                                                            dealerGender = '${data.dealerGender}',
//                                                            dealerFirmName = '${data.dealerFirmName}',
//                                                            dealerFirmAddressLine1 = '${data.dealerFirmAddressLine1}',
//                                                            dealerFirmAddressLine2 = '${data.dealerFirmAddressLine2}',
//                                                            dealerFirmState = '${data.dealerFirmState}',
//                                                            dealerFirmCity = '${data.dealerFirmCity}',
//                                                            dealerFirmPincode = '${data.dealerFirmPincode}',
//                                                            dealerDisplayName = '${data.dealerDisplayName}',
//                                                            dealerMobileNumber = '${data.dealerMobileNumber}',
//                                                            dealerWhatsAppNumber = '${data.dealerWhatsAppNumber}',
//                                                            dealerEmailId = '${data.dealerEmailId}'
//                                                            WHERE dealerId = '${data.dealerId}'`;
//     pool.query(sql_queries_updatedetails,(err,data)=>{
//         if(err) return res.send(err);
//         return res.json(data);
//     })
// }

const updateDealerDetails = async(req,res) =>{
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
}

module.exports = { 
                   getDealerDetails, 
                   addDealerDetails, 
                   getDealerDetailsByAgentId, 
                   removeDealerDetails, 
                   getDealerDetailsById,
                   updateDealerDetails 
                }