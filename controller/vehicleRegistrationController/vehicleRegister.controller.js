const mysql = require('mysql');
const pool = require('../../database');
const jwt = require("jsonwebtoken");
const excelJS = require("exceljs");
var {google} = require('googleapis');
const asyncHandler = require('express-async-handler');

const authenticateGoogle = () => {
    const auth = new google.auth.GoogleAuth({
    //   keyFile: process.env.GOOGLE_SERVICE,
      keyFile: process.env.GOOGLE_SERVICE,
      scopes: "https://www.googleapis.com/auth/drive",
    });
    return auth;
  };

  const dashBoardCountNumber = async(req,res) =>{
    try{
        var d = new Date('09/09/2007');
        (d.setDate(d.getDate() - 1));
        console.log(">>>",d.toString());
        var a = new Date(d)
        a.setFullYear(a.getFullYear() + 1);
        console.log("???",a.toString());
        

        let token;
        token = req.headers.authorization.split(" ")[1];
        if(token){
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const agentId = decoded.id.id;
            sql_queries_getdetailsByid = `SELECT COUNT(*) AS TotalBooksOfAgent FROM vehicle_registration_details WHERE agentId = '${agentId}';
                                          SELECT COUNT(*) AS PendingBooksOfAgent FROM vehicle_registration_details WHERE agentId = '${agentId}' AND vehicleWorkStatus = "PENDING";
                                          SELECT COUNT(*) AS AppointmentBooksOfAgent FROM vehicle_registration_details WHERE agentId = '${agentId}' AND vehicleWorkStatus = "APPOINTMENT";
                                          SELECT COUNT(*) AS CompleteBooksOfAgent FROM vehicle_registration_details WHERE agentId = '${agentId}' AND vehicleWorkStatus = "COMPLETE";                                   `;

            pool.query(sql_queries_getdetailsByid,(err,data)=>{
            if(err) return res.status(404).send(err);
            const Number = {
                'AllBook'            : data[0][0]['TotalBooksOfAgent'],
                'AllPendingBook'     : data[1][0]['PendingBooksOfAgent'],
                'AllAppointmentBook' : data[2][0]['AppointmentBooksOfAgent'],
                'AllCompleteBook'    : data[3][0]['CompleteBooksOfAgent']
            }
            return res.json(Number);
            })       
        }
        else{
            res.status(401);
            res.send("Please Login Firest.....!");
        }
    }catch(error){
        throw new Error(error);
    }   
}

