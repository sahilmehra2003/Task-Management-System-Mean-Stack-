const nodemailer=require('nodemailer');
const { nodemailerConnect } = require('../config/nodeMailer.setup');
require('dotenv').config();

const mailSender=async (email,title,message)=>{
   try {
      const transporter=nodemailerConnect()
      const mailInfo=transporter.sendMail({
        from:'Task Management App',
        to:email,
        subject:title,
        html:message
      })
      // console.log("Email sent successfully",mailInfo);
      return mailInfo;
   } catch (error) {
    console.error('error occured while creating mail',error.message);
    throw new Error('Failed to send email');
   }
}

module.exports=mailSender;