// promisses handler
const asyncHandler =(requestHandler) =>{
    (req,res,next) =>{
        Promise.resolve(requestHandler(req,res,next))
        .catch((error) => next(error))
    }
}

export {asyncHandler}

// Try catching errors in async functions

// const asyncHandler = () =>{}
// const asyncHandler = (func) =>() =>{}

// const asyncHandler = (func) => async (req, res, next)
// =>{
//     try{
//         await func(req, res, next)
//     }catch(error){
//         res.status(error.code || 500).json({
//             sucess: false,
//             message:error.message
//         })
//     }
// } 
