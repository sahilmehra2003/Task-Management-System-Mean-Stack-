const Todo = require('../models/todo.model');
const {sendNotifications}=require('../helper/sendNotifications');
const {validationSchemaForTodo}=require('../helper/validation_schema')
exports.createTodo = async (req, res) => {
    try {
        const { title, summary, dueDate,userId,members=[]} = req.body;
        if (members.length===0) {
            
        }
        const validateSchema=validationSchemaForTodo(['title','summary','dueDate','members','userId'],false);
        await validateSchema.validateAsync(req.body)
        if (userId==='') {
            userId=req.user.id;
        }
        if (!title || !summary || !dueDate) {
            return res.status(400).json({ error: "Fill all the fields while creating new todo" });
        }
        const newTodo = await Todo.create({ 
                                   title, 
                                   summary, 
                                   dueDate, 
                                   userId: userId,
                                   members:members, 
                                });
        if (!newTodo) {
            return res.status(401).json({ error: "Error in creating new todo" });
        }
        const notificationUsers=members?.length ? members:[userId]
        // console.log(notificationUsers)
        if (req.user.role==='admin') {
            await sendNotifications({
                title:`New task assigned by admin`,
                message:`Todo title: ${title}`,
                userIds:notificationUsers
            })
        }
        
        // console.log(newTodo)
        return res.status(200).json({ success: true, data: newTodo, message: "New todo created successfully" });
    } catch (error) {
        const isErrorJoi=error.isJoi;
        const statusCode=isErrorJoi ? 422:500
        const errorMessage=isErrorJoi ? error.details[0]?.message : 'Server error while creating new todo'
        return res.status(statusCode).json({ success:false, error: error.message, message:errorMessage,error:error.message });
    }
};

exports.fetchAllTodos = async (req, res) => {
    try {
        const todos = await Todo.find({}).populate([{
            path:'members',
            select:'_id name'
        },
        {
            path:'userId',
            select:'_id name'
        },
        {
            path:'Comments.createdBy',
            select:'_id name'
        },
        {
            path:'Comments.mentions',
            select:'_id name'
        },
        {
            path:'subTodos.userId',
            select:'_id name'
        },
        {
            path:'subTodos.members',
            select:'_id name'
        }
    ]);
        if (!todos) {
            return res.status(400).json({ error: "Error in fetching todos data" });
        }
        return res.status(200).json({ success: true, data: todos, message: "Todos fetched successfully!" });
    } catch (error) {
        return res.status(500).json({ error: error.message, message: "Server error in fetching todo data" });
    }
};

exports.fetchTodoByUserId = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(404).json({ error: "You need to login to view your todos" });
        }

        const todos = await Todo.find({
            $or: [{userId: userId }, { members: userId }] 
        })
        .populate([{
            path:'members',
            select:'_id name'
        },
        {
            path:'userId',
            select:'_id name'
        },
        {
            path:'Comments.createdBy',
            select:'_id name'
        },
        {
            path:'Comments.mentions',
            select:'_id name'
        },
        {
            path:'subTodos.userId',
            select:'_id name'
        },
        {
            path:'subTodos.members',
            select:'_id name'
        }
    ])
        if (!todos) {
            return res.status(400).json({ error: "Error in getting todos" });
        }

        return res.status(200).json({ success: true, data: todos, message: "Todos fetched successfully for user" });
    } catch (error) {
        return res.status(500).json({ error: error.message, message: "Server error while fetching todos for user" });
    }
};

exports.getTodoByTodoId=async(req,res)=>{
    try {
        const {id}=req.params
        if(!id){
            return res.status(400).json({ error: "You need to todo id to fetch todo by id" }); 
        }
        const fetchedTodo=await Todo.findById(id)
        .populate([{
            path:'members',
            select:'_id name'
        },
        {
            path:'userId',
            select:'_id name'
        },
        {
            path:'Comments.createdBy',
            select:'_id name'
        },
        {
            path:'Comments.mentions',
            select:'_id name'
        },
        {
            path:'subTodos.userId',
            select:'_id name'
        },
        {
            path:'subTodos.members',
            select:'_id name'
        }
    ]) ;
        if (!fetchedTodo) {
            return res.status(401).json({
                success:false,
                message:'Error in fetching todo,Invalid todoId',
            })
        }
        return res.status(200).json({
            success:true,
            message:"todo fetched successfully",
            data:fetchedTodo
        })
    } catch (error) {
        return res.status(500).json({ error: error.message, message: "Server error while fetching todo by Id" });
    }
}
exports.updateTodo = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(404).json({ error: "Id is missing to update todo" });
        }
        const todoToUpdate = await Todo.findById(id).lean();
        if (!todoToUpdate) {
            return res.status(404).json({ success: false, message: "Todo not found" });
       }
        // console.log(req.body);
        
        // if (!updatedTodo) {
        //     return res.status(404).json({ error: "Can't update todo, Todo id is invalid" });
        // }
        const isOwner = todoToUpdate.userId._id.equals(req.user._id) ;
        if (req.user.role !== 'admin' && !isOwner) {
            return res.status(403).json({ success: false, message: "Forbidden: You cannot update this todo." });
       }
    //    update the todo
    // Performing Joi Validation
        const updateSchema=validationSchemaForTodo(['title','summary','dueDate','progress','members','Comments','isCompleted'],true);
        const validatedData= await updateSchema.validateAsync(req.body);
        const updatedData={...validatedData};
        delete updatedData.userId;
        delete updatedData.createdAt;
        const updatedTodo = await Todo.findByIdAndUpdate(id, updatedData, { new: true });
        return res.status(200).json({ success: true, data: updatedTodo, message: "Todo updated successfully" });
    } catch (error) {
        const isErrorJoi=error.isJoi===true;
        const statusCode=isErrorJoi ? 422:500;
        const errorMessage=isErrorJoi ? error.details[0]?.message : 'Server error while updating todo';
        return res.status(statusCode).json({ success:true,message:errorMessage,error: error.message, });
    }
};

exports.deleteTodo = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(404).json({ error: "Todo id not found" });
        }
        const todoToDelete = await Todo.findById(id).lean();
        if (!todoToDelete) {
            return res.status(404).json({ success: false, message: "Todo not found" });
        }
        if (req.user.role !== 'admin' && todoToDelete.userId._id !== req.user.id) {
            return res.status(403).json({ success: false, message: "Forbidden: You cannot delete this todo." });
        }
        // delete the todo
        const deletedTodo = await Todo.findByIdAndDelete(id,{new:true});
        
        if (!deletedTodo) {
            return res.status(401).json({ error: "Please pass a valid todo id" });
        }

        return res.status(200).json({ success: true, data: deletedTodo, message: "Todo deleted successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message, message: "Server error while deleting todo" });
    }
};

