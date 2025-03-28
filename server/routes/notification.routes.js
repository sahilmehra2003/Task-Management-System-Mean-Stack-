const express=require('express');
const router=express.Router();
const {createNotification,fetchNotificationByUserId, updateNotification}=require('../controller/notification.controller');
const { verifyJwt } = require('../middleware/auth.middleware');

router.post('/createnotification',verifyJwt,createNotification);
router.get('/getnotificationforuser/:id',fetchNotificationByUserId);
router.put('/updatenotification/:id',verifyJwt,updateNotification);

module.exports=router;