const getListOfVehicleRegistrationDetails = async(req,res)=>{
    try{
        const page = req.query.page;
        const numPerPage = req.query.numPerPage;
        const skip = (page-1) * numPerPage; 
        const limit = skip + ',' + numPerPage;
        let token;
        token = req.headers.authorization.split(" ")[1];
        if(token){
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const agentId = decoded.id.id;
            const data = {
                searchOption    :  req.query.searchOption,
                startDate       :  new Date(req.query.startDate?req.query.startDate:null).toString().slice(4,15),
                endDate         :  new Date(req.query.endDate?req.query.endDate:null).toString().slice(4,15),
                appointmentDate :  new Date(req.query.appointmentDate?req.query.appointmentDate:null).toString().slice(4,15),
                dealerId        :  req.query.dealerId,
                workStatus      :  req.query.workStatus,
                workCategory    :  req.query.workCategory,
                searchWord      :  req.query.searchWord
            }
            if(req.query.dealerId && req.query.searchWord){

                sql_queries_getVehicleDetailsPagination = `SELECT count(*) as numRows FROM vehicle_registration_details WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicle_registration_details.dealerId = '${data.dealerId}' AND vehicleRegistrationNumber LIKE'%`+data.searchWord+`%'`;

            }else if(req.query.searchWord){

                sql_queries_getVehicleDetailsPagination = `SELECT count(*) as numRows FROM vehicle_registration_details WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicleRegistrationNumber LIKE'%`+data.searchWord+`%'`;
            
            }else if(req.query.workCategory && req.query.workStatus && req.query.startDate && req.query.endDate && req.query.dealerId){

                sql_queries_getVehicleDetailsPagination = `SELECT count(*) as numRows FROM vehicle_registration_details WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicle_registration_details.dealerId = '${data.dealerId}' AND currentState = ${data.workCategory} AND vehicleWorkStatus = '${data.workStatus}' AND vehicleRegistrationCreationDate BETWEEN STR_TO_DATE('${data.startDate}','%b %d %Y') AND STR_TO_DATE('${data.endDate}','%b %d %Y')`;

            }else if(req.query.startDate && req.query.endDate && req.query.dealerId && req.query.workStatus){

                sql_queries_getVehicleDetailsPagination = `SELECT count(*) as numRows FROM vehicle_registration_details WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicle_registration_details.dealerId = '${data.dealerId}' AND vehicleWorkStatus = '${data.workStatus}' AND vehicleRegistrationCreationDate BETWEEN STR_TO_DATE('${data.startDate}','%b %d %Y') AND STR_TO_DATE('${data.endDate}','%b %d %Y')`;

            }else if(req.query.workCategory && req.query.startDate && req.query.endDate && req.query.dealerId){

                sql_queries_getVehicleDetailsPagination = `SELECT count(*) as numRows FROM vehicle_registration_details WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicle_registration_details.dealerId = '${data.dealerId}' AND currentState = ${data.workCategory} AND vehicleRegistrationCreationDate BETWEEN STR_TO_DATE('${data.startDate}','%b %d %Y') AND STR_TO_DATE('${data.endDate}','%b %d %Y')`;

            }else if(req.query.workCategory && req.query.startDate && req.query.endDate && req.query.workStatus){

                sql_queries_getVehicleDetailsPagination = `SELECT count(*) as numRows FROM vehicle_registration_details WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicleWorkStatus = '${data.workStatus}' AND currentState = ${data.workCategory} AND vehicleRegistrationCreationDate BETWEEN STR_TO_DATE('${data.startDate}','%b %d %Y') AND STR_TO_DATE('${data.endDate}','%b %d %Y')`;

            }else if(req.query.workCategory && req.query.startDate && req.query.endDate){

                sql_queries_getVehicleDetailsPagination = `SELECT count(*) as numRows FROM vehicle_registration_details WHERE vehicle_registration_details.agentId = '${agentId}' AND currentState = ${data.workCategory} AND vehicleRegistrationCreationDate BETWEEN STR_TO_DATE('${data.startDate}','%b %d %Y') AND STR_TO_DATE('${data.endDate}','%b %d %Y')`;

            }else if(req.query.dealerId && req.query.startDate && req.query.endDate){

                sql_queries_getVehicleDetailsPagination = `SELECT count(*) as numRows FROM vehicle_registration_details WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicle_registration_details.dealerId = '${data.dealerId}' AND vehicleRegistrationCreationDate BETWEEN STR_TO_DATE('${data.startDate}','%b %d %Y') AND STR_TO_DATE('${data.endDate}','%b %d %Y')`;

            }else if(req.query.workStatus && req.query.startDate && req.query.endDate){

                sql_queries_getVehicleDetailsPagination = `SELECT count(*) as numRows FROM vehicle_registration_details WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicleWorkStatus = '${data.workStatus}' AND vehicleRegistrationCreationDate BETWEEN STR_TO_DATE('${data.startDate}','%b %d %Y') AND STR_TO_DATE('${data.endDate}','%b %d %Y')`;

            }else if(req.query.startDate && req.query.endDate){

                sql_queries_getVehicleDetailsPagination = `SELECT count(*) as numRows FROM vehicle_registration_details WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicleRegistrationCreationDate BETWEEN STR_TO_DATE('${data.startDate}','%b %d %Y') AND STR_TO_DATE('${data.endDate}','%b %d %Y')`;

            }else if(req.query.workCategory && req.query.dealerId){

                sql_queries_getVehicleDetailsPagination = `SELECT count(*) as numRows FROM vehicle_registration_details WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicle_registration_details.dealerId = '${data.dealerId}' AND currentState = ${data.workCategory}`;

            }else if(req.query.workCategory && req.query.workStatus){

                sql_queries_getVehicleDetailsPagination = `SELECT count(*) as numRows FROM vehicle_registration_details WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicleWorkStatus = '${data.workStatus}' AND currentState = ${data.workCategory}`;

            }else if(req.query.dealerId && req.query.workStatus){

                sql_queries_getVehicleDetailsPagination = `SELECT count(*) as numRows FROM vehicle_registration_details WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicle_registration_details.dealerId = '${data.dealerId}' AND vehicleWorkStatus = '${data.workStatus}'`;

            }else if(req.query.appointmentDate && req.query.workStatus === 'APPOINTMENT'){

                sql_queries_getVehicleDetailsPagination = `SELECT count(*) as numRows FROM vehicle_registration_details LEFT JOIN rto_receipt_data ON rto_receipt_data.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId WHERE vehicle_registration_details.agentId = '${agentId}' AND rto_receipt_data.appointmentDate = STR_TO_DATE('${data.appointmentDate}','%b %d %Y')`;

            }else if(req.query.workCategory){

                sql_queries_getVehicleDetailsPagination = `SELECT count(*) as numRows FROM vehicle_registration_details WHERE vehicle_registration_details.agentId = '${agentId}' AND currentState = ${data.workCategory}`;

            }else if(req.query.searchOption === 'lastUpdated' && req.query.dealerId){

                sql_queries_getVehicleDetailsPagination = `SELECT count(*) as numRows FROM vehicle_registration_details WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicle_registration_details.dealerId = '${data.dealerId}' AND vehicleRegistrationCreationDate = (SELECT MAX(vehicleRegistrationCreationDate) FROM vehicle_registration_details WHERE vehicle_registration_details.dealerId = '${data.dealerId}')`;

            }else if(req.query.dealerId){

                sql_queries_getVehicleDetailsPagination = `SELECT count(*) as numRows FROM vehicle_registration_details WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicle_registration_details.dealerId = '${data.dealerId}'`;

            }else if(req.query.workStatus){

                sql_queries_getVehicleDetailsPagination = `SELECT count(*) as numRows FROM vehicle_registration_details WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicleWorkStatus = '${data.workStatus}'`;

            }
            else if(req.query.searchOption === 'lastUpdated'){

                sql_queries_getVehicleDetailsPagination = `SELECT count(*) as numRows FROM vehicle_registration_details WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicleRegistrationCreationDate = (SELECT MAX(vehicleRegistrationCreationDate) FROM vehicle_registration_details WHERE agentId = '${agentId}')`;

            }else{

                sql_queries_getVehicleDetailsPagination = `SELECT count(*) as numRows FROM vehicle_registration_details WHERE vehicle_registration_details.agentId = '${agentId}'`;

            }
            
            pool.query(sql_queries_getVehicleDetailsPagination,(err,rows) =>{
                if(err) {
                    return res.send(err);
                }else{
                    const numRows = rows[0].numRows;
                    const numPages = Math.ceil(numRows / numPerPage);
                    if(req.query.dealerId && req.query.searchWord){

                        sql_query = `SELECT vehicle_registration_details.vehicleRegistrationId, UPPER(vehicleRegistrationNumber) As vehicleRegistrationNumber, GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType,
                                            COALESCE(CONCAT(dealer_details.dealerFirmName,"(",dealer_details.dealerDisplayName,")"),privateCustomerName) AS "Dealer/Customer" ,clientWhatsAppNumber ,vehicleWorkStatus  
                                            FROM vehicle_registration_details
                                            LEFT JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                            LEFT JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                                            LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                            WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicle_registration_details.dealerId = '${data.dealerId}' AND vehicleRegistrationNumber LIKE'%`+data.searchWord+`%'
                                            GROUP BY work_list.vehicleRegistrationId ORDER BY RIGHT(vehicleRegistrationNumber,4) LIMIT ${limit}`;

                    }else if(req.query.searchWord){
                        sql_query = `SELECT vehicle_registration_details.vehicleRegistrationId, UPPER(vehicleRegistrationNumber) As vehicleRegistrationNumber, GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType,
                                                    COALESCE(CONCAT(dealer_details.dealerFirmName,"(",dealer_details.dealerDisplayName,")"),privateCustomerName) AS "Dealer/Customer" ,clientWhatsAppNumber ,vehicleWorkStatus  
                                                    FROM vehicle_registration_details
                                                    LEFT JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                                    LEFT JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                                                    LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                                    WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicleRegistrationNumber LIKE'%`+data.searchWord+`%'
                                                    GROUP BY work_list.vehicleRegistrationId ORDER BY RIGHT(vehicleRegistrationNumber,4) LIMIT ${limit}`;
        
                    }else if(req.query.workCategory && req.query.workStatus && req.query.startDate && req.query.endDate && req.query.dealerId){

                        sql_query = `SELECT vehicle_registration_details.vehicleRegistrationId, UPPER(vehicleRegistrationNumber) AS vehicleRegistrationNumber, GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType,
                                            COALESCE(CONCAT(dealer_details.dealerFirmName,"(",dealer_details.dealerDisplayName,")"),privateCustomerName) AS "Dealer/Customer" ,clientWhatsAppNumber ,vehicleWorkStatus  
                                            FROM vehicle_registration_details
                                            INNER JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                            INNER JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                                            LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                            WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicle_registration_details.dealerId = '${data.dealerId}' AND currentState = ${data.workCategory} AND vehicleWorkStatus = '${data.workStatus}' AND vehicleRegistrationCreationDate BETWEEN STR_TO_DATE('${data.startDate}','%b %d %Y') AND STR_TO_DATE('${data.endDate}','%b %d %Y')
                                            GROUP BY work_list.vehicleRegistrationId ORDER BY RIGHT(vehicleRegistrationNumber,4) LIMIT ${limit}`;

                    }else if(req.query.startDate && req.query.endDate && req.query.dealerId && req.query.workStatus){

                        sql_query = `SELECT vehicle_registration_details.vehicleRegistrationId, UPPER(vehicleRegistrationNumber) As vehicleRegistrationNumber, GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType,
                                            COALESCE(CONCAT(dealer_details.dealerFirmName,"(",dealer_details.dealerDisplayName,")"),privateCustomerName) AS "Dealer/Customer" ,clientWhatsAppNumber ,vehicleWorkStatus   
                                            FROM vehicle_registration_details
                                            LEFT JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                            LEFT JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                                            LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                            WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicle_registration_details.dealerId = '${data.dealerId}' AND vehicleWorkStatus = '${data.workStatus}' AND vehicleRegistrationCreationDate BETWEEN STR_TO_DATE('${data.startDate}','%b %d %Y') AND STR_TO_DATE('${data.endDate}','%b %d %Y') 
                                            GROUP BY work_list.vehicleRegistrationId ORDER BY RIGHT(vehicleRegistrationNumber,4) LIMIT ${limit}`;

                    }else if(req.query.workCategory && req.query.startDate && req.query.endDate && req.query.dealerId){

                        sql_query = `SELECT vehicle_registration_details.vehicleRegistrationId, UPPER(vehicleRegistrationNumber) AS vehicleRegistrationNumber, GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType,
                                            COALESCE(CONCAT(dealer_details.dealerFirmName,"(",dealer_details.dealerDisplayName,")"),privateCustomerName) AS "Dealer/Customer" ,clientWhatsAppNumber ,vehicleWorkStatus  
                                            FROM vehicle_registration_details
                                            INNER JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                            INNER JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                                            LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                            WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicle_registration_details.dealerId = '${data.dealerId}' AND currentState = ${data.workCategory} AND vehicleRegistrationCreationDate BETWEEN STR_TO_DATE('${data.startDate}','%b %d %Y') AND STR_TO_DATE('${data.endDate}','%b %d %Y')
                                            GROUP BY work_list.vehicleRegistrationId ORDER BY RIGHT(vehicleRegistrationNumber,4) LIMIT ${limit}`;

                    }else if(req.query.workCategory && req.query.startDate && req.query.endDate && req.query.workStatus){

                        sql_query = `SELECT vehicle_registration_details.vehicleRegistrationId, UPPER(vehicleRegistrationNumber) AS vehicleRegistrationNumber, GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType,
                                            COALESCE(CONCAT(dealer_details.dealerFirmName,"(",dealer_details.dealerDisplayName,")"),privateCustomerName) AS "Dealer/Customer" ,clientWhatsAppNumber ,vehicleWorkStatus  
                                            FROM vehicle_registration_details
                                            INNER JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                            INNER JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                                            LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                            WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicleWorkStatus = '${data.workStatus}' AND currentState = ${data.workCategory} AND vehicleRegistrationCreationDate BETWEEN STR_TO_DATE('${data.startDate}','%b %d %Y') AND STR_TO_DATE('${data.endDate}','%b %d %Y')
                                            GROUP BY work_list.vehicleRegistrationId ORDER BY RIGHT(vehicleRegistrationNumber,4) LIMIT ${limit}`;

                    }else if(req.query.workCategory && req.query.startDate && req.query.endDate){

                        sql_query = `SELECT vehicle_registration_details.vehicleRegistrationId, UPPER(vehicleRegistrationNumber) AS vehicleRegistrationNumber, GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType,
                                            COALESCE(CONCAT(dealer_details.dealerFirmName,"(",dealer_details.dealerDisplayName,")"),privateCustomerName) AS "Dealer/Customer" ,clientWhatsAppNumber ,vehicleWorkStatus 
                                            FROM vehicle_registration_details
                                            INNER JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                            INNER JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                                            LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                            WHERE vehicle_registration_details.agentId = '${agentId}' AND currentState = ${data.workCategory} AND vehicleRegistrationCreationDate BETWEEN STR_TO_DATE('${data.startDate}','%b %d %Y') AND STR_TO_DATE('${data.endDate}','%b %d %Y')
                                            GROUP BY work_list.vehicleRegistrationId ORDER BY RIGHT(vehicleRegistrationNumber,4) LIMIT ${limit}`;

                    }else if(req.query.dealerId && req.query.startDate && req.query.endDate){

                        sql_query = `SELECT vehicle_registration_details.vehicleRegistrationId, UPPER(vehicleRegistrationNumber) As vehicleRegistrationNumber, GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType,
                                            COALESCE(CONCAT(dealer_details.dealerFirmName,"(",dealer_details.dealerDisplayName,")"),privateCustomerName) AS "Dealer/Customer" ,clientWhatsAppNumber ,vehicleWorkStatus 
                                            FROM vehicle_registration_details
                                            LEFT JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                            LEFT JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                                            LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                            WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicle_registration_details.dealerId = '${data.dealerId}' AND vehicleRegistrationCreationDate BETWEEN STR_TO_DATE('${data.startDate}','%b %d %Y') AND STR_TO_DATE('${data.endDate}','%b %d %Y') 
                                            GROUP BY work_list.vehicleRegistrationId ORDER BY RIGHT(vehicleRegistrationNumber,4) LIMIT ${limit}`;

                    }else if(req.query.workStatus && req.query.startDate && req.query.endDate){

                        sql_query = `SELECT vehicle_registration_details.vehicleRegistrationId, UPPER(vehicleRegistrationNumber) As vehicleRegistrationNumber, GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType,
                                            COALESCE(CONCAT(dealer_details.dealerFirmName,"(",dealer_details.dealerDisplayName,")"),privateCustomerName) AS "Dealer/Customer" ,clientWhatsAppNumber ,vehicleWorkStatus 
                                            FROM vehicle_registration_details
                                            LEFT JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                            LEFT JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                                            LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                            WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicleWorkStatus = '${data.workStatus}' AND vehicleRegistrationCreationDate BETWEEN STR_TO_DATE('${data.startDate}','%b %d %Y') AND STR_TO_DATE('${data.endDate}','%b %d %Y') 
                                            GROUP BY work_list.vehicleRegistrationId ORDER BY RIGHT(vehicleRegistrationNumber,4) LIMIT ${limit}`;

                    }else if(req.query.startDate && req.query.endDate){

                        sql_query = `SELECT vehicle_registration_details.vehicleRegistrationId, UPPER(vehicleRegistrationNumber) As vehicleRegistrationNumber, GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType,
                                            COALESCE(CONCAT(dealer_details.dealerFirmName,"(",dealer_details.dealerDisplayName,")"),privateCustomerName) AS "Dealer/Customer" ,clientWhatsAppNumber ,vehicleWorkStatus  
                                            FROM vehicle_registration_details
                                            LEFT JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                            LEFT JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                                            LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                            WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicleRegistrationCreationDate BETWEEN STR_TO_DATE('${data.startDate}','%b %d %Y') AND STR_TO_DATE('${data.endDate}','%b %d %Y')  
                                            GROUP BY work_list.vehicleRegistrationId ORDER BY RIGHT(vehicleRegistrationNumber,4) LIMIT ${limit}`;

                    }else if(req.query.workCategory && req.query.dealerId){

                        sql_query = `SELECT vehicle_registration_details.vehicleRegistrationId, UPPER(vehicleRegistrationNumber) AS vehicleRegistrationNumber, GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType,
                                            COALESCE(CONCAT(dealer_details.dealerFirmName,"(",dealer_details.dealerDisplayName,")"),privateCustomerName) AS "Dealer/Customer" ,clientWhatsAppNumber ,vehicleWorkStatus 
                                            FROM vehicle_registration_details
                                            INNER JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                            INNER JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                                            LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                            WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicle_registration_details.dealerId = '${data.dealerId}' AND currentState = ${data.workCategory} 
                                            GROUP BY work_list.vehicleRegistrationId ORDER BY RIGHT(vehicleRegistrationNumber,4) LIMIT ${limit}`;

                    }else if(req.query.workCategory && req.query.workStatus){

                        sql_query = `SELECT vehicle_registration_details.vehicleRegistrationId, UPPER(vehicleRegistrationNumber) AS vehicleRegistrationNumber, GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType,
                                            COALESCE(CONCAT(dealer_details.dealerFirmName,"(",dealer_details.dealerDisplayName,")"),privateCustomerName) AS "Dealer/Customer" ,clientWhatsAppNumber ,vehicleWorkStatus 
                                            FROM vehicle_registration_details
                                            INNER JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                            INNER JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                                            LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                            WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicleWorkStatus = '${data.workStatus}' AND currentState = ${data.workCategory}
                                            GROUP BY work_list.vehicleRegistrationId ORDER BY RIGHT(vehicleRegistrationNumber,4) LIMIT ${limit}`;

                    }else if(req.query.dealerId && req.query.workStatus){

                        sql_query = `SELECT vehicle_registration_details.vehicleRegistrationId, UPPER(vehicleRegistrationNumber) As vehicleRegistrationNumber, GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType,
                                            COALESCE(CONCAT(dealer_details.dealerFirmName,"(",dealer_details.dealerDisplayName,")"),privateCustomerName) AS "Dealer/Customer" ,clientWhatsAppNumber ,vehicleWorkStatus  
                                            FROM vehicle_registration_details
                                            LEFT JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                            LEFT JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                                            LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                            WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicle_registration_details.dealerId = '${data.dealerId}' AND vehicleWorkStatus = '${data.workStatus}'
                                            GROUP BY work_list.vehicleRegistrationId ORDER BY RIGHT(vehicleRegistrationNumber,4) LIMIT ${limit}`;

                    }else if(req.query.appointmentDate && req.query.workStatus === 'APPOINTMENT'){

                        sql_query = `SELECT vehicle_registration_details.vehicleRegistrationId, UPPER(vehicleRegistrationNumber) As vehicleRegistrationNumber, GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType,
                                            COALESCE(CONCAT(dealer_details.dealerFirmName,"(",dealer_details.dealerDisplayName,")"),privateCustomerName) AS "Dealer/Customer" ,clientWhatsAppNumber ,vehicleWorkStatus ,DATE_FORMAT(rto_receipt_data.appointmentDate, "%M %d %Y") 
                                            FROM vehicle_registration_details
                                            Inner JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                            LEFT JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                                            LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                            LEFT JOIN rto_receipt_data ON rto_receipt_data.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                            WHERE vehicle_registration_details.agentId = '${agentId}' AND rto_receipt_data.appointmentDate = STR_TO_DATE('${data.appointmentDate}','%b %d %Y')
                                            GROUP BY work_list.vehicleRegistrationId ORDER BY RIGHT(vehicleRegistrationNumber,4) LIMIT ${limit}`;

                    }else if(req.query.workCategory){

                        sql_query = `SELECT vehicle_registration_details.vehicleRegistrationId, UPPER(vehicleRegistrationNumber) AS vehicleRegistrationNumber, GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType,
                                            COALESCE(CONCAT(dealer_details.dealerFirmName,"(",dealer_details.dealerDisplayName,")"),privateCustomerName) AS "Dealer/Customer" ,clientWhatsAppNumber ,vehicleWorkStatus
                                            FROM vehicle_registration_details
                                            INNER JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                            INNER JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                                            LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                            WHERE vehicle_registration_details.agentId = '${agentId}' AND currentState = ${data.workCategory}
                                            GROUP BY work_list.vehicleRegistrationId ORDER BY RIGHT(vehicleRegistrationNumber,4) LIMIT ${limit}`;

                    }else if(req.query.searchOption === 'lastUpdated' && req.query.dealerId){

                        sql_query = `SELECT vehicle_registration_details.vehicleRegistrationId, UPPER(vehicleRegistrationNumber) As vehicleRegistrationNumber, GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType,
                                            COALESCE(CONCAT(dealer_details.dealerFirmName,"(",dealer_details.dealerDisplayName,")"),privateCustomerName) AS "Dealer/Customer" ,clientWhatsAppNumber ,vehicleWorkStatus  
                                            FROM vehicle_registration_details
                                            LEFT JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                            LEFT JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                                            LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                            WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicle_registration_details.dealerId = '${data.dealerId}' AND vehicleRegistrationCreationDate = (SELECT MAX(vehicleRegistrationCreationDate) FROM vehicle_registration_details WHERE vehicle_registration_details.dealerId = '${data.dealerId}')
                                            GROUP BY work_list.vehicleRegistrationId ORDER BY RIGHT(vehicleRegistrationNumber,4) LIMIT ${limit}`;

                    }else if(req.query.dealerId){

                        sql_query = `SELECT vehicle_registration_details.vehicleRegistrationId, UPPER(vehicleRegistrationNumber) As vehicleRegistrationNumber, GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType,
                                            COALESCE(CONCAT(dealer_details.dealerFirmName,"(",dealer_details.dealerDisplayName,")"),privateCustomerName) AS "Dealer/Customer" ,clientWhatsAppNumber ,vehicleWorkStatus  
                                            FROM vehicle_registration_details
                                            LEFT JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                            LEFT JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                                            LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                            WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicle_registration_details.dealerId = '${data.dealerId}' 
                                            GROUP BY work_list.vehicleRegistrationId ORDER BY RIGHT(vehicleRegistrationNumber,4) LIMIT ${limit}`;

                    }else if(req.query.workStatus){

                        sql_query = `SELECT vehicle_registration_details.vehicleRegistrationId, UPPER(vehicleRegistrationNumber) As vehicleRegistrationNumber, GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType,
                                            COALESCE(CONCAT(dealer_details.dealerFirmName,"(",dealer_details.dealerDisplayName,")"),privateCustomerName) AS "Dealer/Customer" ,clientWhatsAppNumber ,vehicleWorkStatus  
                                            FROM vehicle_registration_details
                                            LEFT JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                            LEFT JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                                            LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                            WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicleWorkStatus = '${data.workStatus}' 
                                            GROUP BY work_list.vehicleRegistrationId ORDER BY RIGHT(vehicleRegistrationNumber,4) LIMIT ${limit}`;

                    }else if(req.query.searchOption === 'lastUpdated'){

                        sql_query = `SELECT vehicle_registration_details.vehicleRegistrationId, UPPER(vehicleRegistrationNumber) As vehicleRegistrationNumber, GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType,
                                            COALESCE(CONCAT(dealer_details.dealerFirmName,"(",dealer_details.dealerDisplayName,")"),privateCustomerName) AS "Dealer/Customer" ,clientWhatsAppNumber ,vehicleWorkStatus  
                                            FROM vehicle_registration_details
                                            LEFT JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                            LEFT JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                                            LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                            WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicleRegistrationCreationDate = (SELECT MAX(vehicleRegistrationCreationDate) FROM vehicle_registration_details WHERE agentId = '${agentId}')
                                            GROUP BY work_list.vehicleRegistrationId ORDER BY RIGHT(vehicleRegistrationNumber,4) LIMIT ${limit}`;

                    }else{

                        sql_query = `SELECT vehicle_registration_details.vehicleRegistrationId, UPPER(vehicleRegistrationNumber) As vehicleRegistrationNumber, GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType,
                                            COALESCE(CONCAT(dealer_details.dealerFirmName,"(",dealer_details.dealerDisplayName,")"),privateCustomerName) AS "Dealer/Customer" ,clientWhatsAppNumber ,vehicleWorkStatus  
                                            FROM vehicle_registration_details
                                            LEFT JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                            LEFT JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                                            LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                            WHERE vehicle_registration_details.agentId = '${agentId}'
                                            GROUP BY work_list.vehicleRegistrationId ORDER BY RIGHT(vehicleRegistrationNumber,4) LIMIT ${limit}`;

                    }
                    console.log(">>",sql_query);
                    pool.query(sql_query,(err, rows, fields) =>{
                        if(err) {
                            return res.status(404).send(err);
                        }else{
                            // console.log(rows);
                            // console.log(numRows);
                            // console.log("Total Page :-",numPages);
                            if(numRows === 0){
                                const rows = [{
                                    'msg' : 'No Data Found'
                                }]
                                return res.send({rows,numRows});
                            }else{
                                return res.send({rows,numRows});
                            }
                            // res.send(null,fields,data,numPages);
                        }
                    });
                }
                // if(err) return res.send(err);
                // return res.json(data);
            })
        }else{
            res.status(401);
            res.send("Please Login Firest.....!");
        }
    }catch(error){
        throw new Error(error);
    }   
}

