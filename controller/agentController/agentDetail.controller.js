const mysql = require('mysql');
const pool = require('../../database');
const { generateToken } = require('../../utils/genrateToken');

const getAgentDetails = async(req,res) => {

    // console.log('>>>><<<<<',req.query);
    const page = req.query.page;
    const numPerPage = req.query.numPerPage;
    const skip = (page-1) * numPerPage; 
    const limit = skip + ',' + numPerPage;
    const sql_querry_getdetails = `SELECT count(*) as numRows FROM agent_details`;
    pool.query(sql_querry_getdetails,(err, rows, fields)=>{
        if(err) {
            console.log("error: ", err);
            result(err, null);
        }else{
            const numRows = rows[0].numRows;
            const numPages = Math.ceil(numRows / numPerPage);
            pool.query(`SELECT agentId, agentFirstName, DATE_FORMAT(agentBirthDate, '%d-%M-%Y')as BirthDate FROM agent_details LIMIT ` + limit,(err, rows, fields) =>{
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

const addAgentDetails = async(req,res) => {

        const uid1 = new Date();
        const uid2 = (new Date().getTime()).toString(36);
        console.log("Milisecond Id :-","Agent_" + uid1.getTime() + "_" + uid2);
        const id = String("Agent_" + uid1.getTime() + "_" + uid2);
        console.log("...",id);

    const data = {
        agentFirstName      : req.body.agentFirstName,
        agentMiddleName     : req.body.agentMiddleName,
        agentLastName       : req.body.agentLastName,
        agentGender         : req.body.agentGender,
        agentBirthDate      : new Date(req.body.agentBirthDate?req.body.agentBirthDate:"01/01/2001").toISOString().slice(0, 10),
        agentAddressLine1   : req.body.agentAddressLine1,
        agentAddressLine2   : req.body.agentAddressLine2,
        agentCity           : req.body.agentCity,
        agentState          : req.body.agentState,
        agentPincode        : req.body.agentPincode,
        agentMobileNumber   : req.body.agentMobileNumber,
        agentEmailId        : req.body.agentEmailId,
        agentPassword       : req.body.agentPassword ? req.body.agentPassword : "admin",
        isAdminrights       : req.body.isAdminrights ? req.body.isAdminrights : 0
    }
    if(!data.agentFirstName || !data.agentMiddleName || !data.agentLastName || !data.agentGender ||
       !data.agentBirthDate || !data.agentAddressLine1 || !data.agentAddressLine2 || !data.agentState || !data.agentCity ||
       !data.agentPincode || !data.agentMobileNumber || !data.agentEmailId){
                res.status(400);
                res.send("Please Fill all the feilds")
    }else{
        const sql_querry_adddetails = `INSERT INTO agent_details (agentId, agentFirstName, agentMiddleName, agentLastName, 
                                                                  agentGender, agentBirthDate, agentAddressLine1, 
                                                                  agentAddressLine2, agentCity, agentState, 
                                                                  agentPincode, agentMobileNumber, agentEmailId, 
                                                                  agentPassword, isAdminrights) 
                                        VALUES ('${id}','${data.agentFirstName}','${data.agentMiddleName}','${data.agentLastName}',
                                        '${data.agentGender}','${data.agentBirthDate}','${data.agentAddressLine1}',
                                        '${data.agentAddressLine2}','${data.agentCity}','${data.agentState}',
                                        '${data.agentPincode}','${data.agentMobileNumber}','${data.agentEmailId}',
                                        '${data.agentPassword}','${data.isAdminrights}')`;
        pool.query(sql_querry_adddetails,(err,data)=>{
        if(err) return res.json(err)
        return res.json(data)
        })
    }
}

const removeAgentDetails = async(req,res) =>{
    const data = {
        agentId : req.body.agentId
    }
    const sql_querry_removedetails = `DELETE FROM agent_details WHERE agentId = '${data.agentId}'`;
    pool.query(sql_querry_removedetails,(err,data)=>{
        if(err) return res.json(err)
        return res.json(data)
    })
}


const updateAgentDetails = async(req,res) =>{
    const data = {
        agentId             : req.body.agentId,
        agentFirstName      : req.body.agentFirstName,
        agentMiddleName     : req.body.agentMiddleName,
        agentLastName       : req.body.agentLastName,
        agentGender         : req.body.agentGender,
        agentBirthDate      : new Date(req.body.agentBirthDate?req.body.agentBirthDate:"01/01/2001").toISOString().slice(0, 10),
        agentAddressLine1   : req.body.agentAddressLine1,
        agentAddressLine2   : req.body.agentAddressLine2,
        agentCity           : req.body.agentCity,
        agentState          : req.body.agentState,
        agentPincode        : req.body.agentPincode,
        agentMobileNumber   : req.body.agentMobileNumber,
        agentEmailId        : req.body.agentEmailId,
        agentPassword       : req.body.agentPassword,
        isAdminrights       : req.body.isAdminrights
    }
    const sql_querry_updatedetails = `UPDATE agent_details SET agentFirstName = '${data.agentFirstName}', 
                                                               agentMiddleName = '${data.agentMiddleName}', 
                                                               agentLastName = '${data.agentLastName}', 
                                                               agentGender = '${data.agentGender}',
                                                               agentBirthDate = '${data.agentBirthDate}',
                                                               agentAddressLine1 = '${data.agentAddressLine1}',
                                                               agentAddressLine2 = '${data.agentAddressLine2}',
                                                               agentCity = '${data.agentCity}',
                                                               agentState = '${data.agentState}',
                                                               agentPincode = '${data.agentPincode}',
                                                               agentMobileNumber = '${data.agentMobileNumber}',
                                                               agentEmailId = '${data.agentEmailId}',
                                                               agentPassword = '${data.agentPassword}',
                                                               isAdminrights = '${data.isAdminrights}'
                                                               WHERE agentId = '${data.agentId}'`;
    pool.query(sql_querry_updatedetails,(err,data) =>{
        if(err) return res.json(err)
        return res.json(data)
    })
}

const authUser = async(req,res) =>{
    const user = {
        agentEmailId        : req.body.agentEmailId,
        agentPassword       : req.body.agentPassword
    }
    console.log(">>>",user);
    const sql_querry_authuser = `SELECT * FROM agent_details WHERE agentEmailId = '${user.agentEmailId}'`;
    pool.query(sql_querry_authuser,(err,data) =>{
        // console.log("<<<",data[0].agentPassword === user.agentPassword,data,user.agentPassword)
        if(data[0] && data[0].agentPassword == user.agentPassword){
            res.json({
                agentId: data[0].agentId,
                isAdminrights: data[0].isAdminrights,
                token: generateToken({id:data[0].agentId,rights:data[0].isAdminrights}), 
            });
            console.log("??",generateToken({id:data[0].agentId,rights:data[0].isAdminrights}),new Date());
        }
        else{
            res.status(400);
            res.send("Invalid Email or Password");
        }
    })
}

module.exports = {
                  addAgentDetails, 
                  getAgentDetails, 
                  removeAgentDetails, 
                  updateAgentDetails, 
                  authUser 
                }
