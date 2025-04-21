
const { required } = require('joi');
const {Schema,model}=require('mongoose');

const todoSchema = new Schema({
    title: {
      type: String,
      required: true,
      trim: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    dueDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required:true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    progress: {
      type: Number,
      default: 0,
    },
    Comments: [
      {
        createdBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required:true,
        },
        commentText: {
          type: String,
          default: 'No comment added yet!',
          required:true,
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
    subTodos: [
      {
        type:Schema.Types.ObjectId,
        ref:'SubTodo'
      }
    ],
  },{timestamps:true});
  
const Todo=model("Todo",todoSchema);
module.exports=Todo;