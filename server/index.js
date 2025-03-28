const express=require('express');
const app=express();
const Port=process.env.PORT || 3002;
var cookieParser = require('cookie-parser')
const cors=require('cors');
const userRoutes=require('./routes/user.routes');
const notification_routes=require('./routes/notification.routes');
const todoroutes=require('./routes/todo.routes');
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
app.use('/api/v1/user',userRoutes);
app.use('/api/v1/notification',notification_routes);
app.use('/api/v1/todo',todoroutes);


app.listen(Port,()=>{
    console.log(`Server starting at port ${Port}`);
})

app.get('/',(req,res)=>{
    res.send(`<h1>Welcome to todo app</h1>`);
})
