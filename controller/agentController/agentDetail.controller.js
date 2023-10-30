const mysql = require('mysql');
const pool = require('../../database');
const jwt = require("jsonwebtoken");
const { generateToken } = require('../../utils/genrateToken');

const getAgentDetails = async (req, res) => {

    // console.log('>>>><<<<<',req.query);
    const page = req.query.page;
    const numPerPage = req.query.numPerPage;
    const skip = (page - 1) * numPerPage;
    const limit = skip + ',' + numPerPage;
    const sql_querry_getdetails = `SELECT count(*) as numRows FROM agent_details`;
    pool.query(sql_querry_getdetails, (err, rows, fields) => {
        if (err) {
            return res.status(404).send(err);
        } else {
            const numRows = rows[0].numRows;
            const numPages = Math.ceil(numRows / numPerPage);
            pool.query(`SELECT @a:=@a+1 AS serial_number, agentId, CONCAT(agentFirstName," ",agentLastName) AS agentName, agentEmailId, agentMobileNumber 
                               FROM (SELECT @a:= 0) AS a,agent_details LIMIT ` + limit, (err, rows, fields) => {
                if (err) {
                    return res.status(404).send(err);
                } else {
                    console.log(rows);
                    console.log(numRows);
                    console.log("Total Page :-", numPages);
                    return res.send({ rows, numRows });
                    // res.send(null,fields,data,numPages);
                }
            });
        }
        // if(err) return res.send(err)
        // return res.json(data)
    })
}

const addAgentDetails = async (req, res) => {

    const uid1 = new Date();
    const uid2 = (new Date().getTime()).toString(36);
    console.log("Milisecond Id :-", "Agent_" + uid1.getTime() + "_" + uid2);
    const id = String("Agent_" + uid1.getTime() + "_" + uid2);
    console.log("...", id);

    const data = {
        agentFirstName: req.body.agentFirstName,
        agentMiddleName: req.body.agentMiddleName,
        agentLastName: req.body.agentLastName,
        agentGender: req.body.agentGender,
        agentBirthDate: new Date(req.body.agentBirthDate ? req.body.agentBirthDate : "01/01/2001").toString().slice(4, 15),
        agentAddressLine1: req.body.agentAddressLine1,
        agentAddressLine2: req.body.agentAddressLine2,
        agentCity: req.body.agentCity,
        agentState: req.body.agentState,
        agentPincode: req.body.agentPincode,
        agentMobileNumber: req.body.agentMobileNumber,
        agentEmailId: req.body.agentEmailId,
        agentPassword: req.body.agentPassword ? req.body.agentPassword : "admin",
        isAdminrights: req.body.isAdminrights ? req.body.isAdminrights : 0
    }
    if (!data.agentFirstName || !data.agentMiddleName || !data.agentLastName || !data.agentGender ||
        !data.agentBirthDate || !data.agentAddressLine1 || !data.agentAddressLine2 || !data.agentState || !data.agentCity ||
        !data.agentPincode || !data.agentMobileNumber || !data.agentEmailId) {
        res.status(400);
        res.send("Please Fill all the feilds")
    } else {
        req.body.agentEmailId = pool.query(`SELECT agentEmailId FROM agent_details WHERE agentEmailId= '${data.agentEmailId}'`, function (err, row) {
            if (row && row.length) {
                return res.send('Email is Already In Use');
            } else {
                const sql_querry_adddetails = `INSERT INTO agent_details (agentId, agentFirstName, agentMiddleName, agentLastName,
                                                                          agentGender, agentBirthDate, agentAddressLine1, 
                                                                          agentAddressLine2, agentCity, agentState, 
                                                                          agentPincode, agentMobileNumber, agentEmailId,  
                                                                          agentPassword, isAdminrights) 
                                                VALUES ('${id}','${data.agentFirstName}','${data.agentMiddleName}','${data.agentLastName}',
                                                '${data.agentGender}',STR_TO_DATE('${data.agentBirthDate}','%b %d %Y'),'${data.agentAddressLine1}',
                                                '${data.agentAddressLine2}','${data.agentCity}','${data.agentState}',
                                                '${data.agentPincode}','${data.agentMobileNumber}','${data.agentEmailId}',
                                                '${data.agentPassword}','${data.isAdminrights}')`;
                pool.query(sql_querry_adddetails, (err, data) => {
                    if (err) return res.status(404).send(err);
                    return res.status(200),
                        res.json("User Added Successfully");
                })
            }
        })
    }
}

