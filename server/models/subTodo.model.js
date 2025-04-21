const { required } = require('joi');
const {model,Schema, Model}=require('mongoose');

const subTodoSchema=new Schema(
    {
        title: {
          type: String,
          required: true,
        },
        summary: {
          type: String,
          required: true,
        },
        dueDate: {
          type: Date,
          default: Date.now,
        },
        parentTodo:{
            type:Schema.Types.ObjectId,
            ref:'Todo',
            required:true,
            index:true,
        },
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        members: [
          {
            type: Schema.Types.ObjectId,
            ref: 'User',
          },
        ],
        isCompleted:{ 
            type:Boolean,
            default:false
        },
        Comments: [
          {
            createdBy: {
              type: Schema.Types.ObjectId,
              ref: 'User', // can also get from logged in user._id so need to required:true
              required:true,
            },
            commentText: {
              type: String,
              required:true
            },
            isDeleted: {
              type: Boolean,
              default: false,
            },
            isAdminComment: {
              type: Boolean,
              default: false,
            },
            mentions: [
              {
                type: Schema.Types.ObjectId,
                ref: 'User',
              },
            ],
          },
        ],
      
},{timeseries:true})

const SubTodo=model('SubTodo',subTodoSchema);
module.exports=SubTodo;