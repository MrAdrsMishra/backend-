import { Schema, model } from "mongoose";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
const userSchema =new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    avatar: {
      type: String, // cloudnary service
      required: true,
    },
    coverImage: {
      type: String,
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "video",
      },
    ],
    password: {
      type: String,
      required: [true, "password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
// moddle ware for password encrypting
userSchema.pre("save", async function (next){
  // if not modified 
  if(!this.isModified("password"))return next();

  // if ask to modified
  this.password =await bcrypt.hash(this.password,10)
  next()
})

// for check the provided and stored password
userSchema.methods.isPasswordCorrecct = async function (password){
  return await bcrypt.compare(password,this.password)
}
// generate acccess token
userSchema.methods.generateAccessToken = function (){
  return jwt.sign(
    {
      _id:this.id,
      username:this.username,
      email:this.email,
      fullName:this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
  ) 
}
// generate refresh token
userSchema.methods.generateRefreshToken = function (){
  return jwt.sign(
    {
      _id:this.id,
      
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
  ) 
}
export const User = model("User",userSchema);
