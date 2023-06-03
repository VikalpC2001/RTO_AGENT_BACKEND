const { PDFDocument } = require("pdf-lib");
const { writeFileSync, readFileSync } = require("fs");
var {google} = require('googleapis');
const { Readable } =  require('stream');
const pool = require("../../database");

const fillPDFdata = async(data)=>{

  try{
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
    buyerAddressLine1            : data[0].buyerAddressLine1         ? data[0].buyerAddressLine1         : '',
    buyerAddressline2and3        : data[0].buyerAddressline2and3     ? data[0].buyerAddressline2and3     : '', 
    buyerStateCityPincode        : data[0].buyerStateCityPincode     ? data[0].buyerStateCityPincode     : '',
    serviceAuthority             : data[0].serviceAuthority          ? data[0].serviceAuthority          : '',
    insuranceCompanyName         : data[0].insuranceCompanyName      ? data[0].insuranceCompanyName      : '',
    policyNumber                 : data[0].policyNumber              ? data[0].policyNumber              : '',
    insuranceStartDate           : data[0].insuranceStartDate        ? data[0].insuranceStartDate        : '',
    insuranceEndDate             : data[0].insuranceEndDate          ? data[0].insuranceEndDate          : '',
    clientWhatsAppNumber         : data[0].clientWhatsAppNumber      ? data[0].clientWhatsAppNumber      : '',
    puccNumber                   : data[0].puccNumber                ? data[0].puccNumber                : '',
    puccStartDate                : data[0].puccStartDate             ? data[0].puccStartDate             : '',
    puccEndDate                  : data[0].puccEndDate               ? data[0].puccEndDate               : '',
    workType                     : data[0].workType                  ? data[0].workType                  : '',
    insuranceCompanyShortName    : data[0].insuranceCompanyName.split(' ').slice(0,2).join(' ') ? data[0].insuranceCompanyName.split(' ').slice(0,2).join(' ') : ''   
  }

  const authenticateGoogle = () => {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_SERVICE,
      scopes: "https://www.googleapis.com/auth/drive",
    });
    return auth;
  };

  const document = await PDFDocument.load(readFileSync(process.env.FORM_URL));

  // const firstPage = doc.addPage([612.00, 1008.00]);
  const firstPage = document.getPage(0);
  const secondPage = document.getPage(1);
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

  secondPage.moveTo(72, 330);
  secondPage.drawText(details.vehicleRegistrationNumber, {
    x: 120,
    y: 712,
    size: 12
  });

  secondPage.drawText(details.clientWhatsAppNumber, {
    x: 420,
    y: 712,
    size: 12
  });

  secondPage.drawText(details.workType, {
    x: 220,
    y: 687,
    size: 12
  });

  secondPage.drawText(details.buyerName, {
    x: 160,
    y: 663,
    size: 12
  });

  secondPage.drawText(details.buyerAddressLine1, {
    x: 260,
    y: 637,
    size: 12
  });

  secondPage.drawText(details.buyerAddressline2and3, {
    x: 70,
    y: 613,
    size: 12
  });

  secondPage.drawText(details.buyerStateCityPincode, {
    x: 345,
    y: 599,
    size: 12
  });

  secondPage.drawText(details.workType, {
    x: 115,
    y: 465,
    size: 12,
  });

  secondPage.drawText(details.vehicleRegistrationNumber, {
    x: 120,
    y: 440,
    size: 12
  });

  secondPage.drawText(details.insuranceCompanyShortName, {
    x: 213,
    y: 415,
    size: 11
  });

  secondPage.drawText(details.insuranceEndDate, {
    x: 380,
    y: 415,
    size: 10
  });

  secondPage.drawText(details.policyNumber, {
    x: 120,
    y: 390,
    size: 10
  });

  secondPage.drawText(details.puccNumber, {
    x: 190,
    y: 366,
    size: 10
  });

  secondPage.drawText(details.puccStartDate, {
    x: 284,
    y: 366,
    size: 10
  });

  secondPage.drawText(details.puccEndDate, {
    x: 380,
    y: 366,
    size: 10
  });

  secondPage.drawText("AADHAR CARD", {
    x: 180,
    y: 293,
    size: 12
  });

  secondPage.drawText("29 / 30", {
    x: 250,
    y: 219,
    size: 12
  });

  secondPage.drawText(details.workType, {
    x: 150,
    y: 95,
    size: 12
  });

      
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
      throw new Error("Error");
  }
  }catch(error){
    throw new Error(error);
  }
}

