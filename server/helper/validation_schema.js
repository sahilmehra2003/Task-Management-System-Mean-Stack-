const Joi=require('joi')


const validationSchemaForUser=(fields)=>{
     const schema={}
     if (fields.includes('name')) {
        schema.name=Joi.string().min(3).lowercase().required()
     }
     if (fields.includes('email')) {
        schema.email=Joi.string().email().lowercase().required()
     }
     if (fields.includes('password')){
        schema.password=Joi.string().min(8)
        .pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*!])[A-Za-z\d@#$%^&*!]{8,}$/))
        .messages({
            "string.pattern.base": `Please follow this pattern to create your password:
            1) At least one lowercase letter
            2) At least one uppercase letter
            3) At least one digit
            4) At least one special character (@#$%^&*!)
            5) Minimum 8 characters required.`
        }).required()
     }
     if (fields.includes('role')) {
         schema.role=Joi.string().valid('admin','user').required()
     }
     if (fields.includes('profileImage')) {
        schema.profileImage=Joi.object({
            mimeType:Joi.string().valid('image/jpg','image/jpeg','image/webp','image/png')
                                .required().messages({
                                    'string.valid':'Only jpeg,jpg,webp & png'
            }),
            size:Joi.number().max(5*1024*1024) // max 5mb
            .required()
            .messages({
                'number.max':"File size shouldn't exceed 5mb"
            }),
            path:Joi.string().required()
        })
     }
     return Joi.object(schema).unknown(true);
}
const validateObjectId=Joi.string().hex().length(24).messages({
    'string.base': `"{{#label}}" should be a type of 'text'`,
    'string.hex': `"{{#label}}" must only contain hexadecimal characters`,
    'string.length': `"{{#label}}" length must be 24 characters long`,
    'any.required': `"{{#label}}" is a required field`
});  // validating objectId from frontend they come as string

const validationSchemaForTodo=(fields,isUpdate)=>{
    const schema={};
    if (isUpdate) {
        if (fields.includes('title')) {
            schema.title=Joi.string().min(3).lowercase().optional()
        }
        if (fields.includes('summary')) {
            schema.summary=Joi.string().min(6).lowercase().optional()
        }
        if (fields.includes('dueDate')) {
            schema.dueDate=Joi.date().min('now').optional() // due date cannot be less than currentdate
        }
    }else{
        if (fields.includes('title')) {
            schema.title=Joi.string().min(3).lowercase().required()
        }
        if (fields.includes('summary')) {
            schema.summary=Joi.string().min(6).lowercase().required()
        }
        if (fields.includes('dueDate')) {
            schema.dueDate=Joi.date().min('now').required() // due date cannot be less than currentdate
        }
    }
    if(fields.includes('parentTodo')){
        schema.parentTodo=validateObjectId.label('parentTodo').optional(); // in the request body they come as string
    }
    if(fields.includes('isCompleted')){
        schema.isCompleted=Joi.boolean().optional();
    }
    if(fields.includes('progress')){
        schema.progress=Joi.number().min(0).optional();
    }
    if(fields.includes('userId')){
        schema.userId=validateObjectId.label('userId').optional();
    }
    if (fields.includes('members')) {
        schema.members=Joi.array().items(validateObjectId.label('memberId')).optional();
    }
    if (fields.includes('subTodos')) {
        schema.subTodos=Joi.array().items(validateObjectId.label('subTodo')).optional();
    }
    return Joi.object(schema);
}

const validateCommentSchema=Joi.object({
  createdBy:validateObjectId.label('Created By').required(), // can get from user._id
                commentText:Joi.string().trim().min(3).required(),
                isDeleted:Joi.boolean().optional(),
                isAdminComment:Joi.boolean().optional(),
                mentions:Joi.array().items(validateObjectId.label('MentionId')).optional()
}).required()

module.exports={
    validationSchemaForUser,
    validationSchemaForTodo,
    validateCommentSchema
}