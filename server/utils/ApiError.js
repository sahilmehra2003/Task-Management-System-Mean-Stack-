class ApiError extends Error{
    constructor(statusCode,error=[],message="Something went wrong!",stack=""){
           super(message);
           this.statusCode=statusCode;
           this.error=error;
           this.data=null;
           this.message=message;
           this.success=false;
           if (stack) {
             this.stack=stack;
           }else{
             Error.captureStackTrace(this,this.constructor)
           }
    }
}
module.exports=ApiError;