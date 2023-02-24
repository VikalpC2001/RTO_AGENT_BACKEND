const mysql = require('mysql');
const pool = require('../../database');

const getVehicleClass = async(req,res) =>{
    const sql_querry_getdetails = `SELECT vehicleClassId, vehicleClassName  FROM vehicle_class_data`;
    pool.query(sql_querry_getdetails,(err,data)=>{
        if(err) return res.send(err)
        return res.json(data)
    })
}

const getVehicleCategory = async(req,res) =>{
    const sql_querry_getdetails = `SELECT vehicleCategoryId, vehicleCategoryName FROM vehicle_category_data`;
    pool.query(sql_querry_getdetails,(err,data)=>{
        if(err) return res.send(err)
        return res.json(data)
    })
}

const getInsuranceDetails = async(req,res) => {
    const sql_querry_getdetails = `SELECT insuranceId ,insuranceCompanyName FROM insurance_data`;
    pool.query(sql_querry_getdetails,(err,data)=>{
        if(err) return res.send(err)
        return res.json(data)
    })
}


module.exports = { getVehicleClass , getVehicleCategory , getInsuranceDetails};