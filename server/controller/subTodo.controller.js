const SubTodo=require('../models/subTodo.model');
const Todo = require('../models/todo.model');
const {validationSchemaForTodo, validateCommentSchema}=require('../helper/validation_schema')
const mongoose=require('mongoose');
const e = require('express');
exports.createSubTodo = async (req, res) => {
    try {
        const schema = validationSchemaForTodo(['title', 'summary', 'dueDate', 'parentTodo'],false);
        const validatedBody = await schema.validateAsync(req.body);
        const { title, summary, dueDate, parentTodo: parentTodoId } = validatedBody; 
        const user = req.user;
        const userId = user?._id;
        if (!userId) {
            return res.status(401).json({ 
                success: false,
                message: 'User not authenticated.'
            });
        }

        //  Find parent Todo
        if (!mongoose.Types.ObjectId.isValid(parentTodoId)) {
             return res.status(400).json({ success: false, message: 'Invalid Parent Todo ID format.' });
        }
        const parentTodoDoc = await Todo.findById(parentTodoId);
        if (!parentTodoDoc) {
            return res.status(404).json({
                success: false,
                message: 'Parent Todo not found.'
            });
        }

        const isOwner = parentTodoDoc.userId.equals(userId); 
        const isAdmin = user.role === 'admin';
 
        if (isAdmin || isOwner) {
            const newSubTodo = await SubTodo.create({
                title: title,
                summary: summary,
                dueDate: dueDate,
                parentTodo: parentTodoId, 
                userId: userId,     
            });

            if (!newSubTodo) {
                // Use 500 as this indicates a server/database issue
                return res.status(500).json({
                    success: false,
                    message: 'Error creating new subTodo in database.'
                });
            }
            try {
                const updatedParent = await Todo.findByIdAndUpdate(
                    parentTodoId,
                    {
                        $push: { subTodos: newSubTodo._id }
                    },
                    { new: true } 
                );
                if (!updatedParent) {
                     console.error(`Parent Todo ${parentTodoId} disappeared during update for SubTodo ${newSubTodo._id}`);
                      // deleting the  sub-todo with no parentTodo
                     await SubTodo.findByIdAndDelete(newSubTodo._id);
                     return res.status(500).json({ success: false, message: 'Failed to link SubTodo to parent.' });
                }
            } catch (parentUpdateError) {
                 console.error(`Error updating Parent Todo ${parentTodoId} for SubTodo ${newSubTodo._id}:`, parentUpdateError);
                 await SubTodo.findByIdAndDelete(newSubTodo._id);
                 return res.status(500).json({ success: false, message: 'SubTodo created but failed to link to parent. SubTodo deleted.' });
            }

            return res.status(201).json({ 
                success: true,
                message: "New subTodo created successfully",
                data: newSubTodo
            });

        } else {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: You do not have permission to add a sub-todo to this todo.'
            });
        }

    } catch (error) {
        const isJoiError = error.isJoi === true;
        const errorMessage = isJoiError ? error.details[0]?.message : 'Server error while creating subTodo';
        const statusCode = isJoiError ? 422 : 500;

        console.error("Error in createSubTodo:", error);

        return res.status(statusCode).json({
            success: false,
            message: errorMessage,
            error:error.message,
        });
    }
}
exports.fetchAllSubTodos=async(req,res)=>{
    try {
        const user=req.user;
        const {id}=req.params;
        if (!user) {
           return res.status(400).json({
               success:false,
               message:'UserId not found,to fetch todo',
           })
        }
        const validTodo=await Todo.findById(id).lean();
       // const isOwner=user._id===validTodo.userId; instead of this use .equals() or toString()
        const isOwner=validTodo.userId.toString()===user._id.toString();
        // const isMember=validTodo.members.some(memberId=>memberId===user._id); // MEMBER CAN ONLY SEE SUBTODO IN WHICH HE IS ADDED As Owner or member
        const isAdmin=user.role==='admin';


        if (!validTodo) {
           return res.status(404).json({
               success:false,
               message:"Invalid todo Id can't fetch Subtodos"
           })
        }
        if (isAdmin || isOwner) {
             const fetchAllSubTodos=await SubTodo.find({parentTodo:validTodo._id})
                                                 .populate([
                                                    {
                                                      path:'userId',
                                                      select:'_id name'   
                                                    },
                                                    {
                                                       path:'members',
                                                       select:'_id name'
                                                    }
                                                 ])
             return res.status(200).json({
                success:true,
                message:'subTodos fetched successfully',
                data:fetchAllSubTodos
             })
             }else {
                return res.status(403).json({ success: false, message: 'Forbidden: You do not have permission to view these sub-todos.' });
             }
             
        }catch (error) {
            return res.status(500).json({
              success:false,
              message:'Server error while fetching subTodos',
              error:error.message
        })
    }
    
}

exports.fetchSubTodoByUserId=async(req,res)=>{
    try {
        const {id}=req.params // PARENT Id to fetch subTodo
        const user=req.user
        if (!id || !user) {
            return res.status(400).json({
                success:false,
                message:'subTodo id or user not found'
            })
        }
        const checkParentTodo=await Todo.findById(id).lean();
        if (!checkParentTodo) {
            return res.status(404).json({
                success:false,
                message:'Invalid Todo Id'
            })
        }

        const fetchedSubTodo=await SubTodo.find({
            parentTodo:checkParentTodo._id,
            $or:[
                {
                    userId:user._id
                },
                {
                    members:user._id
                }
            ]
        }).populate([
            {
              path:'userId',
              select:'_id name'   
            },
            {
               path:'members',
               select:'_id name'
            },
            {
                path:'Comments.createdBy',
                select:'_id name'
            },
            {
                path:'Comments.mentions',
                select:'_id name'
            }
         ])
         return res.status(200).json({
            success:true,
            message:'SubTodo fetched successfully',
            data:fetchedSubTodo
         })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:'Server error while fetching subTodo',
            error:error.message
      })
    }
}

