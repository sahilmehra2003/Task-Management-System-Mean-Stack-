const express=require('express');
const router=express.Router();
const {registerUser,loginUser,logoutUser,updateUser,fetchUsers,deleteUser,adminCreateUser, fetchUserById}=require('../controller/user.controller');
const { verifyJwt,verifyAdmin } = require('../middleware/auth.middleware');
const upload=require('../middleware/multer.middleware')
router.post('/signup',
     upload.fields([
        {
            name:'profileImage',
            maxCount:1
        }
     ])
    ,registerUser);
router.post('/login',loginUser);
router.post('/logout',verifyJwt,logoutUser);
router.post('/admincreateuser',verifyJwt,verifyAdmin,
    upload.fields([
        {
            name:'profileImage',
            maxCount:1
        }
     ])
    ,adminCreateUser)
router.get('/getusers',verifyJwt,verifyAdmin,fetchUsers);
router.get('/getuserbyid/:id',fetchUserById);
router.put('/updateuserdetails/:id',verifyJwt,verifyAdmin,
     upload.fields([
        {
            name:'profileImage',
            maxCount:1
        }
     ])
    ,updateUser);
router.delete('/deleteuser/:id',verifyJwt,verifyAdmin,deleteUser);


module.exports=router