const genrateTTOform = async(req,res) => {

    try{
      const vehicleRegistrationId = res.locals.id;
      console.log("><><>>>>>>>",vehicleRegistrationId);
      const sql_querry_getdetailsById = `SELECT UPPER(vehicleRegistrationNumber) AS vehicleRegistrationNumber,
                                         RIGHT(vehicleChassisNumber,5) AS vehicleChassisNumber,
                                         RIGHT(vehicleEngineNumber,5) AS vehicleEngineNumber, UPPER(vehicleMake) AS vehicleMake, UPPER(vehicleModel) AS vehicleModel,
                                         GROUP_CONCAT(rto_work_data.shortForm SEPARATOR ' + ') as workType,
                                         UPPER(CONCAT(sellerFirstName," ",sellerMiddleName," ",sellerLastName)) AS sellerName, sellerAddress,
                                         UPPER(CONCAT(buyerFirstName," ",buyerMiddleName," ",buyerLastName)) AS buyerName,
                                         UPPER(CONCAT(buyerAddressLine1,", ",buyerAddressLine2,", ",buyerAddressLine3)) AS buyerAddress,
                                         UPPER(buyerAddressLine1) AS buyerAddressLine1, UPPER(CONCAT(buyerAddressLine2,", ",buyerAddressLine3)) AS buyerAddressline2and3,
                                         CONCAT(state_data.stateName,", ",city_data.cityName,"- ",buyerPincode) AS buyerStateCityPincode,
                                         RIGHT(puccNumber,5) AS puccNumber, DATE_FORMAT(puccStartDate, '%d-%m-%Y') AS puccStartDate, DATE_FORMAT(puccEndDate, '%d-%m-%Y') AS puccEndDate, 
                                         UPPER(rto_city_data.cityRTOName) AS serviceAuthority, (insurance_data.insuranceCompanyName) AS insuranceCompanyName, policyNumber, 
                                         DATE_FORMAT(insuranceStartDate, '%d-%m-%Y') AS insuranceStartDate, DATE_FORMAT(insuranceEndDate, '%d-%m-%Y') AS insuranceEndDate, clientWhatsAppNumber
                                         FROM vehicle_registration_details
                                         INNER JOIN work_list ON work_list.vehicleRegistrationId = vehicle_registration_details.vehicleRegistrationId
                                         INNER JOIN rto_work_data ON rto_work_data.workId = work_list.workId
                                         INNER JOIN state_data ON state_data.stateId = vehicle_registration_details.buyerState
                                         INNER JOIN city_data ON city_data.cityId = vehicle_registration_details.buyerCity
                                         INNER JOIN rto_city_data ON rto_city_data.RTOcityId = vehicle_registration_details.serviceAuthority
                                         LEFT JOIN insurance_data ON insurance_data.insuranceId = vehicle_registration_details.insuranceCompanyNameId
                                         WHERE vehicle_registration_details.vehicleRegistrationId = '${vehicleRegistrationId}' GROUP BY work_list.vehicleRegistrationId`;
      pool.query(sql_querry_getdetailsById,(err,data)=>{
        if(err) return res.status(404).send(err);
        var temp;
        fillPDFdata(data)
        .then((rest)=>{
          //  return res.send(rest)
           const pdfURL = `https://drive.google.com/uc?export=view&id=${rest}`;
           sql_add_PDF = `INSERT INTO tto_form_data (vehicleRegistrationId, pdfURL, pdfgoogleDriveId) 
                                        VALUES ('${vehicleRegistrationId}','${pdfURL}','${rest}')`
           pool.query(sql_add_PDF,(err,data)=>{
             if(err) return res.status(404).send(err);;
             return res.status(200),
                    res.json("Ok");
           })
        })
        .catch((err)=>{
          return res.status(404).send("Please Fill All TO Fields")
        })
})
    }catch(error){
      throw new Error(error);
    }
            
} 

module.exports = { genrateTTOform }; 