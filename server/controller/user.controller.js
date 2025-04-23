const User = require("../models/user.model");
const { validationSchemaForUser,updatePasswordSchema } = require("../helper/validation_schema");
const { fileUpload } = require("../helper/fileUpload");
const { removeLocalFile } = require("../helper/remove_localFile");
const { extractImagePublicId } = require('../helper/find_image_publicId')
const { default: mongoose } = require("mongoose");
const uuidv4 = require("uuid").v4;
const cloudinary = require('cloudinary').v2

exports.adminCreateUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const schema = validationSchemaForUser(["name", "email", "password"]);
    await schema.validateAsync(req.body);
    const registeredUser = await User.findOne({ email }).lean();
    if (registeredUser) {
      // if user is registered already and he is sending profile image then the file needs to be removed locally
      const profileImageLocalPath = req.files?.profileImage[0]?.path;
      removeLocalFile(profileImageLocalPath);
      return res.status(409).json({
        success: false,
        message: "Email already registered.",
      });
    }
    const profileImageLocalPath = req.files?.profileImage[0]?.path;
    if (!profileImageLocalPath) {
      return res.status(400).json({
        success: false,
        message: "Please add your profile pic in the form",
      });
    }
    const fileSchema = validationSchemaForUser(["profileImage"]);
    await fileSchema.validateAsync(req.files?.profileImage[0]);
    const fileName = uuidv4();
    const profileImage = await fileUpload(
      profileImageLocalPath,
      fileName,
      "auto"
    );
    const newUser = await User.create({
      name: name,
      email: email,
      password: password,
      role: role,
      profileImage: profileImage?.secure_url,
    });
    if (!newUser) {
      return res.status(400).json({
        success: false,
        message: "Error in creating new user",
      });
    }
    const createdUser = await User.findById(newUser._id).select("-password");
    return res.status(201).json({
      success: true,
      message: "New user created successfully by admin",
      data: createdUser,
    });
  } catch (error) {
    const errorMessage = error.isJoi
      ? error.details[0]?.message
      : "Server error in signup";
    let statusCode = error.isJoi ? 422 : 500;
    // console.log(statusCode);
    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: error.message,
    });
  }
};


exports.fetchUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    if (!users || users.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No user found.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching user.",
      error: error.message,
    });
  }
};

exports.fetchUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "No id  found.",
      });
    }
    const newId = new mongoose.Types.ObjectId(id);
    const fetchedUser = await User.findById(newId);
    if (!fetchedUser) {
      return res.status(403).json({
        success: false,
        message: "Incorrect id user not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: fetchedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching user.",
      error: error.message,
    });
  }
};

// update user password if verified
exports.updatePassword=async(req,res)=>{
  try {
    console.log(req.body)
    const validatedSchema=await updatePasswordSchema.validateAsync(req.body);
    if (validatedSchema.newPassword!==validatedSchema.confirmPassword) {
       return res.status(400).json({
          success:false,
          message:"Passwords don't match"
       })
    }
    //   1) GET CURRENT USER DATA FROM DB
        const userId=req.user._id;
        if(!userId){
             return res.status(400).json({
              success:false,
              message:'No user id found'
            })
        }
        const existingUser=await User.findById(userId).select("+password");
        if (!existingUser) {
          return res.status(404).json({
             success:false,
             message:'No user found, Invalid userId'
          })
        }
    //   2)  CHECK IF THE SUPPLIED CURRENT PASSWORD IS CORRECT
        if(!(await existingUser.isPasswordCorrect(validatedSchema.currentPassword))) {
          return res.status(401).json({
             success:false,
             message:"Current password not equal to user password"
          })
        } 
    //   3) IF SUPPLIED PASSWORD IS CORRECT, UPDATE USER PASSWORD WITH NEW VALUE
          existingUser.password= validatedSchema.newPassword
          await existingUser.save();
          return res.status(200).json({
             success:true,
             message:"User password updated successfully",
          })
    
  } catch (error) {
     const isErrorJoi=error.isJoi===true;
     const statusCode=isErrorJoi ? 422:500;
     const message=isErrorJoi ? error.details[0]?.message : 'Server Error in updating password'
     return res.status(statusCode).json({
         success:false,
         message:message,
         error:error.message
     })
  }
}

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(404).json({
        success: false,
        message: "Id is required to update user",
      });
    }
    const isAdmin=req.user.role==='admin';
    const isOwnProfile=req.user._id.equals(id);
    if (!isAdmin && !isOwnProfile) {
      return res.status(403).json({ success: false, message: "Forbidden: You can only update your own profile." });
    }
    let updatedUser;
      updatedUser = await User.findByIdAndUpdate(id, req.body, {
        new: true,
      }).select("-password");
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "Invalid user Id can't update user",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while updating user.",
      error: error.message,
    });
  }
};

exports.editProfileImage = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Id is required to edit user profileImage",
      });
    }
    // if user is not admin and they are trying to update their own profile
    const isAdmin=user.role==='admin'
    const isOwnProfile=user._id.equals(id);
    if (!isAdmin && !isOwnProfile) {
      return res.status(403).json({ success: false, message: "Forbidden: You do not have permission to update this profile." });
    }
    let profileImageLocalPath;
    if (req.files?.profileImage && req.files.profileImage.length > 0) { 
      profileImageLocalPath = req.files.profileImage[0].path;
    }
    if (!profileImageLocalPath) {
       return res.status(400).json({
          success:false,
          message:'No profileimage provided to update user profile'
       })
    }
    
    // returns an object with property profileImage
    const oldUserProfileImage = await User.findOne({ _id: id }).select('profileImage').lean();
    if (!oldUserProfileImage) {
      return res.status(404).json({
        success: false,
        message: 'Invalid user id,User not found',
      })
    }
    const oldImageUrl=oldUserProfileImage.profileImage
    // add the new image to cloudinary before deleting old
    const newProfileImageName = uuidv4();
    const newProfileImage = await fileUpload(
      profileImageLocalPath,
      newProfileImageName,
      "auto"
    );
    if (!newProfileImage) {
      return res.status(400).json({
        success: false,
        message: "Error in updating user profile, as no profileImage found",
      });
    }
    // updating the user with new profileImage
    const updateUserProfile = await User.findByIdAndUpdate(
      id,
      {
        profileImage: newProfileImage.secure_url
      },
      {
        new: true
      }
    ).select('-password');
    if (!updateUserProfile) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id, profileImage cannot be updated",
      });
    }
    // Delete the old profileImage from cloudinary
    // **->Cleaning->removing the old profile image from cloudinary if exists
    if (oldImageUrl  && oldImageUrl.length > 0) {
      //  extracting the public Id of previousImage if exists  -> and deleting the user old image
      try {
        const publicId = await extractImagePublicId(oldImageUrl);
        // console.log(publicId);
        if (publicId) {
          const deletedImage = await cloudinary.uploader.destroy(publicId);
          // console.log('Image deleted successfully from cloudinary, Response: ', deletedImage.result);
        }
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error.message);
      }
    }
    return res.status(200).json({
      success: true,
      message: 'User profile Image updated successfully',
      data: updateUserProfile
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message,
    });
  }
}

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(404).json({
        success: false,
        message: "Id is required to update user",
      });
    }
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "Invalid user Id can't delete user",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: deletedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while deleting user.",
      error: error.message,
    });
  }
};
