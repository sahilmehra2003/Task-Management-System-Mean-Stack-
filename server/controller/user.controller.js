const User=require('../models/user.model');
const { createValidationSchema }=require('../helper/validation_schema')
const {fileUpload}=require('../helper/fileUpload')
const {removeLocalFile}=require('../helper/remove_localFile')
const uuidv4=require('uuid').v4
const generateJwtToken=async(userId)=>{ 
    try {
        const user=await User.findOne({_id:userId})
        const jwtToken=await user.generateToken();
        //  console.log(jwtToken);
        // user.token=jwtToken;
        // await user.save({validateBeforeSave:false});
        return jwtToken;
    } catch (error) {
        console.log(error.message)
    }
}

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } =req.body;
        
        const schema= createValidationSchema(['name','email','password'])
        await schema.validateAsync(req.body)
        // the lean() method is used to return documents from queries as plain JavaScript objects  instead of Mongoose documents, making queries faster and less memory intensive.
       // By default, Mongoose queries return instances of the Mongoose Document class, which are heavier due to internal state for change tracking. Enabling the lean option skips the instantiation of a full Mongoose document and returns a plain JavaScript objects
      //  lean should be use in read only cases  
        const registeredUser = await User.findOne({ email }).lean();
        if (registeredUser) {
            // if user is registered already and he is sending profile image then the file needs to be removed locally
            const profileImageLocalPath=req.files?.profileImage[0]?.path
            removeLocalFile(profileImageLocalPath);
            return res.status(409).json({
                success: false,
                message: "Email already registered."
            });
        }
        const profileImageLocalPath=req.files?.profileImage[0]?.path
        // console.log("profileImage:",profileImage);
        if (!profileImageLocalPath) {
            return res.status(400).json({
                success:false,
                message:"Please add your profile pic in the form",  
            })
        }
        // Joi validation on file
        const fileSchema=createValidationSchema(['profileImage'])
        await fileSchema.validateAsync(req.files?.profileImage[0])
        const fileName=uuidv4()
        const profileImage=await fileUpload(profileImageLocalPath,fileName,"auto");
        const newUser = await User.create({ name, email, password,profileImage:profileImage.secure_url });

        const createdUser = await User.findById(newUser._id).select("-password");

        return res.status(201).json({
            success: true,
            message: "User registered successfully.",
            data: createdUser
        });

    } catch (error) {
        const errorMessage=error.isJoi ? error.details[0]?.message : "Server error in signup";
        let statusCode=error.isJoi ? 422:500;
        console.log(statusCode)
        return res.status(statusCode).json({
            success: false,
            message:errorMessage,
            error:error.message
        });
    }
};

exports.adminCreateUser=async(req,res)=>{
    try {
        const {name,email,password,role}=req.body;
        const schema= createValidationSchema(['name','email','password'])
        await schema.validateAsync(req.body)
        // if (!name || !email || !password || !role) {
        //      return res.status(400).json({
        //         success: false,
        //         message: "Error in creating new user please fill all the fields"
        //     });
        // } 
        const registeredUser = await User.findOne({ email }).lean();
        if (registeredUser) {
            // if user is registered already and he is sending profile image then the file needs to be removed locally
            const profileImageLocalPath=req.files?.profileImage[0]?.path
            removeLocalFile(profileImageLocalPath);
            return res.status(409).json({
                success: false,
                message: "Email already registered."
            });
        }
        const profileImageLocalPath=req.files?.profileImage[0]?.path
        if (!profileImageLocalPath) {
            return res.status(400).json({
                success:false,
                message:"Please add your profile pic in the form",  
            })
        }
        const fileSchema=createValidationSchema(['profileImage'])
        await fileSchema.validateAsync(req.files?.profileImage[0])
        const fileName=uuidv4()
        const profileImage=await fileUpload(profileImageLocalPath,fileName,"auto");
        const newUser=await User.create({
            name:name,
            email:email,
            password:password,
            role:role,
            profileImage:profileImage?.secure_url
        })
        if (!newUser) {
            return res.status(400).json({
                success: false,
                message: "Error in creating new user"
            });
        }
        const createdUser=await User.findById(newUser._id).select("-password");
        return res.status(201).json({
            success: true,
            message: "New user created successfully by admin",
            data: createdUser
        });
    } catch (error) {
        const errorMessage=error.isJoi ? error.details[0]?.message : "Server error in signup";
        let statusCode=error.isJoi ? 422:500;
        console.log(statusCode)
        return res.status(statusCode).json({
            success: false,
            message:errorMessage,
            error:error.message
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
        const users=await User.find().select("-password");
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

exports.fetchUserById=async(req,res)=>{
    try {
        const {id}=req.params;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "No id  found.",
            });
        }
        const fetchedUser=await User.findById(id);
        if (!fetchedUser) {
            return res.status(403).json({
                success: false,
                message: "Incorrect id user not found",
            });
        }
        return res.status(200).json({
            success:true,
            message:"User fetched successfully",
            data:fetchedUser
        })
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
        const profileImageLocalPath=req.files?.profileImage[0]?.path
        // console.log("profileImage:",profileImage);
        let updatedUser;
        // console.log(profileImageLocalPath);
       if (profileImageLocalPath) {
          // Joi validation on file
        const fileSchema=createValidationSchema(['profileImage'])
        await fileSchema.validateAsync(req.files?.profileImage[0])
        const fileName=uuidv4()
        const profileImage=await fileUpload(profileImageLocalPath,fileName,"auto");
         updatedUser=await User.findByIdAndUpdate(id,{...req.body,profileImage:profileImage.secure_url},{new:true}).select("-password");
        //  console.log(updatedUser);
       }else{
          updatedUser=await User.findByIdAndUpdate(id,req.body,{new:true}).select("-password");
       }
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