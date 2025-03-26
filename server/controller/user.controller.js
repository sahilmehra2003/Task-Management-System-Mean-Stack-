const User=require('../models/user.model');


const generateJwtToken=async(userId)=>{ 
    try {
        const user=await User.findOne({_id:userId})
        const jwtToken=await user.generateToken();
        //  console.log(jwtToken);
        user.token=jwtToken;
        await user.save({validateBeforeSave:false});
        return jwtToken;
    } catch (error) {
        console.log(error.message)
    }
}

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        const registeredUser = await User.findOne({ email }).lean();
        if (registeredUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered."
            });
        }

        const newUser = await User.create({ name, email, password });

        const createdUser = await User.findById(newUser._id).select("-password -token");

        return res.status(201).json({
            success: true,
            message: "User registered successfully.",
            data: createdUser
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error while registering user.",
            error: error.message
        });
    }
};

exports.adminCreateUser=async(req,res)=>{
    try {
        const {name,email,password,role}=req.body;
        if (!name || !email || !password || !role) {
             return res.status(400).json({
                success: false,
                message: "Error in creating new user please fill all the fields"
            });
        } 
        const newUser=await User.create({
            name:name,
            email:email,
            password:password,
            role:role
        })
        if (!newUser) {
            return res.status(400).json({
                success: false,
                message: "Error in creating new user"
            });
        }
        const createdUser=await User.findById(newUser._id).select("-password -token");
        return res.status(201).json({
            success: true,
            message: "New user created successfully by admin",
            data: createdUser
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error while admin creating user.",
            error: error.message
        });
    }
}
exports.loginUser=async(req,res)=>{
    try{
        const {email,password}=req.body;
        if (!email || !password) {
            return res.status(401).json({
                success: false,
                message: "Please fill all the fields if you want to login"
            });
        }
        const user=await User.findOne({email:email})
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        const isPasswordCorrect=await user.isPasswordCorrect(password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Can't login, Incorrect password"
            });
        }
        // console.log(user._id);
        const token=await generateJwtToken(user._id);
        // console.log(token)
        const loggedInUser=await User.findById(user.id).select("-password -token");
        // console.log(loggedInUser);
        const options={
            httpOnly:true,
            secure:true
        }
        if (!loggedInUser) {
            return res.status(401).json({
                success: false,
                message: "User can't found login"
            })
        }
        return res.status(200).cookie("token",token,{  
            ...options,
            expires:new Date(Date.now()+1*24*60*60*1000)
        }).json({
            success: true,
            message: "User logged in successfully",
            data: {loggedInUser,token}
        });

    }catch(error){
        return res.status(500).json({
            success: false,
            message: "Server error while signing in user.",
            error: error.message
        });
    }
}
exports.logoutUser=async(req,res)=>{
    try {
        const userId=req.user.id;
        const user=await User.findByIdAndUpdate(userId,{
            $set:{
                token:undefined
            }
        })
        const options={
            httpOnly:true,
            secure:true
        }
        return res.status(200)
                  .clearCookie("token",options)
                  .json({
                    success: true,
                    message: `${user.name} logged Out`
                  });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error while signout.",
            error: error.message
        });   
    }
}
exports.fetchUsers=async(req,res)=>{
    try {
        const users=await User.find().select("-password -token");
        if (!users || users.length===0) {
            return res.status(400).json({
                success: false,
                message: "No user found.",
            });
        }
            return res.status(200).json({
                success: true,
                message: "User fetched successfully",
                data:users
            });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error while fetching user.",
            error: error.message
        });
    }
}

exports.updateUser=async(req,res)=>{
    try {
        const {id}=req.params;
        if (!id) {
            return res.status(404).json({
                success:false,
                message:"Id is required to update user"
            })
        }
        const updatedUser=await User.findByIdAndUpdate(id,req.body,{new:true}).select("-password -token");
        if (!updatedUser) {
            return res.status(404).json({
                success:false,
                message:"Invalid user Id can't update user"
            })
        }
        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            data:updatedUser
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error while updating user.",
            error: error.message
        }); 
    }
}

exports.deleteUser=async(req,res)=>{
    try {
        const {id}=req.params;
        if (!id) {
            return res.status(404).json({
                success:false,
                message:"Id is required to update user"
            })
        }
        const deletedUser=await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({
                success:false,
                message:"Invalid user Id can't delete user"
            })
        }
        return res.status(200).json({
            success: true,
            message: "User deleted successfully",
            data:deletedUser
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error while deleting user.",
            error: error.message
        });  
    }
}