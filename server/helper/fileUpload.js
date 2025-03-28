const cloudinary=require('cloudinary').v2
require('dotenv').config()
const fs=require('fs');
const {removeLocalFile}=require('../helper/remove_localFile') 
exports.fileUpload=async (localFilePath,name,quality="auto")=>{
    try {
    const options={}
    options.public_id=name
    if (quality) {
        options.quality=quality
    }
    options.resource_type='auto'
    options.overwrite=true
    options.folder=process.env.FOLDER_NAME || "Task_Management_App"
    const response= await cloudinary.uploader.upload(localFilePath,options);
    // removing file locally once uploaded
    removeLocalFile(localFilePath);
    return response
    } catch (error) {
        // removing file locally if file upload fail to cloudinary
        removeLocalFile(localFilePath); 
        console.error('Error in uploading image to cloudinary: ',error.message);
    }
}