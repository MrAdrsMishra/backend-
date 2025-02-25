import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens=async (userId)=>{
  try {

    const user = await User.findById(userId)

    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({validateBeforeSave:false})
    return {accessToken,refreshToken}

  } catch (error) {
    throw new ApiError(500,"somthing went wron while generating the access and refresh token")
  }
}
const registerUser = asyncHandler(async (req, res) => {
  // res.status(200).json({
  //     message: "thik hai re o gye",
  // });
  // get user details from frontend
  // validation -  not empty
  // check if user already exist: username, email
  // checl for image and avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token feild from response
  // check for user creation
  // return response
  
  const { fullName, username, email, password } = req.body;
  // console.log(req.body)
  // [Object: null prototype] {
  //   fullName: 'pinki mishra',
  //   username: 'mr pinki ',
  //   email: 'pinki@.com',
  //   password: 'adrsh123'
  // }
  // check if fields are given or not
  if (
    [username, email, password, fullName].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // check for validation
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(
      409,
      "User with provided email or username already exists!!"
    );
  }
  // upload images
  const avatarLocalPath = req.files?.avatar[0]?.path;
  let coverImageLocalPath;
   // check if avatar and coverimages are give and thro error in case of avatar image not present
  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar file is required");
  }
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  // upload on cloudinary using multer
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "avatar file is required");
  }
// create user
  User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    username,
    password,
  });
  // remove the password and refres token from user data
  const createdUser = await User.findOne(User._id).select(
    "-password -refreshToken"
  );

  // check if user creted succefully
  if (createdUser === null) {
    throw new ApiError(
      500,
      createdUser,
      "somthing went while registering the user"
    );
  }
  // returns the whole data of the created user
  // console.log(createdUser)

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user registered successfully"));
});

const loginUser = asyncHandler( async (req,res)=>{
  // get the data
  // check for usrename and email availabel in body
  // find the user
  // access and refresh token
  // send cookie
  const {email,username,password} = req.body

  if(!username || !email){
    throw new ApiError(400,"username or email is required")
  }
  const user = await User.findOne(
    {
      $or:[{email},{username}]
    }
  )
  if(!user){
    throw new ApiError(404,"user does not exist")
  }
  const isPasswordValid = await user.isPasswordCorrect(password)
  if(!isPasswordValid){
    throw new ApiError(401,"Invalid user credentials")
  }
  const {accessToken,refreshToken } =  generateAccessAndRefreshTokens(user._id)

  const loggedUser = User.findById(user._id).select("-password -refreshToken")

  const options={
    httpOnly:true,
    secure:true
  }

  return res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json({
    status:200,
   data: {
      accessToken,
      refreshToken
    },
    message :"user loggedIn Successfull"
  })

})
export { 
  registerUser,
  loginUser
};
