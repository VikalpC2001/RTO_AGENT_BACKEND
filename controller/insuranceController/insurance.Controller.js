const mysql = require('mysql');
const pool = require('../../database');

const getInsuranceDetails = async(req,res) => {
    const sql_querry_getdetails = `SELECT InsuranceId ,insuranceCompanyName FROM insurance_data ORDER BY insuranceCompanyName`;
    pool.query(sql_querry_getdetails,(err,data)=>{
        if(err) return res.send(err)
        return res.json(data)
    })
}

module.exports = {getInsuranceDetails};