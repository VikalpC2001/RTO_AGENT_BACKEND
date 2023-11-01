const mysql = require('mysql');
const pool = require('../../database');
const jwt = require("jsonwebtoken");

const getBookList = async (req, res) => {

    try {
        let token;
        console.log("token", req.headers.authorization);
        token = req.headers.authorization.split(" ")[1];
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log(">>>", decoded);
            const agentId = decoded.id.id;
            const data = {
                workStatus: req.query.workStatus,
                workCategory: req.query.workCategory,
                searchWord: req.query.searchWord,
                lastUpdate: req.query.lastUpdate
            }

            if (req.query.workStatus && req.query.searchWord) {

                sql_Book_List = `SELECT vehicleRegistrationId, UPPER(vehicleRegistrationNumber) As vehicleRegistrationNumber, COALESCE(dealer_details.dealerDisplayName,privateCustomerName) AS "Dealer/Customer"
                             FROM vehicle_registration_details
                             LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                             WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicleWorkStatus = '${data.workStatus}' AND vehicleRegistrationNumber LIKE'%` + data.searchWord + `%'
                             ORDER BY RIGHT(vehicleRegistrationNumber,4)`;

            } else if (req.query.workCategory && req.query.searchWord) {

                sql_Book_List = `SELECT vehicleRegistrationId, UPPER(vehicleRegistrationNumber) As vehicleRegistrationNumber, COALESCE(dealer_details.dealerDisplayName,privateCustomerName) AS "Dealer/Customer"
                             FROM vehicle_registration_details
                             LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                             WHERE vehicle_registration_details.agentId = '${agentId}' AND currentState = ${data.workCategory} AND vehicleRegistrationNumber LIKE'%` + data.searchWord + `%'
                             ORDER BY RIGHT(vehicleRegistrationNumber,4)`;

            } else if (req.query.workStatus) {

                sql_Book_List = `SELECT vehicleRegistrationId, UPPER(vehicleRegistrationNumber) As vehicleRegistrationNumber, COALESCE(dealer_details.dealerDisplayName,privateCustomerName) AS "Dealer/Customer"
                             FROM vehicle_registration_details
                             LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                             WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicleWorkStatus = '${data.workStatus}'
                             ORDER BY RIGHT(vehicleRegistrationNumber,4)`;

            } else if (req.query.workCategory) {

                sql_Book_List = `SELECT vehicleRegistrationId, UPPER(vehicleRegistrationNumber) As vehicleRegistrationNumber, COALESCE(dealer_details.dealerDisplayName,privateCustomerName) AS "Dealer/Customer"
                             FROM vehicle_registration_details
                             LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                             WHERE vehicle_registration_details.agentId = '${agentId}' AND currentState = ${data.workCategory}
                             ORDER BY RIGHT(vehicleRegistrationNumber,4)`;

            } else if (req.query.searchWord) {

                sql_Book_List = `SELECT vehicleRegistrationId, UPPER(vehicleRegistrationNumber) As vehicleRegistrationNumber, COALESCE(dealer_details.dealerDisplayName,privateCustomerName) AS "Dealer/Customer"
                             FROM vehicle_registration_details
                             LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                             WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicleRegistrationNumber LIKE'%` + data.searchWord + `%'
                             ORDER BY RIGHT(vehicleRegistrationNumber,4)`;

            } else if (req.query.lastUpdate == '1') {
                sql_Book_List = `SELECT vehicleRegistrationId, UPPER(vehicleRegistrationNumber) As vehicleRegistrationNumber, COALESCE(dealer_details.dealerDisplayName,privateCustomerName) AS "Dealer/Customer"
                             FROM vehicle_registration_details
                             LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                             WHERE vehicle_registration_details.agentId = '${agentId}' AND vehicleRegistrationCreationDate = (SELECT MAX(vehicleRegistrationCreationDate) FROM vehicle_registration_details WHERE agentId = '${agentId}')
                             ORDER BY RIGHT(vehicleRegistrationNumber,4)`;

            } else {

                sql_Book_List = `SELECT vehicleRegistrationId, UPPER(vehicleRegistrationNumber) As vehicleRegistrationNumber, COALESCE(dealer_details.dealerDisplayName,privateCustomerName) AS "Dealer/Customer"
                             FROM vehicle_registration_details
                             LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                             WHERE vehicle_registration_details.agentId = '${agentId}'
                             ORDER BY RIGHT(vehicleRegistrationNumber,4)`;

            }

            pool.query(sql_Book_List, (err, rows) => {
                console.log(">>>", rows);
                if (err) return res.status(404).send(err);
                return res.json(rows);
            })
        } else {
            res.status(401);
            res.send("Please Login Firest.....!");
        }
    } catch (error) {
        res.send("Please Login Firest.....!");
        throw new Error(error);
    }

}