const getVehicleRegistrationDetailsById = async(req,res) =>{
    try{
        const data = {
            vehicleRegistrationId : req.query.vehicleRegistrationId
        }
        sql_queries_getdetailsByid = `SELECT UPPER(vehicleRegistrationNumber) AS "Regsitration Number", vehicleChassisNumber AS "Chassis Number", vehicleEngineNumber AS "Engine Number", (vehicle_class_data.vehicleClassName) AS "Class",
                                             (vehicle_category_data.vehicleCategoryName) AS "Category", UPPER(vehicleMake) AS "Make", UPPER(vehicleModel) AS "Model", DATE_FORMAT(vehicleRegistrationDate, '%d-%M-%Y') AS "Registration Date", (rto_city_data.cityRTOName) AS "Serviceing Authority"
                                             FROM vehicle_registration_details
                                             LEFT JOIN vehicle_category_data ON vehicle_category_data.vehicleCategoryId = vehicle_registration_details.vehicleCategory
                                             LEFT JOIN vehicle_class_data ON vehicle_class_data.vehicleClassId = vehicle_registration_details.vehicleClass
                                             INNER JOIN rto_city_data ON rto_city_data.RTOcityId = vehicle_registration_details.serviceAuthority
                                             WHERE vehicleRegistrationId = '${data.vehicleRegistrationId}';
                                      SELECT CONCAT(sellerFirstName," ",sellerMiddleName," ",sellerLastName) AS "Owner Name", sellerAddress AS "Address"
                                             FROM vehicle_registration_details
                                             WHERE vehicleRegistrationId = '${data.vehicleRegistrationId}';
                                      SELECT CONCAT(buyerFirstName," ",buyerMiddleName," ",buyerLastName) AS "Buyer Name",
                                             CONCAT(buyerAddressLine1,", ",buyerAddressLine2,", ",buyerAddressLine3) AS "Address", CONCAT(city_data.cityName,", ",state_data.stateName) AS "City/State", buyerPincode AS "Pincode"
                                             FROM vehicle_registration_details
                                             INNER JOIN city_data ON city_data.cityId = vehicle_registration_details.buyerCity
                                             INNER JOIN state_data ON state_data.stateId = vehicle_registration_details.buyerState
                                             WHERE vehicleRegistrationId = '${data.vehicleRegistrationId}';
                                      SELECT puccNumber AS "PUCC Number", DATE_FORMAT(puccStartDate, '%d-%M-%Y') AS "PUCC from", DATE_FORMAT(puccEndDate, '%d-%M-%Y') AS "PUCC upto"
                                             FROM vehicle_registration_details
                                             WHERE vehicleRegistrationId = '${data.vehicleRegistrationId}';       
                                      SELECT insuranceType AS "Insurance Type", (insurance_data.insuranceCompanyName) AS "Insurance Company", policyNumber AS "Policy Number", DATE_FORMAT(insuranceStartDate, '%d-%M-%Y') AS "Insurance from", DATE_FORMAT(insuranceEndDate, '%d-%M-%Y') AS "Insurance upto"
                                             FROM vehicle_registration_details
                                             LEFT JOIN insurance_data ON insurance_data.insuranceId = vehicle_registration_details.insuranceCompanyNameId
                                             WHERE vehicleRegistrationId = '${data.vehicleRegistrationId}';
                                      SELECT vehicleWorkStatus AS "Status", comment AS "Comment", DATE_FORMAT(vehicleRegistrationCreationDate, '%d %M %Y') AS "Rrgister Date"
                                             FROM vehicle_registration_details
                                             WHERE vehicleRegistrationId = '${data.vehicleRegistrationId}';
                                      SELECT GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType, COALESCE(CONCAT(dealer_details.dealerFirmName,"(",dealer_details.dealerDisplayName,")"),privateCustomerName) AS "Dealer/Customer", clientWhatsAppNumber AS "WhatsApp Number"
                                             FROM vehicle_registration_details
                                             INNER JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                             INNER JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                                             LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                             WHERE vehicle_registration_details.vehicleRegistrationId = '${data.vehicleRegistrationId}' GROUP BY work_list.vehicleRegistrationId;
                                      SELECT pdfURL FROM tto_form_data WHERE vehicleRegistrationId = '${data.vehicleRegistrationId}';
                                      SELECT receiptId, receiptURL FROM rto_receipt_data WHERE vehicleRegistrationId = '${data.vehicleRegistrationId}' AND receiptCreationDate = (SELECT MAX(receiptCreationDate) FROM rto_receipt_data WHERE vehicleRegistrationId = '${data.vehicleRegistrationId}');`;
        pool.query(sql_queries_getdetailsByid,(err,data)=>{
            if(err) return res.status(404).send(err);
            const resData = {
                'Vehicle Details'       : data[0][0],
                'Owner Details'         : data[1][0],
                'Buyer Details'         : data[2][0],
                'PUCC Details'          : data[3][0],
                'Insurance Details'     : data[4][0],
                'Status'                : data[5][0],
                'Customer Details'      : data[6][0],
                'TTO Form Link'         : data[7][0],
                'Receipt Id'            : data[8][0]    
             }
            console.log(">>>>",data)
            return res.json(resData);

        })
    }catch(error){
        throw new Error(error);
    }   
}

