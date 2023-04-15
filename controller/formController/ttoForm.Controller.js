const { PDFDocument } = require("pdf-lib");
const { writeFileSync, readFileSync } = require("fs");
var {google} = require('googleapis');
const { Readable } =  require('stream');
const pool = require("../../database");

const fillPDFdata = async(data)=>{
console.log(">>>>>",data[0].vehicleRegistrationNumber);
  const details = {
    vehicleRegistrationNumber    : data[0].vehicleRegistrationNumber ? data[0].vehicleRegistrationNumber : '',
    vehicleMake                  : data[0].vehicleMake               ? data[0].vehicleMake               : '',
    vehicleModel                 : data[0].vehicleModel              ? data[0].vehicleModel              : '',
    vehicleChassisNumber         : data[0].vehicleChassisNumber      ? data[0].vehicleChassisNumber      : '',
    vehicleEngineNumber          : data[0].vehicleEngineNumber       ? data[0].vehicleEngineNumber       : '',
    sellerName                   : data[0].sellerName                ? data[0].sellerName                : '',
    sellerAddress                : data[0].sellerAddress             ? data[0].sellerAddress             : '',
    buyerName                    : data[0].buyerName                 ? data[0].buyerName                 : '',
    buyerAddress                 : data[0].buyerAddress              ? data[0].buyerAddress              : '',
    buyerStateCityPincode        : data[0].buyerStateCityPincode     ? data[0].buyerStateCityPincode     : '',
    serviceAuthority             : data[0].serviceAuthority          ? data[0].serviceAuthority          : '',
    insuranceCompanyName         : data[0].insuranceCompanyName      ? data[0].insuranceCompanyName      : '',
    policyNumber                 : data[0].policyNumber              ? data[0].policyNumber              : '',
    insuranceStartDate           : data[0].insuranceStartDate        ? data[0].insuranceStartDate        : '',
    insuranceEndDate             : data[0].insuranceEndDate          ? data[0].insuranceEndDate          : ''
  }

  const authenticateGoogle = () => {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_SERVICE,
      scopes: "https://www.googleapis.com/auth/drive",
    });
    return auth;
  };

  const document = await PDFDocument.load(readFileSync(process.env.TTO_URL));

  // const firstPage = doc.addPage([612.00, 1008.00]);
  const firstPage = document.getPage(0);
  firstPage.moveTo(105, 530);
  firstPage.drawText(details.buyerName, {
    x: 90,
    y: 905,
    size: 10,
  })

  firstPage.drawText(details.buyerAddress,{
    x: 75,
    y: 888,
    size: 10,
  })

  firstPage.drawText(details.buyerStateCityPincode,{
    x: 75,
    y: 870,
    size: 10,
  })


  firstPage.drawText(details.vehicleRegistrationNumber,{
    x: 240,
    y: 853,
    size: 10,
  })

  firstPage.drawText(details.sellerName,{
    x: 200,
    y: 833,
    size: 10,
  })

  firstPage.drawText(details.insuranceCompanyName,{
    x: 160,
    y: 763,
    size: 7,
  })

  firstPage.drawText(details.policyNumber,{
    x: 176,
    y: 742,
    size: 9,
  })

  firstPage.drawText(details.insuranceStartDate,{
    x: 95,
    y: 718,
    size: 11,
  })

  firstPage.drawText(details.insuranceEndDate,{
    x: 204,
    y: 718,
    size: 11,
  })

  firstPage.drawText(details.serviceAuthority,{
    x: 160,
    y: 633,
    size: 10,
  })

  firstPage.drawText(details.sellerName,{
    x: 145,
    y: 615,
    size: 10,
  })

  firstPage.drawText(details.sellerAddress,{
    x: 450,
    y: 615,
    size: 10,
  })

  firstPage.drawText(details.vehicleRegistrationNumber,{
    x: 320,
    y: 593,
    size: 11,
  })

  firstPage.drawText(details.buyerName,{
    x: 94,
    y: 573,
    size: 10,
  })

  firstPage.drawText(details.buyerAddress,{
    x: 80,
    y: 555,
    size: 10,
  })

  firstPage.drawText(details.buyerStateCityPincode,{
    x: 80,
    y: 539,
    size: 10,
  })


  firstPage.drawText(details.vehicleChassisNumber,{
    x: 120,
    y: 487,
    size: 11,
  })

  firstPage.drawText(details.vehicleEngineNumber,{
    x: 240,
    y: 487,
    size: 11,
  })

  firstPage.drawText(details.vehicleModel,{
    x: 350,
    y: 487,
    size: 11,
  })

  firstPage.drawText(details.vehicleMake,{
    x: 457,
    y: 487,
    size: 11,
  })

  firstPage.drawText(details.serviceAuthority,{
    x: 160,
    y: 400,
    size: 10,
  })

  firstPage.drawText(details.sellerName,{
    x: 145,
    y: 382,
    size: 10,
  })

  firstPage.drawText(details.sellerAddress,{
    x: 450,
    y: 382,
    size: 10,
  })

  firstPage.drawText(details.vehicleRegistrationNumber,{
    x: 320,
    y: 360,
    size: 11,
  })

  firstPage.drawText(details.buyerName, {
    x: 94,
    y: 340,
    size: 10,
  })

  firstPage.drawText(details.buyerAddress,{
    x: 80,
    y: 321.5,
    size: 10,
  })

  firstPage.drawText(details.buyerStateCityPincode,{
    x: 80,
    y: 305,
    size: 10,
  })
      
  const auth = authenticateGoogle();    
  const fileMetadata = {
        name: details.vehicleRegistrationNumber + '_TTO',
        parents: ["1J4fw78joMdTX2sOFB6SDBnQDh1Jm0dE3"], // Change it according to your desired parent folder id
  };
  
      
  const media = {
        mimeType: "application/pdf",
        body: Readable.from(Buffer.from(await document.save())),
 };

  const driveService = google.drive({ version: "v3", auth });

  const response = await driveService.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id",
  });

  if(response){
    console.log(">>>>><<<<",response.data.id);
      return response.data.id;
  }else{
      return ("not Able To Upload");
  }}

