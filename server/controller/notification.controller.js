const { default: mongoose } = require('mongoose');
const { sendNotifications } = require('../helper/sendNotifications');
const Notification=require('../models/notification.model');
const User = require('../models/user.model');

exports.createNotification=async(req,res)=>{
    try {
        
        const {title,message,userIds}=req.body;
        if (!title || !message || !userIds || userIds.length===0) {
            return res.status(400).json({
                success:false,
                message:"Fill all the fields required to create notification!", 
             })
        }
        const newUserIds=userIds.map((userId)=>new mongoose.Types.ObjectId(userId))
       if (!userIds) {
          return res.status(404).json({
             success:false,
             message:"UserId is required to create notification", 
          })
       } 
       const result=await sendNotifications({
              title,
              message,
              userIds:newUserIds
       })
       
       if(!result){
        return res.status(404).json({
            success:false,
            message:"Error in  creating new notification", 
         })
       }
    //    console.log(result);
       return res.status(200).json({
           success:true,
           data:result,
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

exports.updateNotification=async(req,res)=>{
    try {
       const {id}=req.params;
       const userId = req.user.id;
       if (!id) {
          return res.status(404).json({
             success:false,
             message:"Id not found to mark notification read!"
          })
       }
       const notificationToUpdate = await Notification.findById(id).lean();
       if (!notificationToUpdate) {
        return res.status(404).json({ success: false, message: "Notification not found." });
       }
       const isRecipient = notificationToUpdate.userIds.some(recipientId => recipientId === userId);
       if (!isRecipient) {
        return res.status(403).json({ success: false, message: "Forbidden: You cannot modify this notification." });
       }
       
       const updatedNotification=await Notification.findByIdAndUpdate(id,{isRead:true},{new:true});
       return res.status(200).json({
          success:true,
          message:"Notifiaction read", 
          data:updatedNotification
       })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Server Error in marking notification read",
            error:error.message
        }) 
    }
}

exports.fetchNotificationByUserId=async(req,res)=>{
    try {
        const userId=req.user.id
        
        if (!userId) {
            return res.status(404).json({
                success:false,
                message:"user id not found for fetching notification"
            })
        }
        const newUserId=new mongoose.Types.ObjectId(userId)
        // console.log(userId);
        const fetchedNotification=await Notification.find(
            {
                userIds:newUserId
            },
        );
        // console.log(fetchedNotification)
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
exports.unreadNotificationCount=async(req,res)=>{
    const userId=req.user.id;
    if (!userId) {
        return res.status(400).json({
            success:false,
            message:'No userId found'
        })
    }
    const unreadCount=await Notification.countDocuments({
        userIds:userId,
        isRead:false,
    })  
    return res.status(200).json({
        success:true,
        message:`Unread notification count is ${unreadCount}`,
        data:unreadCount
    })
}