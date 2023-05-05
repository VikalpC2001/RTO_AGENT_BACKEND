const stream = require("stream");
const multer = require("multer");
const { google } = require("googleapis");
const pool = require("../../database");
const { json } = require("body-parser");
const { sql } = require("googleapis/build/src/apis/sql");
const upload = multer({limits: {fileSize : 5 * 1024 * 1024}}).any();

const KEYFILEPATH = process.env.GOOGLE_SERVICE;
const SCOPES = ["https://www.googleapis.com/auth/drive"];

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

const uploadReceipt = async(req,res,next) => {
    try {
            upload(req,res, async()=>{
              const vehicleRegistrationId = req.body.vehicleRegistrationId ? req.body.vehicleRegistrationId : req.body.files;
                  console.log("iddddddddddddd",req.body);
                  console.log("dfsakjnfahfjksan",req.body.vehicleRegistrationId ? req.body.vehicleRegistrationId : req.body.files);
                  sql_get_Status = `SELECT vehicleWorkStatus FROM vehicle_registration_details WHERE vehicleRegistrationId = '${vehicleRegistrationId}'`;
                  console.log("fdas",sql_get_Status);
                  pool.query(sql_get_Status,async(err,row)=>{
                    if(err) return res.json(err);
                      var status = row[0]['vehicleWorkStatus']
                      console.log("statuuuuuus",status);
                      if(status === 'PENDING'){
                          console.log(req.body);
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
                                  const uid1 = new Date();
                                  const uid2 = (new Date().getTime()).toString(36);
                                  const id = String("Receipt_" + uid1.getTime() + "_" + uid2);
                                  const appointmentDate = new Date(req.body.appointmentDate?req.body.appointmentDate:'10/10/1001').toString().slice(4, 15);
                                  const sendReceipt = req.body.sendReceipt === 'true' ? true : false;
                                  console.log(">>>>",sendReceipt);
                                  if(vehicleRegistrationId === '' || appointmentDate === ''){
                                    res.status(401);
                                    res.send("Please Enter Id")
                                  }else{
                                      const receiptURL = `https://drive.google.com/uc?export=view&id=${temp}`
                                        sql_add_Receipt = `INSERT INTO rto_receipt_data (receiptId, vehicleRegistrationId, receiptURL, receiptGoogleDriveId, appointmentDate) VALUES ('${id}','${vehicleRegistrationId}','${receiptURL}','${temp}',STR_TO_DATE(NULLIF('${appointmentDate}','Oct 10 1001'),'%b %d %Y'));
                                                           UPDATE vehicle_registration_details set vehicleWorkStatus = 'APPOINTMENT' WHERE vehicleRegistrationId = '${vehicleRegistrationId}'`;
                                                           console.log("sqll",sql_add_Receipt);
                                      pool.query(sql_add_Receipt,(err,data)=>{
                                      if(err) return res.status(404).send(err);
                                        res.locals.id = id;
                                         console.log("local1",res.locals.id);
                                         console.log("???????",sendReceipt);
                                         sendReceipt ? next() : res.status(200).send("Ok");
                                        //  if(sendReceipt === true){
                                        //   next()
                                        //  }else{
                                        //   res.status(200).send("Ok");
                                        //  }
                                    })
                                  }
                              })
                          }
                      }else{
                        sql_getNextstep = `SELECT nextState FROM vehicle_registration_details WHERE vehicleRegistrationId = '${vehicleRegistrationId}'`;
                        pool.query(sql_getNextstep,(err,data)=>{
                          if(err) return res.status(404).send(err);
                          var state = data[0]['nextState'];
                          console.log("state",state);
                            if(state === 2){
                                sql_state_update = `UPDATE vehicle_registration_details SET currentState = 2, nextState = 4, vehicleWorkStatus = 'PENDING' WHERE vehicleRegistrationId = '${vehicleRegistrationId}'`
                            }else{
                                sql_state_update = `UPDATE vehicle_registration_details SET vehicleWorkStatus = 'COMPLETE' WHERE vehicleRegistrationId = '${vehicleRegistrationId}'`
                            }
                            pool.query(sql_state_update,(err,data)=>{
                                if(err) return res.status(404).send(err);
                                return res.send('State Updated')
                            })
                          })
                      }
                  })
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