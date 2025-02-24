import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js"

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

  // check if fields are given or not
  if ([username, email, password, fullName].some(field => !field || field.trim() === "")) {
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
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar file is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "avatar file is required");
  }

  User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImage?.url||"",
    email,
    username,
    password
  })
  const createdUser = await User.findById(User._id).select("-password -refreshToken")

  if(!createdUser){
    throw new ApiError(500,"somthing went wrong while registering the user")
  }

  return res.status(201).json(
    new ApiResponse(200,createdUser,"user registered successfully")
  )
});

export { registerUser };
