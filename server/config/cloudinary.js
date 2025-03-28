const cloiudinary=require('cloudinary').v2
require('dotenv').config()

exports.cloiudinaryConnect=async()=>{
    try {
        cloiudinary.config({
            cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
            api_key:process.env.CLOUDINARY_API_KEY,
            api_secret:process.env.CLOUDINARY_SECRET
         })
         console.log("Cloudinary connection successful"); 
    } catch (error) {
        console.error("Error in connection: ",error.message);
    } 
    
}


// CLOUDINARY_SECRET=IO7Hi4IgKnG-Hct_9j52m7wyZv4
// CLOUDINARY_API_KEY=188944766649131
// CLOUDINARY_NAME=dbfnk0peb