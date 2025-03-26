const {model,Schema}=require('mongoose');

const notificationSchema=new Schema({
  title:{
    type:String,
    required:true,
    trim:true
  },
  message:{
     type:String,
     required:true,
     trim:true,
     lowercase:true
   },
   isRead:{
     type:Boolean,
     default:false
   },
   userId:{
     type:Schema.Types.ObjectId,
     ref:'User',
     required:true
   }
},{timestamps:true})

const Notification=model("Notification",notificationSchema);
module.exports=Notification;