const removeAgentDetails = async (req, res) => {
    const data = {
        agentId: req.body.agentId
    }
    const sql_querry_removedetails = `DELETE FROM agent_details WHERE agentId = '${data.agentId}'`;
    pool.query(sql_querry_removedetails, (err, data) => {
        if (err) return res.status(404).send(err);
        return res.json(data)
    })
}


const updateAgentDetails = async (req, res) => {
    const data = {
        agentId: req.body.agentId,
        agentFirstName: req.body.agentFirstName,
        agentMiddleName: req.body.agentMiddleName,
        agentLastName: req.body.agentLastName,
        agentGender: req.body.agentGender,
        agentBirthDate: new Date(req.body.agentBirthDate ? req.body.agentBirthDate : "01/01/2001").toISOString().slice(0, 10),
        agentAddressLine1: req.body.agentAddressLine1,
        agentAddressLine2: req.body.agentAddressLine2,
        agentCity: req.body.agentCity,
        agentState: req.body.agentState,
        agentPincode: req.body.agentPincode,
        agentMobileNumber: req.body.agentMobileNumber,
        agentEmailId: req.body.agentEmailId,
        agentPassword: req.body.agentPassword,
        isAdminrights: req.body.isAdminrights
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
    pool.query(sql_querry_updatedetails, (err, data) => {
        if (err) return res.status(404).send(err);
        return res.json(data);
    })
}

const authUser = async (req, res) => {

    function getCurrentDate() {
        const now = new Date();
        const hours = now.getHours();
        console.log(hours, hours >= 1);

        if (hours <= 2) { // If it's 2 AM or later, increment the date
            now.setDate(now.getDate() - 1);
        }

        return now.toDateString();
    }

    const currentDate = getCurrentDate();
    console.log(currentDate);



    const user = {
        agentEmailId: req.body.agentEmailId,
        agentPassword: req.body.agentPassword
    }
    console.log(">>>", user);
    const sql_querry_authuser = `SELECT * FROM agent_details WHERE agentEmailId = '${user.agentEmailId}'`;
    pool.query(sql_querry_authuser, (err, data) => {
        if (err) return res.status(404).send(err);
        // console.log("<<<",data[0].agentPassword === user.agentPassword,data,user.agentPassword)
        if (data[0] && data[0].agentPassword == user.agentPassword) {
            res.json({
                agentId: data[0].agentId,
                isAdminrights: data[0].isAdminrights,
                userName: data[0].agentFirstName + " " + data[0].agentLastName,
                token: generateToken({ id: data[0].agentId, rights: data[0].isAdminrights }),
            });
            console.log("??", generateToken({ id: data[0].agentId, rights: data[0].isAdminrights }), new Date());
        }
        else {
            res.status(400);
            res.send("Invalid Email or Password");
        }
    })
}

const CheckJwtTokenExpiredOrNot = (req, res) => {
    try {
        let token;
        token = req.headers.authorization.split(" ")[1];

        // Verify the token with your secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // If the token is successfully verified, you can check the expiration time
        const tokenExpirationTime = new Date(decoded.exp * 1000); // Convert seconds to milliseconds
        const currentTime = new Date();

        if (currentTime < tokenExpirationTime) {
            // Token is still valid
            console.log('Token is not expired.');
            return res.status(200).send(true);
        } else {
            // Token has expired
            console.log('Token has expired.');
            return res.status(200).send(false);
        }
    } catch (error) {
        console.log('JWT Expired')
        return res.status(500).send(false);
    }
}

module.exports = {
    addAgentDetails,
    getAgentDetails,
    removeAgentDetails,
    updateAgentDetails,
    authUser,
    CheckJwtTokenExpiredOrNot
}
