const express=require('express');
const router=express.Router();
const {createNotification,fetchNotificationByUserId, updateNotification, unreadNotificationCount}=require('../controller/notification.controller');
const { verifyJwt } = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/checkPermission.middleware');
const { PERMISSIONS } = require('../config/permission');

router.post('/createnotification',verifyJwt,checkPermission(PERMISSIONS.CREATE_OWN_NOTIFICATION),createNotification);
router.get('/getnotificationforuser',verifyJwt,checkPermission(PERMISSIONS.READ_NOTIFICATIONS),fetchNotificationByUserId);
router.put('/updatenotification/:id',verifyJwt,checkPermission(PERMISSIONS.MARK_NOTIFICATION_READ),updateNotification);
router.get('/getunreadnotificationcount',verifyJwt,checkPermission(PERMISSIONS.READ_NOTIFICATIONS),unreadNotificationCount);
module.exports=router;