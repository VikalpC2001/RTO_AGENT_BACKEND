const dotenv = require('dotenv').config()
const mysql = require('mysql');

const pool = mysql.createConnection({
    connectionLimit : process.env.SQL_CONNECTIONLIMIT,
    host            : process.env.SQL_HOST,
    user            : process.env.SQL_USER,
    password        : process.env.SQL_PASSWORD,
    database        : process.env.SQL_DATABASE
})
 
module.exports = pool
