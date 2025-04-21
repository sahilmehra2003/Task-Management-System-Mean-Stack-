const nodemailer=require('nodemailer');
require('dotenv').config()

exports.nodemailerConnect=()=>{
    try {
        const transporter=nodemailer.createTransport({
            host:process.env.MAIL_HOST,
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS
            }
        })
        return transporter;
    } catch (error) {
        console.log(`Error in connecting to nodemailer: ${error.message}`)
    }
}