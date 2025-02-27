///use either this try catch method or above promise methode
const asyncHandler =  (RequestHandeler)=>async (req,res)=>{
    try {
        return await RequestHandeler(req,res)
    } catch (error) {
        res.status(300).json({
            succes:false,
            message:"asyncHandler"
        })
    }
}
export { asyncHandler };
