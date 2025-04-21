const multer=require('multer')
const path=require('path')
// disk storage
const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./public/temp')
    },
    filename:function(req,file,cb){
        // creating a unique fileName
        const uniqueSuffix=Date.now()+'-'+Math.round(Math.random * 1E9)
        cb(null,file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname) );
    } 
})
const filterFile=(req,file,cb)=>{
    const allowedMimeTypes=['image/jpg','image/jpeg','image/webp','image/png'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        // accept the file
        cb(null,true);
    }else{
        cb(new Error('Invalid file type. Only JPEG, PNG, or GIF are allowed.'), false)
    }
}
const upload=multer(
    {
        storage:storage,
        limits:{
            fileSize:5 * 1024 * 1024,  //file size set to 5 mb
        },
        fileFilter:filterFile, // checking for allowed file types
        
    })
module.exports=upload;