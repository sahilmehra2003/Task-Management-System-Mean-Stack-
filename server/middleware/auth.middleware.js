const jwt=require("jsonwebtoken");
require('dotenv').config()
const User=require('../models/user.model')
exports.verifyJwt=async(req,res,next)=>{
    try {
        const token=req.cookies?.token || req.header("Authorization")?.replace("Bearer ","");
        // console.log("token:", token);
        const payload=jwt.verify(token,process.env.SECRET);
        // console.log(payload);
        const authorizedUser=await User.findById(payload?.id).select("-password -token")
        if (!authorizedUser) {
            return res.status(401).json({
                success:false,
                message:"Invalid token user not authorized"
            })
        }
        req.user=authorizedUser;
        next();
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Server error in authorizing user",
            error:error.message
        })
    }
}
exports.verifyAdmin=async(req,res,next)=>{
    try {
       if (req.user.role!=="admin") {
          return res.status(401).json({
            success:false,
            message:"Only admin can enter this route"
          })
       } 
       next();
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Server error in authorizing user",
            error:error.message
        })
    }
}