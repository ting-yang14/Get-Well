import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import { User } from "../model/userModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { s3Handler } from "../public/js/s3.js";
import { cloudfrontHandler } from "../public/js/cloudfront.js";
import { userSchemas } from "../config/joi.js";
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
    // const requestBody = userSchemas.register.validate(req.body);

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
  // @desc   Update record
  // @route  PUT /api/record/:userId
  // @access Private
  updateUser: asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId);
    // Check for user
    if (!user) {
      res.status(401);
      throw new Error("查無此使用者");
    }
    // Make sure the logged in user matches the record user
    if (req.user !== user._id.toString()) {
      res.status(401);
      throw new Error("User not authorized");
    }
    // 若有舊的大頭貼，要刪除
    if (req.body.avatarFileName && user.avatarFileName) {
      const s3Response = await s3Handler.deleteFile(user.avatarFileName);
      console.log("s3Response for delete avatar:", s3Response);
      const cfResponse = await cloudfrontHandler.createCloudfrontInvalid(
        user.avatarFileName
      );
      console.log("cfResponse for delete avatar:", cfResponse);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      req.body,
      {
        new: true,
      }
    );
    console.log(`User ${req.user} :modify user`);
    res
      .status(200)
      .json({ success: true, data: { recordId: req.params.userId } });
  }),
  // @desc   Get user info
  // @route  GET /api/user/me
  // @access Private
  getMe: asyncHandler(async (req, res) => {
    // const { _id, username, email } = await User.findById(req.user.id);
    const projection = { password: 0, createdAt: 0, updatedAt: 0, __v: 0 };
    const user = await User.findById(req.user, projection);
    if (user.avatarFileName) {
      try {
        const avatarUrl = await s3Handler.getObjectSignedUrl(
          user.avatarFileName
        );
        console.log("getme", { user, avatarUrl });
        res.status(200).json({ success: true, data: { user, avatarUrl } });
      } catch (error) {
        console.log(error);
        console.log("getme", { user: user, avatarUrl: null });
        res
          .status(200)
          .json({ success: true, data: { user: user, avatarUrl: null } });
      }
    } else {
      console.log("getme", { user: user, avatarUrl: null });
      res
        .status(200)
        .json({ success: true, data: { user: user, avatarUrl: null } });
    }
    // console.log("getme", user);
    // res.status(200).json({ id: _id, username, email });
    // res.status(200).json({ success: true, data: user });
  }),
};
