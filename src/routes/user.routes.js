import { Router } from "express";
import {  changePassword, loginUser, logoutUser, RefreshAccessToken, registerUser, updateUserDetails } from "../controllers/user.controller.js"  //loginUser, logoutUser,
import {upload} from "../middlewares/multer.middleware.js"; 
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    // upload middleware
     upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
     ]),
     registerUser
)
router.route("/login").post(loginUser)
// secured routes
router.route("/logout").post(verifyJwt,logoutUser)
router.route("/refresh_token").post(RefreshAccessToken)
router.route("/change_password").post(changePassword)
router.route("/update_details").post(updateUserDetails)

export default router;

