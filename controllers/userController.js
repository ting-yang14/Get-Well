import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../model/userModel.js";
import { s3Controller } from "./s3Controller.js";
import { cloudfrontHandler } from "../public/js/cloudfront.js";

dotenv.config();

function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
}

export const userController = {
  // @desc   User register
  // @route  POST /api/user
  // @access Public
  registerUser: asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      res.status(400);
      throw new Error("請填入所有欄位");
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("此信箱已註冊");
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    if (user) {
      res.status(201).json({
        success: true,
      });
    } else {
      res.status(400);
      throw new Error("註冊資料格式錯誤");
    }
  }),

  // @desc   User log in
  // @route  POST /api/user/login
  // @access Public
  loginUser: asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error("請填入所有欄位");
    }
    const user = await User.findOne({ email });
    if (user === null) {
      res.status(400);
      throw new Error("查無使用者，請註冊");
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (user && isValid) {
      res.status(200).json({
        success: true,
        data: {
          _id: user.id,
          username: user.username,
          email: user.email,
          token: "Bearer " + generateToken(user._id),
        },
      });
    } else {
      res.status(400);
      throw new Error("密碼錯誤");
    }
  }),
  // @desc   Update user
  // @route  PATCH /api/user/:userId
  // @access Private
  updateUser: asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId);
    if (!user) {
      res.status(400);
      throw new Error("查無此使用者");
    }
    if (req.user !== user._id.toString()) {
      res.status(401);
      throw new Error("User not authorized");
    }
    // delete previous avatar if update new avatar
    if (req.body.avatarFileName && user.avatarFileName) {
      await s3Controller.deleteFile(user.avatarFileName);
      await cloudfrontHandler.createCloudfrontInvalid(user.avatarFileName);
    }
    await User.findByIdAndUpdate(req.params.userId, req.body, {
      new: true,
    });
    res.status(200).json({ success: true });
  }),
  // @desc   Get user info
  // @route  GET /api/user/me
  // @access Private
  getMe: asyncHandler(async (req, res) => {
    const projection = { password: 0, createdAt: 0, updatedAt: 0, __v: 0 };
    const user = await User.findById(req.user, projection);
    if (user.avatarFileName) {
      try {
        const avatarUrl = await cloudfrontHandler.generateCloudfrontSignedUrl(
          user.avatarFileName
        );
        res.status(200).json({ success: true, data: { user, avatarUrl } });
      } catch (error) {
        console.log(error);
        res
          .status(200)
          .json({ success: true, data: { user: user, avatarUrl: null } });
      }
    } else {
      res
        .status(200)
        .json({ success: true, data: { user: user, avatarUrl: null } });
    }
  }),
};
