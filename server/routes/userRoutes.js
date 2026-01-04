import express from "express";
import {
  checkAuth,
  login,
  signup,
  updateProfile,
  resetPassword,
  sendResetOtp,
  sendVerifyOtp,
  verifyEmail,
  deleteProfile,
} from "../controllers/userController.js";
import { protectRoute } from "../middleware/auth.js";
const userRouter = express.Router();
userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.put("/update-profile", protectRoute, updateProfile);
userRouter.delete("/delete-profile", protectRoute, deleteProfile);
userRouter.get("/check", protectRoute, checkAuth);
userRouter.post("/send-verify-otp", protectRoute, sendVerifyOtp);
userRouter.post("/verify-account", protectRoute, verifyEmail);
userRouter.post("/send-reset-otp", sendResetOtp);
userRouter.post("/reset-password", resetPassword);
export default userRouter;