const getDealerList = async (req, res) => {

    try {
        let token;
        console.log("token", req.headers.authorization);
        token = req.headers.authorization.split(" ")[1];
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log(">>>", decoded);
            const agentId = decoded.id.id;
            const sql_sortquery_getdetails = `SELECT dealerId, dealerFirmName, dealerDisplayName FROM dealer_details WHERE agentId = '${agentId}'`;
            pool.query(sql_sortquery_getdetails, (err, rows) => {
                console.log(">>>", rows);
                if (err) return res.status(404).send(err);
                return res.json(rows);
            })
        } else {
            res.status(401);
            res.send("Please Login Firest.....!");
        }
    } catch (error) {
        throw new Error(error);
    }
}

const getBookbyDealerId = async (req, res) => {
    try {
        var date = new Date(), y = date.getFullYear(), m = (date.getMonth() - 1);
        var firstDay = new Date(y, m, 1).toString().slice(4, 15);
        var lastDay = new Date(y, m + 1, 0).toString().slice(4, 15);

        console.log("1111>>>>", firstDay);
        console.log("1111>>>>", lastDay);
        const data = {
            dealerId: req.query.dealerId,
            apiNumber: req.query.apiNumber
        }
        if (req.query.dealerId && req.query.apiNumber === '4') {

            sql_queries_getdetailsByid = `SELECT vehicleRegistrationId, UPPER(vehicleRegistrationNumber) As vehicleRegistrationNumber, COALESCE(dealer_details.dealerDisplayName,privateCustomerName) AS "Dealer/Customer" FROM vehicle_registration_details
                                          LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId 
                                          WHERE vehicle_registration_details.dealerId = '${data.dealerId}' AND vehicle_registration_details.vehicleRegistrationCreationDate BETWEEN STR_TO_DATE('${firstDay}','%b %d %Y') AND STR_TO_DATE('${lastDay}','%b %d %Y')
                                          ORDER BY RIGHT(vehicleRegistrationNumber,4)`; // LastMonthBooksOfDealer

        } else if (req.query.dealerId && req.query.apiNumber === '5') {

            sql_queries_getdetailsByid = `SELECT vehicleRegistrationId, UPPER(vehicleRegistrationNumber) As vehicleRegistrationNumber, COALESCE(dealer_details.dealerDisplayName,privateCustomerName) AS "Dealer/Customer" FROM vehicle_registration_details
                                          LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId 
                                          WHERE vehicle_registration_details.dealerId = '${data.dealerId}' AND vehicle_registration_details.vehicleRegistrationCreationDate = (SELECT MAX(vehicleRegistrationCreationDate) FROM vehicle_registration_details WHERE vehicle_registration_details.dealerId = '${data.dealerId}')
                                          ORDER BY RIGHT(vehicleRegistrationNumber,4)`; // LastUpdatedBooksOfDealer

        } else if (req.query.dealerId && req.query.apiNumber === '1') {

            sql_queries_getdetailsByid = `SELECT vehicleRegistrationId, UPPER(vehicleRegistrationNumber) As vehicleRegistrationNumber, COALESCE(dealer_details.dealerDisplayName,privateCustomerName) AS "Dealer/Customer" FROM vehicle_registration_details
                                          LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId 
                                          WHERE vehicle_registration_details.dealerId = '${data.dealerId}' AND vehicle_registration_details.vehicleWorkStatus = "PENDING"
                                          ORDER BY RIGHT(vehicleRegistrationNumber,4)`; // PendingBooksOfDealer

        } else if (req.query.dealerId && req.query.apiNumber === '2') {

            sql_queries_getdetailsByid = `SELECT vehicleRegistrationId, UPPER(vehicleRegistrationNumber) As vehicleRegistrationNumber, COALESCE(dealer_details.dealerDisplayName,privateCustomerName) AS "Dealer/Customer" FROM vehicle_registration_details
                                          LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId 
                                          WHERE vehicle_registration_details.dealerId = '${data.dealerId}' AND vehicle_registration_details.vehicleWorkStatus = "APPOINTMENT"
                                          ORDER BY RIGHT(vehicleRegistrationNumber,4)`; // AppointmentBooksOfDealer

        } else if (req.query.dealerId && req.query.apiNumber === '3') {

            sql_queries_getdetailsByid = `SELECT vehicleRegistrationId, UPPER(vehicleRegistrationNumber) As vehicleRegistrationNumber, COALESCE(dealer_details.dealerDisplayName,privateCustomerName) AS "Dealer/Customer" FROM vehicle_registration_details
                                          LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId 
                                          WHERE vehicle_registration_details.dealerId = '${data.dealerId}' AND vehicle_registration_details.vehicleWorkStatus = "COMPLETE"
                                          ORDER BY RIGHT(vehicleRegistrationNumber,4)`; // CompleteBooksOfDealer

        } else {

            sql_queries_getdetailsByid = `SELECT vehicleRegistrationId, UPPER(vehicleRegistrationNumber) As vehicleRegistrationNumber, COALESCE(dealer_details.dealerDisplayName,privateCustomerName) AS "Dealer/Customer" FROM vehicle_registration_details 
                                          LEFT JOIN dealer_details ON dealer_details.dealerId = vehicle_registration_details.dealerId
                                          WHERE vehicle_registration_details.dealerId = '${data.dealerId}'
                                          ORDER BY RIGHT(vehicleRegistrationNumber,4)` // TotalBooksOfDealer

        }

        pool.query(sql_queries_getdetailsByid, (err, data) => {
            if (err) return res.status(404).send(err);
            var count = Object.keys(data).length;
            console.log("Number Of Books", count);
            return res.send(data);
        })
    } catch (error) {
        throw new Error('UnsuccessFull', error);
    }
}

