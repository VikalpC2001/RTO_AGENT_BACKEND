const { PDFDocument } = require("pdf-lib");
const { writeFileSync, readFileSync } = require("fs");
var {google} = require('googleapis');
const { Readable } =  require('stream');

const genrateTTOform = async(req,res) => {

    const authenticateGoogle = () => {
        const auth = new google.auth.GoogleAuth({
          keyFile: `/Users/vikalpchavda/Desktop/old mac/Rto_Agent_Website/backend/service-account.json`,
          scopes: "https://www.googleapis.com/auth/drive",
        });
        return auth;
      };

      // const doc = await PDFDocument.create();
      const document = await PDFDocument.load(readFileSync("/Users/vikalpchavda/Desktop/old mac/Rto_Agent_Website/backend/assets/TTO_Form-edit22.pdf"));

        // const firstPage = doc.addPage([612.00, 1008.00]);
        const firstPage = document.getPage(0);
        firstPage.moveTo(105, 530);
        firstPage.drawText('Vikalp Dipakkumar Chavda', {
          x: 90,
          y: 905,
          size: 10,
        })
      
        firstPage.drawText('12345678901234567890123456, 12345678901234567890123456, 12345678901234567890123456', {
          x: 75,
          y: 888,
          size: 10,
        })
      
        firstPage.drawText('Rajkot, Gujarat - 360001', {
          x: 75,
          y: 870,
          size: 10,
        })
      
      
        firstPage.drawText('GJ03JD1111',{
          x: 240,
          y: 853,
          size: 10,
        })
      
        firstPage.drawText('Jay Manishbhai Parmar',{
          x: 200,
          y: 833,
          size: 10,
        })
      
        firstPage.drawText('Go Digit Genrel Insurence',{
          x: 160,
          y: 763,
          size: 10,
        })
      
        firstPage.drawText('OG2300001234567890',{
          x: 176,
          y: 742,
          size: 9,
        })
      
        firstPage.drawText('08/10/2023',{
          x: 95,
          y: 718,
          size: 11,
        })
      
        firstPage.drawText('07/10/2024',{
          x: 204,
          y: 718,
          size: 11,
        })
      
        firstPage.drawText('Rajkot',{
          x: 160,
          y: 633,
          size: 10,
        })
      
        firstPage.drawText('Jay Manishbhai Parmar',{
          x: 145,
          y: 615,
          size: 10,
        })
      
        firstPage.drawText('Rajkot',{
          x: 450,
          y: 615,
          size: 10,
        })
      
        firstPage.drawText('GJ03JD1111',{
          x: 320,
          y: 593,
          size: 11,
        })
      
        firstPage.drawText('Vikalp Dipakkumar Chavda', {
          x: 94,
          y: 573,
          size: 10,
        })
      
        firstPage.drawText('12345678901234567890123456  12345678901234567890123456  12345678901234567890123456', {
          x: 80,
          y: 555,
          size: 10,
        })
      
        firstPage.drawText('Rajkot, Gujarat - 360001', {
          x: 80,
          y: 539,
          size: 10,
        })
      
      
        firstPage.drawText('12345', {
          x: 120,
          y: 487,
          size: 11,
        })
      
        firstPage.drawText('01234', {
          x: 240,
          y: 487,
          size: 11,
        })
      
        firstPage.drawText('SPL+', {
          x: 350,
          y: 487,
          size: 11,
        })
      
        firstPage.drawText('HERO', {
          x: 457,
          y: 487,
          size: 11,
        })
      
        firstPage.drawText('Rajkot',{
          x: 160,
          y: 400,
          size: 10,
        })
      
        firstPage.drawText('Jay Manishbhai Parmar',{
          x: 145,
          y: 382,
          size: 10,
        })
      
        firstPage.drawText('Rajkot',{
          x: 450,
          y: 382,
          size: 10,
        })
      
        firstPage.drawText('GJ03JD1111',{
          x: 320,
          y: 360,
          size: 11,
        })
      
        firstPage.drawText('Vikalp Dipakkumar Chavda', {
          x: 94,
          y: 340,
          size: 10,
        })
      
        firstPage.drawText('12345678901234567890123456  12345678901234567890123456  12345678901234567890123456', {
          x: 80,
          y: 321.5,
          size: 10,
        })
      
        firstPage.drawText('Rajkot, Gujarat - 360001', {
          x: 80,
          y: 305,
          size: 10,
        })
            
        const auth = authenticateGoogle();    
        const fileMetadata = {
              name: 'vikalp',
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
            return res.send(response.data.id);
        }else{
            res.send("not Able To Upload");
        }
} 

module.exports = { genrateTTOform };