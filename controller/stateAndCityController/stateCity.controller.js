const mysql = require('mysql');
const pool = require('../../database');

const getStateDetails = async(req,res) => {
    const sql_querry_getdetails = `SELECT stateId ,stateName FROM state_data`;
    pool.query(sql_querry_getdetails,(err,data)=>{
        if(err) return res.send(err)
        return res.json(data)
    })
}

const getCityDetails = async(req,res) =>{
    const sql_querry_getdetails = `SELECT cityId ,cityName FROM city_data`;
    pool.query(sql_querry_getdetails,(err,data)=>{
        if(err) return res.send(err)
        return res.json(data)
    })
}

const getCityDetailswithRTOcode = async(req,res) =>{
    const sql_querry_getdetails = `SELECT cityId , CONCAT(cityName,'(',cityRTOcode,')') AS CityName FROM city_data;`;
    pool.query(sql_querry_getdetails,(err,data)=>{
        if(err) return res.send(err)
        return res.json(data)
    })
}

module.exports = {getStateDetails , getCityDetails , getCityDetailswithRTOcode};