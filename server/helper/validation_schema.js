const Joi=require('joi')


const createValidationSchema=(fields)=>{
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


module.exports={
    createValidationSchema

}