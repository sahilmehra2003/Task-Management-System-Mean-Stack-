const express=require('express');
const router=express.Router();
const {createNotification,deleteNotification,fetchNotificationByUserId}=require('../controller/notification.controller');
const { verifyJwt } = require('../middleware/auth.middleware');

router.post('/createnotification',verifyJwt,createNotification);
router.get('/getnotificationforuser/:id',fetchNotificationByUserId);
router.delete('/deletenotification/:id',verifyJwt,deleteNotification);

module.exports=router;