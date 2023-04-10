const jwt = require('jsonwebtoken');
const asyncHandler = require("express-async-handler");
const pool = require('../database');

const protect = asyncHandler(async (req, res, next) => {
    let token 
    if(
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ){
        try {
            console.log(">>>>????",req.headers.authorization);
            token = req.headers.authorization.split(" ")[1];
      
            //decodes token id
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            //SQL Code 
            const sql_querry_getdetailsById = `SELECT * FROM agent_details WHERE agentId = "${decoded.id.id}"`;
            pool.query(sql_querry_getdetailsById,(err,data)=>{
                if(err) return res.send(err)
                if(data && data[0].isAdminrights == decoded.id.rights){
                    next();
                }else{
                    res.status(401);
                }
            })
          } catch (error) {
            res.status(401);
            throw new Error("Not authorized, token failed");
          }
    }
    if (!token) {
        res.status(401);
        throw new Error("Not authorized, no token");
      }
});

module.exports = {protect} ;