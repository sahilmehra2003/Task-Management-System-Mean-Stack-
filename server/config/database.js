const mongoose=require('mongoose')
require('dotenv').config();
const mongodbUrl=process.env.MONGODB_URL


exports.dbConnect=()=>{
    mongoose.connect(mongodbUrl)
        .then(()=>console.log("Mongodb connection successfull"))
        .catch((err)=>{
            console.error(err.message);
                process.exit(1); 
        })
               
    
}