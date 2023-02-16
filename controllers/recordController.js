import asyncHandler from "express-async-handler";
import { Record } from "../model/recordModel.js";
import { User } from "../model/userModel.js";
import { s3Handler } from "../public/js/s3.js";
// import { generateFileName } from "../public/js/utils.js";

export const recordController = {
  // @desc   Get records
  // @route  GET /api/records
  // @access Private
  getRecords: asyncHandler(async (req, res) => {
    const user = await User.findById(req.user);
    console.log("user._id", user._id.toString());
    // Check for user
    if (!user) {
      res.status(401);
      throw new Error("查無此使用者");
    }
    console.log("req.body.userId", req.body.userId);
    // Make sure the logged in user matches the record user
    if (req.body.userId !== user._id.toString()) {
      res.status(401);
      throw new Error("使用者未授權");
    }
    const records = await Record.find({ user: req.user.id });
    res.status(200).json(records);
  }),
  // @desc   Create record
  // @route  POST /api/record
  // @access Private
  createRecordFrontend: asyncHandler(async (req, res) => {
    if (!req.body.exerciseName || !req.body.exerciseCounts) {
      res.status(400);
      throw new Error("請填入動作名稱和次數");
    }
    const record = await Record.create({
      user: req.user,
      exerciseName: req.body.exerciseName,
      exerciseCounts: req.body.exerciseCounts,
      exerciseRecord: req.body.exerciseRecord,
      videoFileName: req.body.videoFileName,
    });
    if (record) {
      res.status(201).json({ success: true, data: record });
    } else {
      throw new Error("紀錄儲存失敗");
    }
  }),
  // @desc   Create record
  // @route  POST /api/record
  // @access Private
  // createRecordMulter: asyncHandler(async (req, res) => {
  //   if (!req.body.exerciseName || !req.body.exerciseCounts) {
  //     res.status(400);
  //     throw new Error("請填入動作名稱和次數");
  //   }
  //   // 產生亂數檔名
  //   const fileName = generateFileName();
  //   // req.user=userId 由 passport jwt 產生
  //   console.log("jwt userId", req.user);
  //   const user = await User.findById(req.body.userId);
  //   console.log("user._id", user._id.toString());
  //   // Check for user
  //   if (!user) {
  //     res.status(401);
  //     throw new Error("查無此使用者");
  //   }
  //   console.log("req.body.userId", req.body.userId);
  //   // Make sure the logged in user matches the record user
  //   if (req.body.userId !== user._id.toString()) {
  //     res.status(401);
  //     throw new Error("使用者未授權");
  //   }
  //   try {
  //     // multer 暫存的檔案在 req.file
  //     const response = await s3Handler.uploadVideo(
  //       req.file.buffer,
  //       fileName,
  //       req.file.mimetype
  //     );
  //     console.log(response.$metadata);
  //     const record = await Record.create({
  //       user: req.body.userId,
  //       exerciseName: req.body.exerciseName,
  //       exerciseCounts: req.body.exerciseCounts,
  //       exerciseRecord: JSON.parse(req.body.record),
  //       videoFileName: fileName,
  //     });
  //     console.log(record);
  //     if (record) {
  //       res.status(201).json({ success: true, data: record });
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     res.status(400);
  //     throw new Error(error);
  //   }
  // }),
  getPutObjectSignedUrl: asyncHandler(async (req, res) => {
    const { url, fileName } = await s3Handler.putObjectSignedUrl();
    // console.log(url);

    if (!url || !fileName) {
      throw new Error("無法連結S3");
    } else {
      res.status(200).json({ url, fileName });
    }
  }),
  // @desc   Get record
  // @route  GET /api/record/:recordId
  // @access Private
  getRecord: asyncHandler(async (req, res) => {
    // const user = await User.findById(req.user);
    // console.log("user._id", user._id.toString());
    // // Check for user
    // if (!user) {
    //   res.status(401);
    //   throw new Error("查無此使用者");
    // }
    // console.log("req.body.userId", req.body.userId);
    // // Make sure the logged in user matches the record user
    // if (req.body.userId !== user._id.toString()) {
    //   res.status(401);
    //   throw new Error("使用者未授權");
    // }
    const record = await Record.findById(req.params.recordId);
    if (!record) {
      res.status(400);
      throw new Error("查無此紀錄");
    }
    const recordUrl = await s3Handler.getObjectSignedUrl(record.videoFileName);
    res.status(200).json({ record, recordUrl });
  }),

  // @desc   Update record
  // @route  PUT /api/record/:recordId
  // @access Private
  updateRecord: asyncHandler(async (req, res) => {
    const record = await Record.findById(req.params.recordId);
    if (!record) {
      res.status(400);
      throw new Error("查無此紀錄");
    }
    const user = await User.findById(req.user);
    // Check for user
    if (!user) {
      res.status(401);
      throw new Error("查無此使用者");
    }

    // Make sure the logged in user matches the record user
    if (req.body.userId !== user._id.toString()) {
      res.status(401);
      throw new Error("User not authorized");
    }

    const updatedRecord = await Record.findByIdAndUpdate(
      req.params.recordId,
      req.body,
      { new: true }
    );
    console.log(`record ${req.params.recordId} :modify record`);
    res.status(200).json(updatedRecord);
  }),

  // @desc   Delete record
  // @route  DELETE /api/record/:recordId
  // @access Private
  deleteRecord: asyncHandler(async (req, res) => {
    const record = await Record.findById(req.params.recordId);
    if (!record) {
      res.status(400);
      throw new Error("查無此資料");
    }
    const user = await User.findById(req.user);
    // Check for user
    if (!user) {
      res.status(401);
      throw new Error("查無此使用者");
    }

    // Make sure the logged in user matches the record user
    if (record.user.toString() !== user.id) {
      res.status(401);
      throw new Error("使用者未授權");
    }
    try {
      await s3Handler.deleteFile(record.videoFilename);
      await record.remove();
      res.status(200).json({ success: true });
    } catch (error) {
      console.log(error);
      res.status(400);
      throw new Error("刪除失敗");
    }
  }),
};
