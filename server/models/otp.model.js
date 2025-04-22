const {Schema,model}=require('mongoose');
const mailSender=require('../helper/mailSender')
const otpSchema=new Schema({
    email:{
        type:String,
        required:true
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now,
        expires:5*60,
    }
})

async function sendVerificationEmail(email,otp) {
    try {
        const message=`<h2>Here is your otp for verification ${otp}</h2>`
        const mailResponse=await mailSender(email,"Verification email",message);
        // console.log(mailResponse.response);
    } catch (error) {
       console.log("Error in sending verification mail",error.message); 
    }
}
otpSchema.pre('save',async function () {
    sendVerificationEmail(this.email,this.otp)
})
const OTP=model('OTP',otpSchema);
module.exports=OTP