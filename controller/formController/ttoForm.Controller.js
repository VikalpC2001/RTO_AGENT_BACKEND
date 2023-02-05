const { PDFDocument } = require("pdf-lib");
const { writeFileSync, readFileSync } = require("fs");
const fs = require('fs');
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

      const doc = await PDFDocument.create();
        const firstPage = doc.addPage([612.00, 1008.00]);
                firstPage.drawText('Vikalp Dipakkumar Chavda', {
                  x: 90,
                  y: 905,
                  size: 10,
                })
            
                firstPage.drawText('"om", 11-Prahlad Plot, Bhagwati Fast Food Street, Palace Road, Rajkot - 360001', {
                  x: 75,
                  y: 890,
                  size: 10,
                })
            
                firstPage.drawText('GJ03JD1111',{
                  x: 300,
                  y: 874,
                  size: 11,
                })
            
                firstPage.drawText('Jay Manishbhai Parmar',{
                  x: 280,
                  y: 856,
                  size: 10,
                })
            
                firstPage.drawText('Go Digit Genrel Insurence',{
                  x: 160,
                  y: 767,
                  size: 9,
                })
            
                firstPage.drawText('OG2300001234567890',{
                  x: 175,
                  y: 746,
                  size: 9,
                })
            
                firstPage.drawText('08/10/2023',{
                  x: 95,
                  y: 723,
                  size: 11,
                })
            
                firstPage.drawText('07/10/2024',{
                  x: 204,
                  y: 723,
                  size: 11,
                })
            
                firstPage.drawText('Rajkot',{
                  x: 160,
                  y: 638,
                  size: 10,
                })
            
                firstPage.drawText('Jay Manishbhai Parmar',{
                  x: 150,
                  y: 620,
                  size: 10,
                })
            
                firstPage.drawText('Rajkot',{
                  x: 450,
                  y: 620,
                  size: 10,
                })
            
                firstPage.drawText('GJ03JD1111',{
                  x: 320,
                  y: 601,
                  size: 11,
                })
            
                firstPage.drawText('Vikalp Dipakkumar Chavda', {
                  x: 94,
                  y: 583,
                  size: 10,
                })
            
                firstPage.drawText('"om", 11-Prahlad Plot, Bhagwati Fast Food Street, Palace Road, Rajkot - 360001', {
                  x: 80,
                  y: 568,
                  size: 10,
                })
            
                firstPage.drawText('12345', {
                  x: 130,
                  y: 503,
                  size: 11,
                })
            
                firstPage.drawText('01234', {
                  x: 250,
                  y: 503,
                  size: 11,
                })
            
                firstPage.drawText('SPL+', {
                  x: 355,
                  y: 503,
                  size: 11,
                })
            
                firstPage.drawText('HERO', {
                  x: 460,
                  y: 503,
                  size: 11,
                })
            
                firstPage.drawText('Rajkot',{
                  x: 160,
                  y: 418,
                  size: 10,
                })
            
                firstPage.drawText('Jay Manishbhai Parmar',{
                  x: 150,
                  y: 399,
                  size: 10,
                })
            
                firstPage.drawText('Rajkot',{
                  x: 450,
                  y: 399,
                  size: 10,
                })
            
                firstPage.drawText('GJ03JD1111',{
                  x: 320,
                  y: 380,
                  size: 11,
                })
            
                firstPage.drawText('Vikalp Dipakkumar Chavda', {
                  x: 94,
                  y: 362,
                  size: 10,
                })
            
                firstPage.drawText('"om", 11-Prahlad Plot, Bhagwati Fast Food Street, Palace Road, Rajkot - 360001', {
                  x: 80,
                  y: 347,
                  size: 10,
                })
            
        const auth = authenticateGoogle();    
        const fileMetadata = {
              name: 'vikalp',
              parents: ["1J4fw78joMdTX2sOFB6SDBnQDh1Jm0dE3"], // Change it according to your desired parent folder id
        };
            
        const media = {
              mimeType: "application/pdf",
              body: Readable.from(Buffer.from(await doc.save())),
       };

        const driveService = google.drive({ version: "v3", auth });

        const response = await driveService.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: "id",
        });

        if(response){
            return res.send(response.data.id);
        }else{
            res.send("not Able To Upload");
        }
} 

module.exports = { genrateTTOform };