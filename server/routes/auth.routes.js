const express = require('express');
const {verifyJwt}=require('../middleware/auth.middleware')
const {registerUser,loginUser,logoutUser,sendOTP,verifyOtp}=require('../controller/auth.controller')
const router = express.Router();

// authentication routes
router.post('/signup',registerUser);
router.post('/login', loginUser);
router.post('/logout', verifyJwt, logoutUser);
router.post('/generateOTP', sendOTP);
router.post('/verifyOtp', verifyOtp);

module.exports=router