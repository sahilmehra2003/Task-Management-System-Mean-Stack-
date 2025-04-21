const express=require('express');
const app=express();
const Port=process.env.PORT || 3002;
var cookieParser = require('cookie-parser')
const cors=require('cors');
const authRoutes=require('./routes/auth.routes');
const userRoutes=require('./routes/user.routes');
const notificationRoutes=require('./routes/notification.routes');
const todoroutes=require('./routes/todo.routes');
const subtodoRoutes=require('./routes/subTodo.routes');
const cloudinary=require('./config/cloudinary');
// middleware
app.use(cors(
    {
        credentials:true,
    }
));
app.use(cookieParser());
app.use(express.json());
require('dotenv').config()


// database & cloudinary connection
require('./config/database').dbConnect()
cloudinary.cloiudinaryConnect();

// routes
app.use('/api/v1/auth',authRoutes)
app.use('/api/v1/user',userRoutes);
app.use('/api/v1/notification',notificationRoutes);
app.use('/api/v1/todo',todoroutes);
app.use('/api/v1/todo/subtodo',subtodoRoutes);

// multer error handling middleware
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File too large. Maximum size allowed is 5MB.' });
      }
    } else if (err) {
      // Handle errors passed from fileFilter
      if (err.message.startsWith('Invalid file type')) {
           return res.status(400).json({ success: false, message: err.message });
      }
      // Handle other non-Multer errors
      console.error(err.stack);
      return res.status(500).json({ success: false, message: 'An unexpected error occurred.' });
    }
    next();
  });


app.listen(Port,()=>{
    console.log(`Server starting at port ${Port}`);
})

app.get('/',(req,res)=>{
    res.send(`<h1>Welcome to todo app</h1>`);
})