const getVehicleRegistrationDetailsBydealerId = async(req,res) => {

    // console.log('>>>><<<<<',req.query);
    const page = req.query.page;
    const numPerPage = req.query.numPerPage;
    const skip = (page-1) * numPerPage; 
    const limit = skip + ',' + numPerPage;
    const data = {
        dealerId : req.query.dealerId
    }
    const sql_querry_getdetailsBYdealerId = `SELECT count(*) as numRows FROM vehicle_registration_details WHERE dealerId = '${data.dealerId}'`;
    pool.query(sql_querry_getdetailsBYdealerId,(err, rows, fields)=>{
        if(err) {
            console.log("error: ", err);
            result(err, null);
        }else{
            const numRows = rows[0].numRows;
            const numPages = Math.ceil(numRows / numPerPage);
            pool.query(`SELECT vehicle_registration_details.vehicleRegistrationId, UPPER(vehicleRegistrationNumber) AS vehicleRegistrationNumber, GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType,
                               UPPER(CONCAT(vehicleMake,"/",vehicleModel)) AS vehicleModelMake, clientWhatsAppNumber 
                               FROM (SELECT @a:= 0) AS a, vehicle_registration_details
                               INNER JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                               INNER JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                               WHERE vehicle_registration_details.dealerId  = '${data.dealerId}' GROUP BY work_list.vehicleRegistrationId LIMIT ` + limit,(err, rows, fields) =>{
                if(err) {
                    res.send(err);
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

const exportExcelSheetForVehicleDetails = (req, res) => { 

    let token;
        token = req.headers.authorization.split(" ")[1];
        if(token){
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const agentId = decoded.id.id;
            const data = {
                searchOption    :  req.query.searchOption,
                startDate       :  new Date(req.query.startDate?req.query.startDate:null).toString().slice(4,15),
                endDate         :  new Date(req.query.endDate?req.query.endDate:null).toString().slice(4,15),
                appointmentDate :  new Date(req.query.appointmentDate?req.query.appointmentDate:null).toString().slice(4,15),
                dealerId        :  req.query.dealerId,
                workStatus      :  req.query.workStatus,
                workCategory    :  req.query.workCategory,         
            }

            if(req.query.workCategory && req.query.workStatus && req.query.startDate && req.query.endDate && req.query.dealerId){

                sql_queries_getdetails = `SELECT UPPER(vehicleRegistrationNumber) AS vehicleRegistrationNumber, GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType,
                                                 COALESCE(CONCAT(dealer_details.dealerFirmName,"(",dealer_details.dealerDisplayName,")"),privateCustomerName) AS "Dealer/Customer" ,clientWhatsAppNumber  
                                                 FROM vehicle_registration_details
                                                 INNER JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                                 INNER JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                                                 LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                                 WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicle_registration_details.dealerId = '${data.dealerId}' AND currentState = ${data.workCategory} AND vehicleWorkStatus = '${data.workStatus}' AND vehicleRegistrationCreationDate BETWEEN STR_TO_DATE('${data.startDate}','%b %d %Y') AND STR_TO_DATE('${data.endDate}','%b %d %Y')
                                                 GROUP BY work_list.vehicleRegistrationId ORDER BY RIGHT(vehicleRegistrationNumber,4)`;

            }else if(req.query.startDate && req.query.endDate && req.query.dealerId && req.query.workStatus){

                sql_queries_getdetails = `SELECT UPPER(vehicleRegistrationNumber) As vehicleRegistrationNumber, GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType,
                                                 COALESCE(CONCAT(dealer_details.dealerFirmName,"(",dealer_details.dealerDisplayName,")"),privateCustomerName) AS "Dealer/Customer" ,clientWhatsAppNumber   
                                                 FROM vehicle_registration_details
                                                 LEFT JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                                 LEFT JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                                                 LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                                 WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicle_registration_details.dealerId = '${data.dealerId}' AND vehicleWorkStatus = '${data.workStatus}' AND vehicleRegistrationCreationDate BETWEEN STR_TO_DATE('${data.startDate}','%b %d %Y') AND STR_TO_DATE('${data.endDate}','%b %d %Y') 
                                                 GROUP BY work_list.vehicleRegistrationId ORDER BY RIGHT(vehicleRegistrationNumber,4)`;

            }else if(req.query.workCategory && req.query.startDate && req.query.endDate && req.query.dealerId){

                sql_queries_getdetails = `SELECT UPPER(vehicleRegistrationNumber) AS vehicleRegistrationNumber, GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType,
                                                 COALESCE(CONCAT(dealer_details.dealerFirmName,"(",dealer_details.dealerDisplayName,")"),privateCustomerName) AS "Dealer/Customer" ,clientWhatsAppNumber  
                                                 FROM vehicle_registration_details
                                                 INNER JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                                 INNER JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                                                 LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                                 WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicle_registration_details.dealerId = '${data.dealerId}' AND currentState = ${data.workCategory} AND vehicleRegistrationCreationDate BETWEEN STR_TO_DATE('${data.startDate}','%b %d %Y') AND STR_TO_DATE('${data.endDate}','%b %d %Y')
                                                 GROUP BY work_list.vehicleRegistrationId ORDER BY RIGHT(vehicleRegistrationNumber,4)`;

            }else if(req.query.workCategory && req.query.startDate && req.query.endDate && req.query.workStatus){

                sql_queries_getdetails = `SELECT UPPER(vehicleRegistrationNumber) AS vehicleRegistrationNumber, GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType,
                                                 COALESCE(CONCAT(dealer_details.dealerFirmName,"(",dealer_details.dealerDisplayName,")"),privateCustomerName) AS "Dealer/Customer" ,clientWhatsAppNumber  
                                                 FROM vehicle_registration_details
                                                 INNER JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                                 INNER JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                                                 LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                                 WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicleWorkStatus = '${data.workStatus}' AND currentState = ${data.workCategory} AND vehicleRegistrationCreationDate BETWEEN STR_TO_DATE('${data.startDate}','%b %d %Y') AND STR_TO_DATE('${data.endDate}','%b %d %Y')
                                                 GROUP BY work_list.vehicleRegistrationId ORDER BY RIGHT(vehicleRegistrationNumber,4)`;

            }else if(req.query.workCategory && req.query.startDate && req.query.endDate){

                sql_queries_getdetails = `SELECT UPPER(vehicleRegistrationNumber) AS vehicleRegistrationNumber, GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType,
                                                 COALESCE(CONCAT(dealer_details.dealerFirmName,"(",dealer_details.dealerDisplayName,")"),privateCustomerName) AS "Dealer/Customer" ,clientWhatsAppNumber  
                                                 FROM vehicle_registration_details
                                                 INNER JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                                 INNER JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                                                 LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                                 WHERE vehicle_registration_details.agentId = '${agentId}' AND currentState = ${data.workCategory} AND vehicleRegistrationCreationDate BETWEEN STR_TO_DATE('${data.startDate}','%b %d %Y') AND STR_TO_DATE('${data.endDate}','%b %d %Y')
                                                 GROUP BY work_list.vehicleRegistrationId ORDER BY RIGHT(vehicleRegistrationNumber,4)`;

            }else if(req.query.dealerId && req.query.startDate && req.query.endDate){

                sql_queries_getdetails = `SELECT UPPER(vehicleRegistrationNumber) As vehicleRegistrationNumber, GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType,
                                                 COALESCE(CONCAT(dealer_details.dealerFirmName,"(",dealer_details.dealerDisplayName,")"),privateCustomerName) AS "Dealer/Customer" ,clientWhatsAppNumber  
                                                 FROM vehicle_registration_details
                                                 LEFT JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                                 LEFT JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                                                 LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                                 WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicle_registration_details.dealerId = '${data.dealerId}' AND vehicleRegistrationCreationDate BETWEEN STR_TO_DATE('${data.startDate}','%b %d %Y') AND STR_TO_DATE('${data.endDate}','%b %d %Y') 
                                                 GROUP BY work_list.vehicleRegistrationId ORDER BY RIGHT(vehicleRegistrationNumber,4)`;

            }else if(req.query.workStatus && req.query.startDate && req.query.endDate){

                sql_queries_getdetails = `SELECT UPPER(vehicleRegistrationNumber) As vehicleRegistrationNumber, GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType,
                                                 COALESCE(CONCAT(dealer_details.dealerFirmName,"(",dealer_details.dealerDisplayName,")"),privateCustomerName) AS "Dealer/Customer" ,clientWhatsAppNumber  
                                                 FROM vehicle_registration_details
                                                 LEFT JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                                 LEFT JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                                                 LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                                 WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicleWorkStatus = '${data.workStatus}' AND vehicleRegistrationCreationDate BETWEEN STR_TO_DATE('${data.startDate}','%b %d %Y') AND STR_TO_DATE('${data.endDate}','%b %d %Y') 
                                                 GROUP BY work_list.vehicleRegistrationId ORDER BY RIGHT(vehicleRegistrationNumber,4)`;

            }else if(req.query.startDate && req.query.endDate){

                sql_queries_getdetails = `SELECT UPPER(vehicleRegistrationNumber) As vehicleRegistrationNumber, GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType,
                                                 COALESCE(CONCAT(dealer_details.dealerFirmName,"(",dealer_details.dealerDisplayName,")"),privateCustomerName) AS "Dealer/Customer" ,clientWhatsAppNumber   
                                                 FROM vehicle_registration_details
                                                 LEFT JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                                 LEFT JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                                                 LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                                 WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicleRegistrationCreationDate BETWEEN STR_TO_DATE('${data.startDate}','%b %d %Y') AND STR_TO_DATE('${data.endDate}','%b %d %Y')  
                                                 GROUP BY work_list.vehicleRegistrationId ORDER BY RIGHT(vehicleRegistrationNumber,4)`;

            }else if(req.query.workCategory && req.query.dealerId){

                sql_queries_getdetails = `SELECT UPPER(vehicleRegistrationNumber) AS vehicleRegistrationNumber, GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType,
                                                 COALESCE(CONCAT(dealer_details.dealerFirmName,"(",dealer_details.dealerDisplayName,")"),privateCustomerName) AS "Dealer/Customer" ,clientWhatsAppNumber  
                                                 FROM vehicle_registration_details
                                                 INNER JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                                 INNER JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                                                 LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                                 WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicle_registration_details.dealerId = '${data.dealerId}' AND currentState = ${data.workCategory}
                                                 GROUP BY work_list.vehicleRegistrationId ORDER BY RIGHT(vehicleRegistrationNumber,4)`;

            }else if(req.query.workCategory && req.query.workStatus){

                sql_queries_getdetails = `SELECT UPPER(vehicleRegistrationNumber) AS vehicleRegistrationNumber, GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType,
                                                 COALESCE(CONCAT(dealer_details.dealerFirmName,"(",dealer_details.dealerDisplayName,")"),privateCustomerName) AS "Dealer/Customer" ,clientWhatsAppNumber  
                                                 FROM vehicle_registration_details
                                                 INNER JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                                 INNER JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                                                 LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                                 WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicleWorkStatus = '${data.workStatus}' AND currentState = ${data.workCategory}
                                                 GROUP BY work_list.vehicleRegistrationId ORDER BY RIGHT(vehicleRegistrationNumber,4)`;

            }else if(req.query.dealerId && req.query.workStatus){

                sql_queries_getdetails = `SELECT UPPER(vehicleRegistrationNumber) As vehicleRegistrationNumber, GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType,
                                                 COALESCE(CONCAT(dealer_details.dealerFirmName,"(",dealer_details.dealerDisplayName,")"),privateCustomerName) AS "Dealer/Customer" ,clientWhatsAppNumber   
                                                 FROM vehicle_registration_details
                                                 LEFT JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                                 LEFT JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                                                 LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                                 WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicle_registration_details.dealerId = '${data.dealerId}' AND vehicleWorkStatus = '${data.workStatus}'
                                                 GROUP BY work_list.vehicleRegistrationId ORDER BY RIGHT(vehicleRegistrationNumber,4)`;

            }else if(req.query.appointmentDate && req.query.workStatus === 'APPOINTMENT'){

                sql_queries_getdetails = `SELECT vehicle_registration_details.vehicleRegistrationId, UPPER(vehicleRegistrationNumber) As vehicleRegistrationNumber, GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType,
                                                 COALESCE(CONCAT(dealer_details.dealerFirmName,"(",dealer_details.dealerDisplayName,")"),privateCustomerName) AS "Dealer/Customer" ,clientWhatsAppNumber ,vehicleWorkStatus ,DATE_FORMAT(rto_receipt_data.appointmentDate, "%M %d %Y") 
                                                 FROM vehicle_registration_details
                                                 Inner JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                                 LEFT JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                                                 LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                                 LEFT JOIN rto_receipt_data ON rto_receipt_data.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                                 WHERE vehicle_registration_details.agentId = '${agentId}' AND rto_receipt_data.appointmentDate = STR_TO_DATE('${data.appointmentDate}','%b %d %Y')
                                                 GROUP BY work_list.vehicleRegistrationId ORDER BY RIGHT(vehicleRegistrationNumber,4)`;

            }else if(req.query.workCategory){

                sql_queries_getdetails = `SELECT UPPER(vehicleRegistrationNumber) AS vehicleRegistrationNumber, GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType,
                                                 COALESCE(CONCAT(dealer_details.dealerFirmName,"(",dealer_details.dealerDisplayName,")"),privateCustomerName) AS "Dealer/Customer" ,clientWhatsAppNumber 
                                                 FROM vehicle_registration_details
                                                 INNER JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                                 INNER JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                                                 LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                                 WHERE vehicle_registration_details.agentId = '${agentId}' AND currentState = ${data.workCategory}
                                                 GROUP BY work_list.vehicleRegistrationId ORDER BY RIGHT(vehicleRegistrationNumber,4)`;

            }else if(req.query.searchOption === 'lastUpdated' && req.query.dealerId){

                sql_queries_getdetails = `SELECT UPPER(vehicleRegistrationNumber) As vehicleRegistrationNumber, GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType,
                                                 COALESCE(CONCAT(dealer_details.dealerFirmName,"(",dealer_details.dealerDisplayName,")"),privateCustomerName) AS "Dealer/Customer" ,clientWhatsAppNumber   
                                                 FROM vehicle_registration_details
                                                 LEFT JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                                 LEFT JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                                                 LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                                 WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicle_registration_details.dealerId = '${data.dealerId}' AND vehicleRegistrationCreationDate = (SELECT MAX(vehicleRegistrationCreationDate) FROM vehicle_registration_details WHERE vehicle_registration_details.dealerId = '${data.dealerId}')
                                                 GROUP BY work_list.vehicleRegistrationId ORDER BY RIGHT(vehicleRegistrationNumber,4)`;

            }else if(req.query.dealerId){

                sql_queries_getdetails = `SELECT UPPER(vehicleRegistrationNumber) As vehicleRegistrationNumber, GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType,
                                                 COALESCE(CONCAT(dealer_details.dealerFirmName,"(",dealer_details.dealerDisplayName,")"),privateCustomerName) AS "Dealer/Customer" ,clientWhatsAppNumber   
                                                 FROM vehicle_registration_details
                                                 LEFT JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                                 LEFT JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                                                 LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                                 WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicle_registration_details.dealerId = '${data.dealerId}'
                                                 GROUP BY work_list.vehicleRegistrationId ORDER BY RIGHT(vehicleRegistrationNumber,4)`;

            }else if(req.query.workStatus){

                sql_queries_getdetails = `SELECT UPPER(vehicleRegistrationNumber) As vehicleRegistrationNumber, GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType,
                                                 COALESCE(CONCAT(dealer_details.dealerFirmName,"(",dealer_details.dealerDisplayName,")"),privateCustomerName) AS "Dealer/Customer" ,clientWhatsAppNumber   
                                                 FROM vehicle_registration_details
                                                 LEFT JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                                 LEFT JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                                                 LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                                 WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicleWorkStatus = '${data.workStatus}' 
                                                 GROUP BY work_list.vehicleRegistrationId ORDER BY RIGHT(vehicleRegistrationNumber,4)`;

            }else if(req.query.searchOption === 'lastUpdated'){
                sql_queries_getdetails = `SELECT UPPER(vehicleRegistrationNumber) As vehicleRegistrationNumber, GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType,
                                                 COALESCE(CONCAT(dealer_details.dealerFirmName,"(",dealer_details.dealerDisplayName,")"),privateCustomerName) AS "Dealer/Customer" ,clientWhatsAppNumber   
                                                 FROM vehicle_registration_details
                                                 LEFT JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                                 LEFT JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                                                 LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                                 WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicleRegistrationCreationDate = (SELECT MAX(vehicleRegistrationCreationDate) FROM vehicle_registration_details WHERE agentId = '${agentId}')
                                                 GROUP BY work_list.vehicleRegistrationId ORDER BY RIGHT(vehicleRegistrationNumber,4)`;

            }else{

                sql_queries_getdetails = `SELECT UPPER(vehicleRegistrationNumber) As vehicleRegistrationNumber, GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ', ') as workType,
                                                 COALESCE(CONCAT(dealer_details.dealerFirmName,"(",dealer_details.dealerDisplayName,")"),privateCustomerName) AS "Dealer/Customer" ,clientWhatsAppNumber   
                                                 FROM vehicle_registration_details
                                                 LEFT JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                                 LEFT JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                                                 LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                                 WHERE vehicle_registration_details.agentId = '${agentId}'
                                                 GROUP BY work_list.vehicleRegistrationId ORDER BY RIGHT(vehicleRegistrationNumber,4)`;

            }
            console.log('find me',sql_queries_getdetails)
                pool.query(sql_queries_getdetails, async(err,rows) =>{
                    if(err) return res.status(404).send(err);
                    console.log(":::",rows)
                    const workbook = new excelJS.Workbook();  // Create a new workbook
                    const worksheet = workbook.addWorksheet("Vehicle List"); // New Worksheet
        
                    worksheet.mergeCells('A1','F1');
                    worksheet.getCell('A1').value = `Vehicle List`;
        
            /*Column headers*/
            worksheet.getRow(2).values = ['S no.', 'Vehicle Number', 'Work', 'Dealer / Customer','WhatsApp Number','Check'];
        
            // Column for data in excel. key must match data key
            worksheet.columns = [
              { key: "s_no", width: 10 }, 
              { key: "vehicleRegistrationNumber", width: 20 },
              { key: "workType", width: 30 },
              { key: "Dealer/Customer", width: 30 },
              { key: "clientWhatsAppNumber", width: 30 },
          ];
            //Looping through User data
                const arr = rows
                console.log(">>>",arr);
                let counter = 1;
                arr.forEach((user) => {
                  user.s_no = counter;
                  worksheet.addRow(user); // Add data in worksheet
                  counter++;
                });
                // Making first line in excel bold
                worksheet.getRow(1).eachCell((cell) => {
                    cell.font = { bold: true, size: 13 }
                    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                    height = 200
                  });
                worksheet.getRow(2).eachCell((cell) => {
                  cell.font = { bold: true, size: 13 }
                  cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                });
                worksheet.getRow(1).height = 30;
                worksheet.getRow(2).height = 20;
                try {
                    const data = await workbook.xlsx.writeBuffer()
                    var fileName = new Date().toString().slice(4,15)+".xlsx";
                    console.log(">>>",fileName);
                    // res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                     // res.addHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename="+ fileName)
                    res.contentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                    res.type = 'blob';
                    res.send(data)
                    // res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
	                // res.setHeader("Content-Disposition", "attachment; filename=" + "Report.xlsx");
	                // workbook.xlsx.write(res)
		            // .then((data)=>{
			        //     res.end();
			        //         console.log('File write done........');
		            //     });
               }catch(err) {
                    throw new Error(err);
               }
            })
        }else{
            res.status(401);
            res.send("Please Login Firest.....!");
        }
  };

const addVehicleRegistrationDetails = async(req,res,next) =>{
    try{
        const uid1 = new Date();
        const uid2 = (new Date().getTime()).toString(36);
        const id = String("vehicleRegistration_" + uid1.getTime() + "_" + uid2);
        

        const isRRF = ()=>{
            if(req.body.RRF == true){
                return true;
            }else{
                return false;
            }
        }

        const isTTO = ()=>{
            if(req.body.TO == true){
                return true;
            }else{
                return false;
            }
        }

        const isOther = ()=>{
            if(req.body.HPT == true || 
               req.body.DRC == true || 
               req.body.addressChange == true || 
               req.body.HPA == true || 
               req.body.HPC == true || 
               req.body.NOC == true ||
               req.body.AV == true){
                return true;
               }else{
                return false;
               }
        }

        const getCurrentState = ()=>{
            if(isRRF()){
                return 1;
            }else if(isTTO()){
                return 2;
            }else if(isOther()){
                return 3;
            }else if(isTTO() && isOther){
                return 2;
            }else{
                return 3;
            }
        }

        const getNextState = ()=>{
            if(getCurrentState() == 1 && isTTO()){
                return 2;
            }else if(getCurrentState() == 1 && isOther()){
                return 3;
            }else{
                return 4;
            }
        }

        const insertWorkList = ()=>{
            var row = []
    
            if(req.body.TO){
                row.push("('"+id+"',1)");
            }if(req.body.HPT){
                row.push("('"+id+"',2)");
            }if(req.body.DRC){
                row.push("('"+id+"',3)");
            }if(req.body.addressChange){
                row.push("('"+id+"',4)");
            }if(req.body.HPA){
                row.push("('"+id+"',5)")
            }if(req.body.HPC){
                row.push("('"+id+"',6)");
            }if(req.body.RRF){
                row.push("('"+id+"',7)");
            }if(req.body.NOC){
                row.push("('"+id+"',8)");
            }if(req.body.AV){
                row.push("('"+id+"',9)");
            }
            // console.log(row)
            var string = ''
            row.forEach((data,index) => {
                if(index == 0)
                    string=string+data;
                else
                    string=string+','+data;
            });
            return string;
        }
        let token;
        token = req.headers.authorization.split(" ")[1];
        if(token){
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const agentId = decoded.id.id;    
            const data = {
                vehicleRegistrationNumber            :   req.body.vehicleRegistrationNumber,        
                vehicleChassisNumber                 :   req.body.vehicleChassisNumber,        
                vehicleEngineNumber                  :   req.body.vehicleEngineNumber,         
                vehicleClass                         :   req.body.vehicleClass ? req.body.vehicleClass : null,               
                vehicleCategory                      :   req.body.vehicleCategory ? req.body.vehicleCategory : null,             
                vehicleMake                          :   req.body.vehicleMake,                 
                vehicleModel                         :   req.body.vehicleModel,                
                vehicleRegistrationDate              :   new Date(req.body.vehicleRegistrationDate?req.body.vehicleRegistrationDate:"01/01/2001").toString().slice(4,15),
                currentState                         :   getCurrentState(),
                nextState                            :   getNextState(),
                rrf                                  :   isRRF() ? 1 : 0,
                tto                                  :   isTTO() ? 1 : 0,
                Other                                :   isOther() ? 1 : 0,             
                sellerFirstName                      :   req.body.sellerFirstName,             
                sellerMiddleName                     :   req.body.sellerMiddleName,            
                sellerLastName                       :   req.body.sellerLastName,              
                sellerAddress                        :   req.body.sellerAddress,               
                buyerFirstName                       :   req.body.buyerFirstName ? req.body.buyerFirstName : null,                 
                buyerMiddleName                      :   req.body.buyerMiddleName ? req.body.buyerMiddleName : null,           
                buyerLastName                        :   req.body.buyerLastName ? req.body.buyerLastName : null,               
                buyerAddressLine1                    :   req.body.buyerAddressLine1 ? req.body.buyerAddressLine1 : null,           
                buyerAddressLine2                    :   req.body.buyerAddressLine2 ? req.body.buyerAddressLine2 : null,          
                buyerAddressLine3                    :   req.body.buyerAddressLine3 ? req.body.buyerAddressLine3 : null,                   
                buyerState                           :   req.body.buyerState ? req.body.buyerState : null,                  
                buyerCity                            :   req.body.buyerCity ? req.body.buyerCity : null,                   
                buyerPincode                         :   req.body.buyerPincode ? req.body.buyerPincode : null,                
                clientWhatsAppNumber                 :   req.body.clientWhatsAppNumber,        
                serviceAuthority                     :   req.body.serviceAuthority,            
                dealerId                             :   req.body.dealerId ? req.body.dealerId : 100,
                privateCustomerName                  :   req.body.privateCustomerName ? req.body.privateCustomerName : null,
                puccNumber                           :   req.body.puccNumber ? req.body.puccNumber : null,
                puccStartDate                        :   new Date(req.body.puccStartDate ? req.body.puccStartDate : "10/10/1001").toString().slice(4,15),          
                puccEndDate                          :   new Date(req.body.puccEndDate ? req.body.puccEndDate : "10/10/1001").toString().slice(4,15),                               
                insuranceType                        :   req.body.insuranceType ? req.body.insuranceType : null,       
                insuranceCompanyNameId               :   req.body.insuranceCompanyNameId ? req.body.insuranceCompanyNameId : null,
                policyNumber                         :   req.body.policyNumber ? req.body.policyNumber : null,                
                insuranceStartDate                   :   new Date(req.body.insuranceStartDate?req.body.insuranceStartDate:"10/10/1001").toString().slice(4,15),          
                insuranceEndDate                     :   new Date(req.body.insuranceEndDate?req.body.insuranceEndDate:"10/10/1001").toString().slice(4,15),            
                vehicleWorkStatus                    :   "PENDING",           
                comment                              :   req.body.comment ? req.body.comment : null,
                creationDate                         :   new Date().toString().slice(4,15),              
            }   
            if(!data.vehicleRegistrationNumber || !data.vehicleChassisNumber || !data.vehicleEngineNumber || !data.vehicleMake || !data.vehicleModel || !data.vehicleRegistrationDate ||  
               !data.sellerFirstName || !data.sellerMiddleName || !data.sellerLastName || 
               !data.sellerAddress || !data.clientWhatsAppNumber || !data.serviceAuthority){
                res.status(401);
                res.send("Please Fill all the feilds")
            }else{
            sql_queries_adddetails = `INSERT INTO vehicle_registration_details (vehicleRegistrationId, agentId, vehicleRegistrationNumber, vehicleChassisNumber, vehicleEngineNumber, 
                                                                                vehicleClass, vehicleCategory, vehicleMake, vehicleModel, 
                                                                                vehicleRegistrationDate, currentState, nextState, RRF ,TTO, Other,
                                                                                sellerFirstName, sellerMiddleName, sellerLastName, sellerAddress, 
                                                                                buyerFirstName, buyerMiddleName, buyerLastName,
                                                                                buyerAddressLine1, buyerAddressLine2, buyerAddressLine3, 
                                                                                buyerState, buyerCity, buyerPincode, clientWhatsAppNumber, 
                                                                                serviceAuthority, dealerId, privateCustomerName,
                                                                                puccNumber, puccStartDate, puccEndDate, 
                                                                                insuranceType, insuranceCompanyNameId, policyNumber, insuranceStartDate, insuranceEndDate, 
                                                                                vehicleWorkStatus, comment, vehicleRegistrationCreationDate)
                                      VALUES ('${id}','${agentId}','${data.vehicleRegistrationNumber}','${data.vehicleChassisNumber}','${data.vehicleEngineNumber}',
                                               ${data.vehicleClass},${data.vehicleCategory},'${data.vehicleMake}','${data.vehicleModel}',
                                               STR_TO_DATE('${data.vehicleRegistrationDate}','%b %d %Y'),'${data.currentState}','${data.nextState}','${data.rrf}','${data.tto}','${data.Other}',
                                              '${data.sellerFirstName}','${data.sellerMiddleName}','${data.sellerLastName}','${data.sellerAddress}',
                                              NULLIF('${data.buyerFirstName}','null'),NULLIF('${data.buyerMiddleName}','null'),NULLIF('${data.buyerLastName}','null'),
                                              NULLIF('${data.buyerAddressLine1}','null'),NULLIF('${data.buyerAddressLine2}','null'),NULLIF('${data.buyerAddressLine3}','null'),
                                               ${data.buyerState},${data.buyerCity},${data.buyerPincode},'${data.clientWhatsAppNumber}',
                                              '${data.serviceAuthority}',NULLIF('${data.dealerId}','100'),NULLIF('${data.privateCustomerName}','null'),
                                              NULLIF('${data.puccNumber}','null'), STR_TO_DATE(NULLIF('${data.puccStartDate}','Oct 10 1001'),'%b %d %Y'), STR_TO_DATE(NULLIF('${data.puccEndDate}','Oct 10 1001'),'%b %d %Y'),
                                              NULLIF('${data.insuranceType}','null'),${data.insuranceCompanyNameId},NULLIF('${data.policyNumber}','null'), STR_TO_DATE(NULLIF('${data.insuranceStartDate}','Oct 10 1001'),'%b %d %Y'), STR_TO_DATE(NULLIF('${data.insuranceEndDate}','Oct 10 1001'),'%b %d %Y'),
                                              '${data.vehicleWorkStatus}',NULLIF('${data.comment}','null'), STR_TO_DATE('${data.creationDate}','%b %d %Y'))`;
                                              console.log("addddd Query",sql_queries_adddetails);
            pool.query(sql_queries_adddetails,(err,data) =>{
                if(err) return res.status(404).send(err);
                // return res.json(data);
                else if(data){
                    res.locals.id = id
                     sql_queries_addworkdetails = `INSERT INTO work_list (vehicleRegistrationId, workId) VALUES ${insertWorkList()}`;
                     pool.query(sql_queries_addworkdetails,(err,data)=>{
                        if(err) return res.status(404).send(err);
                        // return res.json(data);
                        if(req.body.TO == true){
                            next();
                        }else{
                            return res.json({status:200, message:"Data Inserted Successfully"});
                        }
                     })
                }    
                // return res.json(data);
            })}
        }else{
            res.send("Please Login Firest....!");
        }
    }catch(error){
        throw new Error(error);
        // res.send("Please Login Firest....>>>.!");
    }                         
}

const deleteGoogleFileforTTO = asyncHandler(async (fileId) =>{
    console.log(">>>>>>>>>>::::::::::<<<<<<<<<<<<<",fileId);
    const auth = authenticateGoogle();

    const driveService = google.drive({ version: "v3", auth });
    const response = await driveService.files.delete({ 
        fileId : fileId,
      });
      return response
})


const removeVehicleRegistrationDetails = async(req,res)=>{

    try{
        const vehicleRegistrationId = req.query.vehicleRegistrationId
        const get_googleDriveId = `SELECT pdfGoogleDriveId as DriveId FROM tto_form_data WHERE vehicleRegistrationId = '${vehicleRegistrationId}';
                                   SELECT receiptGoogleDriveId as DriveId FROM rto_receipt_data WHERE vehicleRegistrationId = '${vehicleRegistrationId}'`;
        pool.query(get_googleDriveId,(err,data) =>{
        if(err) return res.send(err);
        const ttoGoogledriveId1 = data[0];
        const receiptGoogledriveId2 = data[1];
        const allId = ttoGoogledriveId1.concat(receiptGoogledriveId2);
        if(allId){
            allId.map(a => {
                if(a ? true : false){
                    deleteGoogleFileforTTO(a.DriveId)
                }}
                );
        }
            req.query.agentEmailId = pool.query(`SELECT vehicleRegistrationId FROM vehicle_registration_details WHERE vehicleRegistrationId= '${vehicleRegistrationId}'`, (err, row)=>{
                if (row && row.length) {
                    sql_queries_removedetails = `DELETE FROM vehicle_registration_details WHERE vehicleRegistrationId = '${vehicleRegistrationId}'`;
                    pool.query(sql_queries_removedetails,(err,data)=>{
                if(data){
                if(err) return res.status(404).send(err);
                return res.json({status:200, message:"Vehicle Deleted Successfully"});
                }
            })   
              }else {
                    return res.send('Vehicle is Already Deleted');
              }
            })
    })
    }catch(error){
        throw new Error(error);
    }                      
}

const fillUpdateDetailForVehicle = async(req,res)=>{
    const vehicleRegistrationId = req.query.vehicleRegistrationId;
    get_editdetails = `SELECT vehicleRegistrationNumber, vehicleChassisNumber,vehicleEngineNumber,vehicleClass,vehicleCategory,vehicleMake,vehicleModel,vehicleRegistrationDate,sellerFirstName,sellerMiddleName,sellerLastName,sellerAddress,buyerFirstName,buyerMiddleName,buyerLastName,buyerAddressLine1,buyerAddressLine2,buyerAddressLine3,buyerState,buyerCity,buyerPincode,clientWhatsAppNumber,serviceAuthority,COALESCE(dealerId, 100) AS dealerId,privateCustomerName,puccNumber,puccStartDate,puccEndDate,insuranceType,insuranceCompanyNameId,policyNumber,insuranceStartDate,insuranceEndDate, comment FROM vehicle_registration_details
                       WHERE vehicleRegistrationId = '${vehicleRegistrationId}';
                       SELECT workId FROM work_list WHERE vehicleRegistrationId = '${vehicleRegistrationId}'`;
    pool.query(get_editdetails,(err,data)=>{
        const find = data[1];
        let result = find.map(a => a.workId);
        console.log("result",result);
        const vehicleDetais = data[0][0];

        const work = {
            "TO"            : result.includes(1),
            "HPT"           : result.includes(2),
            "DRC"           : result.includes(3),
            "addressChange" : result.includes(4),
            "HPA"           : result.includes(5),
            "HPC"           : result.includes(6),
            "RRF"           : result.includes(7),
            "NOC"           : result.includes(8),
            "AV"            : result.includes(9)
        }
        const allData = {
            ...vehicleDetais,
            ...work
        }
        if(err) return res.send(err);
        return res.json(allData);
    })
}

const updateVehicleRegistrationDetails = async(req,res,next) =>{

    try{
        const vehicleRegistrationId = req.body.vehicleRegistrationId;

        const isRRF = ()=>{
            if(req.body.RRF == true){
                return true;
            }else{
                return false;
            }
        }

        const isTTO = ()=>{
            if(req.body.TO == true){
                return true;
            }else{
                return false;
            }
        }

        const isOther = ()=>{
            if(req.body.HPT == true || 
               req.body.DRC == true || 
               req.body.addressChange == true || 
               req.body.HPA == true || 
               req.body.HPC == true || 
               req.body.NOC == true ||
               req.body.AV == true){
                return true;
               }else{
                return false;
               }
        }

        const getCurrentState = ()=>{
            if(isRRF()){
                return 1;
            }else if(isTTO()){
                return 2;
            }else if(isOther()){
                return 3;
            }else if(isTTO() && isOther){
                return 2;
            }else{
                return 3;
            }
        }

        const getNextState = ()=>{
            if(getCurrentState() == 1 && isTTO()){
                return 2;
            }else if(getCurrentState() == 1 && isOther()){
                return 3;
            }else{
                return 4;
            }
        }

        const insertWorkList = ()=>{
            var row = []
    
            if(req.body.TO){
                row.push("('"+vehicleRegistrationId+"',1)");
            }if(req.body.HPT){
                row.push("('"+vehicleRegistrationId+"',2)");
            }if(req.body.DRC){
                row.push("('"+vehicleRegistrationId+"',3)");
            }if(req.body.addressChange){
                row.push("('"+vehicleRegistrationId+"',4)");
            }if(req.body.HPA){
                row.push("('"+vehicleRegistrationId+"',5)")
            }if(req.body.HPC){
                row.push("('"+vehicleRegistrationId+"',6)");
            }if(req.body.RRF){
                row.push("('"+vehicleRegistrationId+"',7)");
            }if(req.body.NOC){
                row.push("('"+vehicleRegistrationId+"',8)");
            }if(req.body.AV){
                row.push("('"+vehicleRegistrationId+"',9)");
            }
            // console.log(row)
            var string = ''
            row.forEach((data,index) => {
                if(index == 0)
                    string=string+data;
                else
                    string=string+','+data;
            });
            return string;
        }

        const data = {
                vehicleRegistrationNumber   :   req.body.vehicleRegistrationNumber,        
                vehicleChassisNumber        :   req.body.vehicleChassisNumber,        
                vehicleEngineNumber         :   req.body.vehicleEngineNumber,         
                vehicleClass                :   req.body.vehicleClass ? req.body.vehicleClass : null,               
                vehicleCategory             :   req.body.vehicleCategory ? req.body.vehicleCategory : null,                         
                vehicleMake                 :   req.body.vehicleMake,                 
                vehicleModel                :   req.body.vehicleModel,                
                vehicleRegistrationDate     :   new Date(req.body.vehicleRegistrationDate?req.body.vehicleRegistrationDate:"10/10/1001").toString().slice(4,15),
                currentState                :   getCurrentState(),
                nextState                   :   getNextState(),
                rrf                         :   isRRF() ? 1 : 0,
                tto                         :   isTTO() ? 1 : 0,
                Other                       :   isOther() ? 1 : 0,    
                sellerFirstName             :   req.body.sellerFirstName,             
                sellerMiddleName            :   req.body.sellerMiddleName,            
                sellerLastName              :   req.body.sellerLastName,              
                sellerAddress               :   req.body.sellerAddress,               
                buyerFirstName              :   req.body.buyerFirstName ? req.body.buyerFirstName : null,                 
                buyerMiddleName             :   req.body.buyerMiddleName ? req.body.buyerMiddleName : null,           
                buyerLastName               :   req.body.buyerLastName ? req.body.buyerLastName : null,               
                buyerAddressLine1           :   req.body.buyerAddressLine1 ? req.body.buyerAddressLine1 : null,           
                buyerAddressLine2           :   req.body.buyerAddressLine2 ? req.body.buyerAddressLine2 : null,          
                buyerAddressLine3           :   req.body.buyerAddressLine3 ? req.body.buyerAddressLine3 : null,                   
                buyerState                  :   req.body.buyerState ? req.body.buyerState : null,                  
                buyerCity                   :   req.body.buyerCity ? req.body.buyerCity : null,                   
                buyerPincode                :   req.body.buyerPincode ? req.body.buyerPincode : null,                               
                clientWhatsAppNumber        :   req.body.clientWhatsAppNumber,        
                serviceAuthority            :   req.body.serviceAuthority,            
                dealerId                    :   req.body.dealerId ? req.body.dealerId : 100,
                privateCustomerName         :   req.body.privateCustomerName ? req.body.privateCustomerName : null,
                puccNumber                  :   req.body.puccNumber ? req.body.puccNumber : null,
                puccStartDate               :   new Date(req.body.puccStartDate ? req.body.puccStartDate : "10/10/1001").toString().slice(4,15),          
                puccEndDate                 :   new Date(req.body.puccEndDate ? req.body.puccEndDate : "10/10/1001").toString().slice(4,15),                                                   
                insuranceType               :   req.body.insuranceType ? req.body.insuranceType : null,       
                insuranceCompanyNameId      :   req.body.insuranceCompanyNameId ? req.body.insuranceCompanyNameId : null,
                policyNumber                :   req.body.policyNumber ? req.body.policyNumber : null,                    
                insuranceStartDate          :   new Date(req.body.insuranceStartDate?req.body.insuranceStartDate:"10/10/1001").toString().slice(4,15),          
                insuranceEndDate            :   new Date(req.body.insuranceEndDate?req.body.insuranceEndDate:"10/10/1001").toString().slice(4,15),            
                comment                     :   req.body.comment                  
        }   
        const sql_querry_updatedetails = `UPDATE vehicle_registration_details SET  vehicleRegistrationNumber = '${data.vehicleRegistrationNumber}',
                                                                                   vehicleChassisNumber = '${data.vehicleChassisNumber}',   
                                                                                   vehicleEngineNumber = '${data.vehicleEngineNumber}',      
                                                                                   vehicleClass = ${data.vehicleClass},            
                                                                                   vehicleCategory = ${data.vehicleCategory},          
                                                                                   vehicleMake = '${data.vehicleMake}',              
                                                                                   vehicleModel = '${data.vehicleModel}',             
                                                                                   vehicleRegistrationDate = STR_TO_DATE(NULLIF('${data.vehicleRegistrationDate}','Oct 10 1001'),'%b %d %Y'),
                                                                                   currentState = ${data.currentState},
                                                                                   nextState = ${data.nextState},
                                                                                   RRF = ${data.rrf},
                                                                                   TTO = ${data.tto}, 
                                                                                   Other = ${data.Other},         
                                                                                   sellerFirstName = '${data.sellerFirstName}',          
                                                                                   sellerMiddleName = '${data.sellerMiddleName}',         
                                                                                   sellerLastName = '${data.sellerLastName}',           
                                                                                   sellerAddress = '${data.sellerAddress}',            
                                                                                   buyerFirstName = NULLIF('${data.buyerFirstName}','null'),
                                                                                   buyerMiddleName = NULLIF('${data.buyerMiddleName}','null'),
                                                                                   buyerLastName = NULLIF('${data.buyerLastName}','null'),
                                                                                   buyerAddressLine1 = NULLIF('${data.buyerAddressLine1}','null'),
                                                                                   buyerAddressLine2 = NULLIF('${data.buyerAddressLine2}','null'),
                                                                                   buyerAddressLine3 = NULLIF('${data.buyerAddressLine3}','null'),          
                                                                                   buyerState = ${data.buyerState},               
                                                                                   buyerCity = ${data.buyerCity},                
                                                                                   buyerPincode = ${data.buyerPincode},             
                                                                                   clientWhatsAppNumber = '${data.clientWhatsAppNumber}',     
                                                                                   serviceAuthority = ${data.serviceAuthority},         
                                                                                   dealerId = NULLIF('${data.dealerId}','100'),
                                                                                   privateCustomerName = NULLIF('${data.privateCustomerName}','null'),
                                                                                   puccNumber = NULLIF('${data.puccNumber}','null'),
                                                                                   puccStartDate = STR_TO_DATE(NULLIF('${data.puccStartDate}','Oct 10 1001'),'%b %d %Y'),       
                                                                                   puccEndDate = STR_TO_DATE(NULLIF('${data.puccEndDate}','Oct 10 1001'),'%b %d %Y'),
                                                                                   insuranceType = NULLIF('${data.insuranceType}','null'),
                                                                                   insuranceCompanyNameId = ${data.insuranceCompanyNameId},
                                                                                   policyNumber = NULLIF('${data.policyNumber}','null'),             
                                                                                   insuranceStartDate = STR_TO_DATE(NULLIF('${data.insuranceStartDate}','Oct 10 1001'),'%b %d %Y'),       
                                                                                   insuranceEndDate = STR_TO_DATE(NULLIF('${data.insuranceEndDate}','Oct 10 1001'),'%b %d %Y'),
                                                                                   comment = '${data.comment}'
                                                                                   WHERE vehicleRegistrationId = '${vehicleRegistrationId}'`;
        pool.query(sql_querry_updatedetails,(err,data) =>{ 
            if(err) return res.status(404).send(err);
                if(req.body.TO || req.body.HPT || req.body.HPA ||
                   req.body.HPC || req.body.DRC || req.body.AV || 
                   req.body.NOC || req.body.RRF || req.body.addressChange){
                sql_delete_Worklist = `DELETE FROM work_list WHERE vehicleRegistrationId = '${vehicleRegistrationId}'`;
                pool.query(sql_delete_Worklist,(err,data)=>{
                    if(err) return res.status(404).send(err);
                sql_add_workList = `INSERT INTO work_list (vehicleRegistrationId, workId) VALUES ${insertWorkList()}`;
                pool.query(sql_add_workList,(err,data)=>{
                    if(err) return res.status(404).send(err);
                    sql_getTTOdriveId = `SELECT pdfGoogleDriveId as DriveId FROM tto_form_data WHERE vehicleRegistrationId = '${vehicleRegistrationId}'`;
                    pool.query(sql_getTTOdriveId,(err,data) =>{
                        if(err) return res.status(404).send(err);
                        // const ttoGoogledriveId1 = data[0];
                        // const gDriveId = ttoGoogledriveId1;
                        // console.log("ttttttttttt",gDriveId);
                        data.map(a => {
                            if(data && data[0] && data[0].DriveId ? true : false){
                                deleteGoogleFileforTTO(a.DriveId)
                            }}
                            );
                            req.query.agentEmailId = pool.query(`SELECT vehicleRegistrationId FROM vehicle_registration_details WHERE vehicleRegistrationId= '${vehicleRegistrationId}'`, (err, row)=>{
                                if (row && row.length) {
                                    sql_queries_removedetails = `DELETE FROM tto_form_data WHERE vehicleRegistrationId = '${vehicleRegistrationId}'`;
                                    pool.query(sql_queries_removedetails,(err,data)=>{
                                if(data){
                                if(err) return res.status(404).send(err);
                                res.locals.id = vehicleRegistrationId;
                                if(req.body.TO == true){
                                    next();
                                }else{
                                    return res.send("updated");
                                }
                                // return res.json({status:200, message:"Vehicle Deleted Successfully"});
                                }
                            })   
                              }else {
                                    return res.send('Vehicle is Already Deleted');
                              }
                            })
                    })
                })
                })
            }else{
                return res.send("updated done");
            }

            // return res.json(data)
        })
    }catch(error){
        throw new Error(error);
    }   
}

const moveToComplete = (req,res) =>{

    const vehicleRegistrationId = req.query.vehicleRegistrationId;

    sql_state_update = `UPDATE vehicle_registration_details SET nextState = 4, vehicleWorkStatus = 'COMPLETE' WHERE vehicleRegistrationId = '${vehicleRegistrationId}'`;
    pool.query(sql_state_update,(err,data)=>{
        if(err) return res.status(404).send(err);
        return res.status(200),
              res.json("Book Completed");
    })
} 

const WhatsAppHyy = (req,res)=>{
    res.send("hyyyy");
}

module.exports = { 
                    getListOfVehicleRegistrationDetails,
                    getVehicleRegistrationDetailsById,
                    getVehicleRegistrationDetailsBydealerId,
                    addVehicleRegistrationDetails,
                    removeVehicleRegistrationDetails,
                    fillUpdateDetailForVehicle,
                    updateVehicleRegistrationDetails,
                    exportExcelSheetForVehicleDetails,
                    moveToComplete,
                    WhatsAppHyy,
                    deleteGoogleFileforTTO,
                    dashBoardCountNumber
                 };