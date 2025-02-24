///use either this try catch method or above promise methode
const asyncHandler =  (RequestHandeler)=>async (req,res,next)=>{
    try {
        await RequestHandeler(req,res,next)
    } catch (error) {
        res.status(error.code || 500).json({
            succes:false,
            message:error.message
        })
    }
}
export { asyncHandler };
