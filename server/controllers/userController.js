import User from "../models/User.js";
import Message from "../models/Message.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";
import transporter from "../lib/nodemailer.js";

export const signup = async (req, res) => {
  const { fullName, email, password, bio } = req.body;
  try {
    if (!fullName || !email || !password || !bio) {
      return res.json({ success: false, message: "Missing Details" });
    }
    const user = await User.findOne({
      email,
    });
    if (user) {
      return res.json({ success: false, message: "Account already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      bio,
    });
    const token = generateToken(newUser._id);
    res.json({
      success: true,
      userData: newUser,
      token,
      message: "Account created successfully",
    });
  } catch (error) {
    console.log("Signup Error:", error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};
//Controller to login a user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = await User.findOne({ email });
    if (!userData) {
      return res.json({ success: false, message: "Invalid credentials" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, userData.password);

    if (!isPasswordCorrect) {
      return res.json({ success: false, message: "Invalid credentials" });
    }
    const token = generateToken(userData._id);
    res.json({
      success: true,
      userData,
      token,
      message: "Login successfully",
    });
  } catch (error) {
    console.log("Login Error:", error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

//Controller to check if user is authenticatd

export const checkAuth = (req, res) => {
  res.json({ success: true, user: req.user });
};

//Controller to update user profile details

export const updateProfile = async (req, res) => {
  try {
    const { profilePic, bio, fullName } = req.body;

    const userId = req.user._id;

    let updatedUser;

    if (!profilePic) {
      updatedUser = await User.findByIdAndUpdate(
        userId,

        { bio, fullName },

        { new: true }
      );
    } else {
      const upload = await cloudinary.uploader.upload(profilePic);

      updatedUser = await User.findByIdAndUpdate(
        userId,

        { profilePic: upload.secure_url, bio, fullName },

        { new: true }
      );
    }

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.log("Update Profile Error:", error.message);

    res.json({ success: false, message: error.message });
  }
};

//Controller to delete user profile details

export const deleteProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res

        .status(404)

        .json({ success: false, message: "User not found" });
    }

    await Message.deleteMany({
      $or: [{ senderId: userId }, { receiverId: userId }],
    });

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,

      message: "Account and all related messages deleted successfully",
    });
  } catch (error) {
    console.error("Delete Profile Error:", error.message);

    res.status(500).json({ success: false, message: error.message });
  }
};

// Send Verification OTP to the user's email

export const sendVerifyOtp = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account alerady verified" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = otp;

    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

    const mailOptions = {
      from: process.env.SENDER_EMAIL,

      to: user.email,

      subject: "Account Verification OTP",

      text: `Your OTP is ${otp}. Verify your account using this OTP`,
    };

    await transporter.sendMail(mailOptions);

    await user.save();

    res.json({ success: true, message: "Verification OTP sent on Email" });
  } catch (error) {
    console.error("Send Verify Otp Error:", error.message);

    return res.json({ success: false, message: error.message });
  }
};

// Verify the email using otp

export const verifyEmail = async (req, res) => {
  const { otp } = req.body;

  const userId = req.user._id;

  if (!userId || !otp) {
    return res.json({ success: false, message: "Missing Details" });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP Expired" });
    }

    user.isAccountVerified = true;

    user.verifyOtp = "";

    user.verifyOtpExpireAt = 0;

    await user.save();

    return res.json({ success: true, message: "Email Verified successfully" });
  } catch (error) {
    console.error("Send Email Error:", error.message);

    return res.json({ success: false, message: error.message });
  }
};

//Send Password Reset OTP

export const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: "Email is required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        success: false,

        message: "User not found",
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtp = otp;

    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,

      to: user.email,

      subject: "Password Reset OTP",

      text: `Your OTP for resetting your password is ${otp}.

    Use this OTP to proceed with resetting your password`,
    };

    await transporter.sendMail(mailOptions);

    return res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    console.error("Send Reset Otp Error:", error.message);

    return res.json({ success: false, message: error.message });
  }
};

//Reset User Password

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.json({
      success: false,

      message: "Email,OTP,and new password are required ",
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP Expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    user.resetOtp = "";

    user.resetOtpExpireAt = 0;

    await user.save();

    res.json({
      success: true,

      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Reset Password Error:", error.message);

    return res.json({ success: false, message: error.message });
  }
};