exports.updateSubTodo=async(req,res)=>{
    try {
        const {id}=req.params;
        const user=req.user;
        if (!id) {
            return res.status(400).json({
                success:false,
                message:'SubTodo id not found'
            })
        }
        const subTodoToUpdate=await SubTodo.findById(id).lean();
        if (!subTodoToUpdate) {
            return res.status(401).json({success:false,message:'Invalid subTodoId SubTodo not found'});
        }
        const parentTodoId=subTodoToUpdate.parentTodo;
        const ParentTodo=await Todo.findById(parentTodoId);
        if (!ParentTodo) {
            return res.status(404).json({
                success:false,
                message:'Parent Todo not Found'
            })
        }
        const isOwner=subTodoToUpdate.userId.equals(user._id);
        const isAdmin=user.role==='admin'
        let updatedSubTodo
        if(isAdmin || isOwner){
            // Create a schema where relevant fields are optional
            const ownerAdminUpdateSchema = validationSchemaForTodo(['title', 'summary', 'dueDate', 'isCompleted', 'members'],true)
            const validationResult=await ownerAdminUpdateSchema.validateAsync(req.body);
            if (validationResult.error) {
                return res.status(422).json({ success: false, message: validationResult.error.details[0].message });
            }
            const dataToUpdate={...validationResult} // creating a copy
            delete dataToUpdate.parentTodo; // Prevent changing the parentTodoId
            delete dataToUpdate.userId; // Prevent changing the original creator/owner ID
            delete dataToUpdate.createdAt;
          updatedSubTodo= await SubTodo.findByIdAndUpdate(id,dataToUpdate,{new:true});
        }else{
            return res.status(403).json({
                success:false,
                message:"You don't have the permission to update subTodo"
            })
        }
        return res.status(200).json({
            success:true,
            message:'SubTodo updated successfully',
            data:updatedSubTodo
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:'Server error while updating subTodos',
            error:error.message
      })
    }
}
exports.addComments=async(req,res)=>{
    try {
        const {id}=req.params //subTodo Id to add comment
        const user=req.user;
        if (!id || !user) {
            return res.status(400).json({
                success:false,
                message:"Id not found,Can't add comment in subTodo"
            })
        }
        // Joi Validation
        const validatedCommentSchema=await validateCommentSchema.validateAsync(req.body);
           
        
        // checking if subTodo id is present in db
        const subTodoFound=await SubTodo.findById(id).lean();

        
        if (!subTodoFound) {
            return res.status(404).json({
                success:false,
                message:'No subTodo found for given id'
            })
        }

        // authenticating the user before adding comment 
        const isAdmin=user.role;
        const isOwner=subTodoFound.userId.equals(user._id);
        const isMember=subTodoFound.members.some(memberId=>memberId.equals(user._id));
        if (!(isAdmin || isMember || isOwner)) {
             return res.status(403).json({
                success:false,
                message:"Forbidden:You don't have the permission to add comment"
             })
        }
          // creating new Comment using validated CommentSchema
        const newComment={
            createdBy:validatedCommentSchema.createdBy,
            commentText:validatedCommentSchema.commentText,
            isAdminComment:user.role==='admin',
            mentions:validatedCommentSchema.mentions || [],
        }   
        const updatedSubTodo=await SubTodo.findByIdAndUpdate(
            id,
            {
                $push:{
                   Comments:newComment,
                }
            },
            {
                new:true
            }
        )
        return res.status(201).json({
            success:true,
            message:'Comment added to subTodo successfully',
            data:updatedSubTodo
        })

    } catch (error) {
        const isErrorJoi=error.isJoi===true
        const statusCode=isErrorJoi ? 422 : 500;
        const errorMessage=isErrorJoi ? error.details[0]?.message : 'Server error while adding comment to SubTodo'
        return res.status(statusCode).json({
                success:false,
                message:errorMessage,
                error:error.message
        }) 
    }
}
exports.deleteSubTodo=async(req,res)=>{
    try {
        const user=req.user
        const {id}=req.params;
        if (!id) {
           return res.status(400).json({
            success:false,
            message:'No id found to dlete subTodo'
           }) 
        }

         const subTodoToDelete = await SubTodo.findById(id).lean();
         if (!subTodoToDelete) {
             return res.status(404).json({ success: false, message: 'SubTodo not found.' });
         }
 
         //  Get Parent ID and find Parent Todo
         const parentTodoId = subTodoToDelete.parentTodo;
         const parentTodo = await Todo.findById(parentTodoId);
         if (!parentTodo) {
             console.error(`Parent Todo ${parentTodoId} not found for SubTodo ${id}`);
             return res.status(500).json({ success: false, message: 'Parent Todo not found.' });
         }
        // check for permission Only Owner can delete subTodo
        const isOwner=parentTodo.userId.equals(user._id)
        if (!isOwner) {
            return res.status(403).json({
                success:false,
                message:'Only owner of Todo has permission to delete SubTodo'
            })
        }
        const deletedSubTodo=await SubTodo.findByIdAndDelete(id);
        if (!deletedSubTodo) {
            return res.status(404).json({
                success:false,
                message:'Error in deleting subTodo'
            })
        }
        // remove the subTodo Id from parent Todo
        await Todo.findByIdAndUpdate(parentTodo._id,{
            $pull:{
                subTodos:deletedSubTodo._id
            }
        })
        return res.status(200).json({
            success:true,
            message:'SubTodo deleted successfully',
            data:deletedSubTodo
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:'Server error while deleting subTodos',
            error:error.message
      })
    }
}