const genrateTTOform = async(req,res) => {

            const vehicleRegistrationId = res.locals.id;
            console.log("><><>>>>>>>",vehicleRegistrationId);
            const sql_querry_getdetailsById = `SELECT UPPER(vehicleRegistrationNumber) AS vehicleRegistrationNumber,
                                               RIGHT(vehicleChassisNumber,5) AS vehicleChassisNumber,
                                               RIGHT(vehicleEngineNumber,5) AS vehicleEngineNumber, UPPER(vehicleMake) AS vehicleMake, UPPER(vehicleModel) AS vehicleModel,
                                               UPPER(CONCAT(sellerFirstName," ",sellerMiddleName," ",sellerLastName)) AS sellerName, sellerAddress,
                                               UPPER(CONCAT(buyerFirstName," ",buyerMiddleName," ",buyerLastName)) AS buyerName,
                                               UPPER(CONCAT(buyerAddressLine1,", ",buyerAddressLine2,", ",buyerAddressLine3)) AS buyerAddress,
                                               CONCAT(state_data.stateName,", ",city_data.cityName," - ",buyerPincode) AS buyerStateCityPincode,
                                               (rto_city_data.cityRTOName) AS serviceAuthority, (insurance_data.insuranceCompanyName) AS insuranceCompanyName, policyNumber, 
                                               DATE_FORMAT(insuranceStartDate, '%d-%m-%Y') AS insuranceStartDate, DATE_FORMAT(insuranceEndDate, '%d-%m-%Y') AS insuranceEndDate
                                               FROM vehicle_registration_details
                                               LEFT JOIN state_data ON state_data.stateId = vehicle_registration_details.buyerState
                                               LEFT JOIN city_data 
                                               ON city_data.cityId = vehicle_registration_details.buyerCity = vehicle_registration_details.serviceAuthority
                                               LEFT JOIN rto_city_data ON rto_city_data.RTOcityId = vehicle_registration_details.serviceAuthority
                                               LEFT JOIN insurance_data ON insurance_data.insuranceId = vehicle_registration_details.insuranceCompanyNameId
                                               WHERE vehicleRegistrationId = '${vehicleRegistrationId}'`;
            pool.query(sql_querry_getdetailsById,(err,data)=>{
              if(err) return res.json(err);
              var temp;
              fillPDFdata(data)
              .then((rest)=>{
                //  return res.send(rest)
                 const pdfURL = `https://drive.google.com/uc?export=view&id=${rest}`;
                 sql_add_PDF = `INSERT INTO tto_form_data (vehicleRegistrationId, pdfURL, pdfgoogleDriveId) 
                                              VALUES ('${vehicleRegistrationId}','${pdfURL}','${rest}')`
                 pool.query(sql_add_PDF,(err,data)=>{
                   if(err) return res.json(err);
                   return res.status(200),
                          res.json("Data Inserted Successfully");
                 })
              });
    })
} 

module.exports = { genrateTTOform }; 