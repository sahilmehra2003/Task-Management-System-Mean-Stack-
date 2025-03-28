const {Schema,model}=require('mongoose');

const todoSchema=new Schema({
    title:{
        type:String,
        required:true,
        trim:true,
    },
    summary:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
    },
    adminComment:{
        type:String,
        maxlength:30,
        trim:true,
        lowercase:true
    },
    dueDate:{
        type:Date,
        required:true,
        default:Date.now
    },
    isCompleted:{
        type:Boolean,
        default:false
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    }
})

const Todo=model("Todo",todoSchema);
module.exports=Todo;