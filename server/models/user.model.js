const {Schema,model}=require('mongoose');
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken');
const crypto=require('crypto');
require('dotenv').config()
const userSchema=new Schema({
   name:{
      type:String,
      required:true,
      
   },
   email:{
     type:String,
     required:true,
     lowercase:true,
     trim:true
   },
   password:{
    type:String,
    required:true,
    minlength:8,
   },
   role:{
    type:String,
    enum:["user","admin"],
    required:true,
    default:"user",
   },
   profileImage:{
     type:String,
   },
   otp:{
    type:Number,
   },
   isVerified:{
    type:Boolean,
    default:false
   },
   passwordResetToken:String,
   passwordResetTokenExpires:Date,
   passwordChangedAt:Date
})
userSchema.pre('save',async function (next) {
     if (!this.isModified('password')) {
          return next()
     }
     this.password=await bcrypt.hash(this.password,10);
     next()
})
userSchema.methods.isPasswordCorrect=async function (password) {
      return await bcrypt.compare(password,this.password);
}
userSchema.methods.generateToken=async function(){
  try {
    return jwt.sign(
        {
            id: this._id,
            name: this.name,
            role: this.role,
            email: this.email 
        },
        process.env.SECRET,
        { expiresIn: '1h' }  
    );
} catch (error) {
    throw new Error("Error generating token");
}}

// create reset password token
userSchema.methods.createResetPasswordToken=function(){
  // we will use cryto library to generate reset password token
  const resetToken=crypto.randomBytes(32).toString('hex'); //user will have access to this token
  // since it is a plain string and not hashed so we will not store in db as plain text due to security risk we will encrypt it first
   
   this.passwordResetToken=crypto
       .createHash('sha256') // we have defined the algo used for hashing
       .update(resetToken)  //the string we want to hash
       .digest('hex'); //  and the format 
  //  password token will expirein 10 minutes
  this.passwordResetTokenExpires=Date.now() + 10*60*1000;
  return resetToken; // in db we will store encryted token but user will get plain token
}

const User=model('User',userSchema);
module.exports=User;
