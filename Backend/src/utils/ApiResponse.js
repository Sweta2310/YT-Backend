class ApiResponse{
    constructor (statusCode, message ="", data =null, error =[], success =true){
        this.statusCode = statusCode < 400
        this.message = message
        this.data = data
        this.error = error
        this.success = success
    }
}

export{ApiResponse}