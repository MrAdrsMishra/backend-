import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "somthing went wron while generating the access and refresh token"
    );
  }
};
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
  //  console.log("field checked successfully\n")
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
  // console.log("validation checked successfully\n")
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
  // console.log("image feild checked successfully\n")
  // upload on cloudinary using multer
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "avatar file is required");
  }
  // console.log("image uploaded successfully\n")
  // create user
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    username,
    password,
  });
  // console.log(user,"user created successfully\n")
  // remove the password and refres token from user data
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  // console.log(createdUser)
  // check if user creted succefully
  if (!createdUser) {
    throw new ApiError(
      500,
      createdUser,
      "somthing went while registering the user"
    );
  }
  // returns the whole data of the created user
  // console.log(createdUser)
  // console.log("response return process started")
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // get the data
  // check for usrename and email availabel in body
  // find the user
  // access and refresh token
  // send cookie

  // get data
  const { email, username, password } = req.body;

  // check for username and email availabe in body
  if (!(username || email)) {
    throw new ApiError(400, "username or email is required");
  }
  // console.log("username and email in body\n")

  // check for duplicacy in database
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (!user) {
    throw new ApiError(404, "user does not exist");
  }
  // console.log("username and email in database\n")
  if (!password) {
    throw new ApiError(409, "password missmatched");
  }
  // check if password is correct
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }
  // console.log(" password is correct\n ")

  // generaate accesstoken and refreshToken for logged user
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );
  // console.log(" tokens generated\n")
  const loggedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // adding options for preventing the modification on cookie by frontend
  const options = {
    httpOnly: true,
    secure: true,
  };
  // console.log(" returning the response\n ")
  // returning the response
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedUser,
          accessToken,
          refreshToken,
        },
        "user loggedIn Successfull"
      )
    );
});
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "user details recieved "));
});
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", options)
    .cookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out successfully"));
});
const RefreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookie.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized access");
    }

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    if (!decodedToken) {
      throw new ApiError(401, "Unauthorized access");
    }
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh Token");
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token is expired or used");
    }

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);
    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, newRefreshToken },
          "access token granted successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error.message || "invalid refresh token");
  }
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(409, "Both old and new password is necessary");
  }

  // Check if req.user exists first
  if (!req.user?._id) {
    throw new ApiError(401, "Unauthorized - User not authenticated");
  }

  const currentUser = await User.findById(req.user._id);

  // Check if user was found
  if (!currentUser) {
    throw new ApiError(404, "User not found");
  }

  const checkPassword = await currentUser.isPasswordCorrect(oldPassword);
  if (!checkPassword) {
    throw new ApiError(400, "Invalid old password");
  }

  currentUser.password = newPassword;
  await currentUser.save({ validateBeforeSave: false });

  return res
    .status(201)
    .json(new ApiResponse(201, currentUser, "password changed successfully"));
});
const updateUserDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!(fullName || email)) {
    throw new ApiError(404, "invalid details provided");
  }
  console.log(fullName, email);
  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    {
      new: true,
    }
  );
  console.log(updatedUser);
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "user details updated successfully")
    );
});
// needs to be done
const updateFiles = asyncHandler(async (req, res) => {

});
const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username?.trim()) {
    throw new ApiError(400, "username is missing");
  }
  const channel = asyncHandler(async (req, res) => {
    await User.aggregate[
      // match the username where whose profile i want to get 
      ({
        $match: {
          username: username?.toLowerCase(),
        },
      },
      // filter the subscriber details 
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "channel",
          as: "subscribers",
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "subscriber",
          as: "subscribedTo",
        },
      },
      {
        $addFields: {
          subscribersCount: {
            $size: "$subscribers",
          },
          channelSubscribedToCount: {
            $size: "$subscribedTo",
          },
          isSubscribed: {
            $cond: {
              if: {
                $in: [req.user?._id, "$subscribers.subscriber"],
              },
              then: true,
              else: false,
            },
          },
        },
        $project: {
          fullName: 1,
          username: 1,
          subscribersCount: 1,
          channelSubscribedToCount: 1,
          avatar: 1,
          coverImage: 1,
          email: 1,
          isSubscribed: 1,
        },
      }
  )];
  });
  if(!channel?.length){
    throw new ApiError(404,"channel does not exist")
  }
  return res
  .status(200)
  .json(
    new ApiResponse(200,channel[0],"User cahnnel fetched succfully")
  )
});
export {
  registerUser, 
  loginUser,
  logoutUser,
  RefreshAccessToken,
  changePassword,
  updateUserDetails,
  getCurrentUser,
  getUserChannelProfile,
};