const getInsuranceExpiredBookList = async (req, res) => {

    try {
        let token;
        token = req.headers.authorization.split(" ")[1];
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const agentId = decoded.id.id;

            var date = new Date(), y = date.getFullYear(), m = (date.getMonth());
            var firstDay = new Date(y, m, 1).toString().slice(4, 15);
            var lastDay = new Date(y, m + 1, 0).toString().slice(4, 15);
            var today = new Date().toString().slice(4, 15);

            // insurance name for putak
            var x = 'icici';
            var y = x.split(' ').slice(0, 2).join(' ');

            // puc date range
            var d = new Date('05/05/2023');
            (d.setDate(d.getDate() - 1));
            console.log(">>>", d.toString().slice(4, 15));
            var a = new Date(d)
            a.setMonth(a.getMonth() + 6);
            console.log("???", a.toString().slice(4, 15));

            console.log("1111>>>>", y);
            console.log("1111>>>>", firstDay);
            console.log("1111>>>>", lastDay);
            console.log("1111>>>>", today);

            const data = {
                apiNumber: req.query.apiNumber
            }
            if (req.query.apiNumber === '1') {

                sql_insuranceExpired_getdetails = `SELECT vehicleRegistrationId ,vehicleRegistrationNumber, COALESCE(CONCAT(buyerFirstName,' ', buyerLastname), CONCAT(sellerFirstName,' ', sellerLastName)) AS Name, clientWhatsAppNumber, insuranceType, insurance_data.insuranceCompanyName, DATE_FORMAT(insuranceStartDate, '%d %M %Y') AS insuranceStartDate, DATE_FORMAT(insuranceEndDate, '%d %M %Y') AS insuranceEndDate FROM vehicle_registration_details
                                                    LEFT JOIN insurance_data ON insurance_data.insuranceId = vehicle_registration_details.insuranceCompanyNameId
                                                    WHERE agentId = '${agentId}' AND vehicle_registration_details.insuranceEndDate BETWEEN STR_TO_DATE('${firstDay}','%b %d %Y') AND STR_TO_DATE('${lastDay}','%b %d %Y')
                                                    ORDER BY vehicle_registration_details.insuranceEndDate ASC`;

            } else {

                sql_insuranceExpired_getdetails = `SELECT vehicleRegistrationId ,vehicleRegistrationNumber, COALESCE(CONCAT(buyerFirstName,' ', buyerLastname), CONCAT(sellerFirstName,' ', sellerLastName)) AS Name, clientWhatsAppNumber, insuranceType, insurance_data.insuranceCompanyName, DATE_FORMAT(insuranceStartDate, '%d %M %Y') AS insuranceStartDate, DATE_FORMAT(insuranceEndDate, '%d %M %Y') AS insuranceEndDate FROM vehicle_registration_details
                                                    LEFT JOIN insurance_data ON insurance_data.insuranceId = vehicle_registration_details.insuranceCompanyNameId
                                                    WHERE agentId = '${agentId}' AND vehicle_registration_details.insuranceEndDate = CURDATE()
                                                    ORDER BY vehicle_registration_details.insuranceEndDate ASC`;
            }

            pool.query(sql_insuranceExpired_getdetails, (err, rows) => {
                if (err) return res.status(404).send(err);
                return res.send(rows);
            })
        } else {
            res.status(401);
            res.send("Please Login Firest.....!");
        }
    } catch (error) {
        throw new Error(error);
    }
}



module.exports = { getBookList, getDealerList, getBookbyDealerId, getInsuranceExpiredBookList }
