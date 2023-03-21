const stream = require("stream");
const multer = require("multer");
const { google } = require("googleapis");
const pool = require("../../database");
const upload = multer({limits: {fileSize : 5 * 1024 * 1024}}).any();

const KEYFILEPATH = `/Users/vikalpchavda/Desktop/old mac/Rto_Agent_Website/backend/service-account.json`;
const SCOPES = ["https://www.googleapis.com/auth/drive"];

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

const uploadReceipt = async(req, res) => {

    try {
        upload(req,res, async()=>{
            // console.log("/////",req.files);
            const { files } = req;
                const temp =  await uploadFile(files[0])
                // console.log(">>?",temp);
                // fillPDFdata(data)
                .then((temp)=>{
                    const data = {
                        vehicleRegistrationId : req.body.vehicleRegistrationId,
                        appointmentDate       : new Date(req.body.appointmentDate?req.body.appointmentDate:"01/01/2001").toString().slice(4, 15)
                    }
                    if(data){
                        const receiptURL = `https://drive.google.com/uc?export=view&id=${temp}`;
                        sql_add_Receipt = `INSERT INTO rto_receipt_data (vehicleRegistrationId, receiptURL, receiptGoogleDriveId, appointmentDate) VALUES ('${data.vehicleRegistrationId}','${receiptURL}','${temp}',STR_TO_DATE('${data.appointmentDate}','%b %d %Y'));
                                           UPDATE vehicle_registration_details SET vehicleWorkStatus = 'Appointment Done' WHERE vehicleRegistrationId = '${data.vehicleRegistrationId}'`;
                        pool.query(sql_add_Receipt,(err,data)=>{
                        if(err) return res.json(err);
                          if(err) return res.status(404).send(err);
                          return res.status(200),
                               res.json("Receipt Uoloaded Successfully");
                      })
                    }
                })
            // return res.status(200).send(`Receipt Uoloaded Successfullys`);
        })
    } catch (f) {
        return res.send(f.message);
    }
  }

  const uploadFile = async (fileObject) => {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileObject.buffer);
    const { data } = await google.drive({ version: "v3", auth }).files.create({
      media: {
        mimeType: fileObject.mimeType,
        body: bufferStream,
      },
      
      requestBody: {
        name: fileObject.originalname,
        parents: ["1E9V6ZiTUfYWw6E0H-8RO7fqyD9Dalq7D"],
      }
    });
    console.log(`Uploaded file ${data.name} ${data.id}`);
    return data.id;
  };

  module.exports = { uploadReceipt };