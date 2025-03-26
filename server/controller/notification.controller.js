const Notification=require('../models/notification.model');
const User = require('../models/user.model');

exports.createNotification=async(req,res)=>{
    try {
        const {title,message,userId}=req.body;
        if (!title || !message || !userId) {
            return res.status(400).json({
                success:false,
                message:"Fill all the fields required to create notification!", 
             })
        }
       
       if (!userId) {
          return res.status(404).json({
             success:false,
             message:"UserId is required to create notification", 
          })
       } 
       const notifieduser=await User.findOneAndUpdate(
                                             {_id:userId},
                                             {$inc:{notification_count:1}},{new:true}).select("-password -token"); //increasing notification count by one
       const newNotification=await Notification.create({
                title,
                message,
                userId
       })
       if(!newNotification){
        return res.status(404).json({
            success:false,
            message:"Error in  creating new notification", 
         })
       }
       return res.status(200).json({
           success:true,
           data:{newNotification,notifieduser},
           message:"New notification created successfully"
       })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Server Error in creating notification for user",
            error:error.message
        })
    }
}

exports.deleteNotification=async(req,res)=>{
    try {
       const userId=req.user.id 
       const {id}=req.params;
       if (!id || !userId) {
          return res.status(404).json({
             success:false,
             message:"Id or userID not found to delete notification!"
          })
       }
       const deletedNotification=await Notification.findByIdAndDelete(id,{new:true});
       if (!deletedNotification) {
          return res.status(403).json({
             success:false,
             message:"Error in deleting notification,invalid notification id"
          })
       }
       const updateUser=await User.findByIdAndUpdate(
        userId,{
           $inc:{
            notification_count:-1
           },
           
       },{
        new:true
       })
       return res.status(200).json({
          success:true,
          message:"Notifiaction deleted successfully", 
          data:updateUser
       })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Server Error in deleting notification for user",
            error:error.message
        }) 
    }
}

exports.fetchNotificationByUserId=async(req,res)=>{
    try {
        const {id}=req.params
        if (!id) {
            return res.status(404).json({
                success:false,
                message:"user id not found for fetching notification"
            })
        }
        // console.log(userId);
        const fetchedNotification=await Notification.find({userId:id});
        console.log(fetchedNotification)
        if (!fetchedNotification ) {
            return res.status(403).json({
                success:false,   
                message:"You need to login to see your notification" 
            })
        }
        return res.status(200).json({
            success:true,
            message:"Notifiaction fetched successfully successfully",
            data:fetchedNotification
         })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Server Error in fetching notification for user",
            error:error.message
        }) 
    }
}