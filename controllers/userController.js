import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import { User } from "../model/userModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

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
    //check user exist
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("此信箱已註冊");
    }
    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    //create User
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    console.log(user);
    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user.id,
          username: user.username,
          email: user.email,
        },
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
    // check for user email
    const user = await User.findOne({ email });
    console.log(user);
    if (user === null) {
      res.status(400);
      throw new Error("查無使用者，請註冊");
    }
    const isValid = await bcrypt.compare(password, user.password);
    // console.log(isValid);
    if (user && isValid) {
      res.json({
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

  // @desc   Get user info
  // @route  GET /api/user/me
  // @access Private
  getMe: asyncHandler(async (req, res) => {
    // const { _id, username, email } = await User.findById(req.user.id);
    const projection = { password: 0, createdAt: 0, updatedAt: 0, __v: 0 };
    const user = await User.findById(req.user, projection);
    console.log("getme", user);
    // res.status(200).json({ id: _id, username, email });
    res.status(200).json({ success: true, data: user });
  }),
};
