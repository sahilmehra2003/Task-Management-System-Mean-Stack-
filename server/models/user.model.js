const {Schema,model}=require('mongoose');
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
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
   notification_count:{
     type:Number,
     default:0
   },
   token:{
     type:String,
     
   }
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
}

}

const User=model('User',userSchema);
module.exports=User;
