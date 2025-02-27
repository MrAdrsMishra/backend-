import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
// for checking the authorization we must have access of user details but at the time of logout we donot provide the information so we have to extract it from the cookies and check.
// this function returns the user info using acessToken stored in cookies 
const verifyJwt = asyncHandler(async (req, res, next) => {
  try {
    // getting token from cookies stored in local storage
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")

    if(!token){
        throw new ApiError(401,"Unauthorized access")
    }
    // for decoding the token we have the right access_token_secret key after that we get the accessToken 
    const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    // accessToken containes the id and other information we search user by this id
    const user = User.findById(decodedToken?._id).select("-password -refreshToken")

    if(!user){
      throw new ApiError(401,"Invalid access token")
    }
    // and now returns the user information 
    res.user = user
    next()
  } catch (error) {
    throw new ApiError(401,error.message || "Invalid user access")
  }
});
export {verifyJwt}
