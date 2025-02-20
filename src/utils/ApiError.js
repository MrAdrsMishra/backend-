class ApiError extends Error{
    constructor(statusCode,message="somthing went wrong",errors=[],statck=""){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.success = false
        this.messag = message
        this.errors = errors
        if(statck){
            this.stack = statck
        }
        else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}
export {ApiError}