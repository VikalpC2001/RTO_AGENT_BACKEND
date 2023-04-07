const stream = require("stream");
const multer = require("multer");
const { google } = require("googleapis");
const pool = require("../../database");
const { json } = require("body-parser");
const upload = multer({limits: {fileSize : 5 * 1024 * 1024}}).any();

const KEYFILEPATH = process.env.GOOGLE_SERVICE;
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
            if(!files[0]){
                res.status(401);
                res.send("Please Select File")
            }else{
              const temp =  await uploadFile(files[0])
                // console.log(">>?",temp);
                // fillPDFdata(data)
                .then((temp)=>{
                    const vehicleRegistrationId = req.body.vehicleRegistrationId;
                    const appointmentDate = new Date(req.body.appointmentDate?req.body.appointmentDate:'10/10/1001').toString().slice(4, 15);
                    console.log("<><><><>",appointmentDate)
                    if(vehicleRegistrationId === ''){
                      res.status(401);
                      res.send("Please Enter Id")
                    }else{
                        const receiptURL = `https://drive.google.com/uc?export=view&id=${temp}`
                          sql_add_Receipt = `INSERT INTO rto_receipt_data (vehicleRegistrationId, receiptURL, receiptGoogleDriveId, appointmentDate) VALUES ('${vehicleRegistrationId}','${receiptURL}','${temp}',STR_TO_DATE(NULLIF('${appointmentDate}','Oct 10 1001'),'%b %d %Y'));
                                             SELECT nextState FROM vehicle_registration_details WHERE vehicleRegistrationId = '${vehicleRegistrationId}'`;
                        pool.query(sql_add_Receipt,(err,data)=>{
                        if(err) return res.json(err);
                        var newVariable = [];
                        let result = Object.values(JSON.parse(JSON.stringify(data[1][0])));
                        result.forEach((v) => newVariable.push(v));
                        console.log(">>>>>?????",newVariable[0])
                          if(newVariable[0] === 2){
                            sql_state_update = `UPDATE vehicle_registration_details SET currentState = 2, nextState = 4, vehicleWorkStatus = 'PENDING' WHERE vehicleRegistrationId = '${vehicleRegistrationId}'`
                          }else{
                            sql_state_update = `UPDATE vehicle_registration_details SET vehicleWorkStatus = 'APPOINTMENT' WHERE vehicleRegistrationId = '${vehicleRegistrationId}'`
                          }
                          console.log("query 1",sql_state_update);
                            pool.query(sql_state_update,(err,data)=>{
                              if(err) return res.status(404).send(err);
                              return res.status(200),
                              res.json("State Updated & Receipt Uoloaded Successfully");
                            })
                          // if(err) return res.status(404).send(err);
                          // return res.status(200),
                          //       res.json("Receipt Uoloaded Successfully");
                      })
                    }
                })
            // return res.status(200).send(`Receipt Uoloaded Successfullys`);
            }
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