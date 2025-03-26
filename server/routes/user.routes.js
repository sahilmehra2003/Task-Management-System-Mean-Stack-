const express=require('express');
const router=express.Router();
const {registerUser,loginUser,logoutUser,updateUser,fetchUsers,deleteUser,adminCreateUser}=require('../controller/user.controller');
const { verifyJwt,verifyAdmin } = require('../middleware/auth.middleware');

router.post('/signup',registerUser);
router.post('/login',loginUser);
router.post('/logout',verifyJwt,logoutUser);
router.post('/admincreateuser',verifyJwt,verifyAdmin,adminCreateUser)
router.get('/getusers',verifyJwt,verifyAdmin,fetchUsers);
router.put('/updateuserdetails/:id',verifyJwt,verifyAdmin,updateUser);
router.delete('/deleteuser/:id',verifyJwt,verifyAdmin,deleteUser);


module.exports=router