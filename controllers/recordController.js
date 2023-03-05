import asyncHandler from "express-async-handler";
import { Record } from "../model/recordModel.js";
import { User } from "../model/userModel.js";
import { cloudfrontHandler } from "../public/js/cloudfront.js";
import { s3Handler } from "../public/js/s3.js";
// import { generateFileName } from "../public/js/utils.js";

export const recordController = {
  // @desc   Get records
  // @route  GET /api/records?time=yyyy-m-dd
  // @route  GET /api/records?keyword=keyword&page=n
  // @access Private
  getRecords: asyncHandler(async (req, res) => {
    const user = await User.findById(req.user);
    // Check for user
    if (!user) {
      res.status(400);
      throw new Error("查無此使用者");
    }
    // Make sure the logged in user matches the record user
    if (req.user !== user._id.toString()) {
      res.status(401);
      throw new Error("使用者未授權");
    }
    // check for query
    if (!req.query.time && !req.query.keyword && !req.query.page) {
      res.status(400);
      throw new Error("請使用關鍵字搜尋");
    }
    if (req.query.time) {
      const timeUnit = req.query.time.split("-");
      if (timeUnit.length === 3) {
        // record for a date
        const year = parseInt(timeUnit[0]);
        const month = parseInt(timeUnit[1]);
        const date = parseInt(timeUnit[2]);
        const startOfDate = new Date(year, month, date);
        const endOfDate = new Date(year, month, date + 1);
        const records = await Record.find(
          {
            user: req.user,
            createdAt: {
              $gte: startOfDate,
              $lt: endOfDate,
            },
          },
          {
            _id: 1,
            exerciseName: 1,
            exerciseCounts: 1,
            "exerciseRecord.startTime": 1,
            "exerciseRecord.endTime": 1,
            createdAt: 1,
          }
        ).sort({ createdAt: -1 });
        res
          .status(200)
          .json({ success: true, data: { records: records, nextPage: null } });
      } else if (timeUnit.length === 2) {
        // record for a month
        const year = parseInt(timeUnit[0]);
        const month = parseInt(timeUnit[1]);
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 1);
        const records = await Record.find(
          {
            user: req.user,
            createdAt: {
              $gte: startOfMonth,
              $lt: endOfMonth,
            },
          },
          {
            _id: 1,
            exerciseName: 1,
            exerciseCounts: 1,
            "exerciseRecord.startTime": 1,
            "exerciseRecord.endTime": 1,
            createdAt: 1,
          }
        );
        res
          .status(200)
          .json({ success: true, data: { records: records, nextPage: null } });
      } else {
        res.status(400);
        throw new Error("時間格式不符合");
      }
    }

    if (req.query.keyword && req.query.page) {
      const page = parseInt(req.query.page);
      const records = await Record.find(
        {
          user: req.user,
          exerciseName: {
            $regex: new RegExp(req.query.keyword),
          },
        },
        {
          _id: 1,
          exerciseName: 1,
          exerciseCounts: 1,
          "exerciseRecord.startTime": 1,
          "exerciseRecord.endTime": 1,
          createdAt: 1,
        }
      )
        .sort({ createdAt: -1 })
        .skip(2 * page)
        .limit(3);
      if (records.length === 3) {
        res.status(200).json({
          success: true,
          data: { records: records.slice(0, 2), nextPage: page + 1 },
        });
      } else {
        res.status(200).json({
          success: true,
          data: { records: records, nextPage: null },
        });
      }
    }
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
      res.status(201).json({ success: true });
    } else {
      throw new Error("紀錄儲存失敗");
    }
  }),
  // @desc   Get record
  // @route  GET /api/record/:recordId
  // @access Private
  getRecord: asyncHandler(async (req, res) => {
    const user = await User.findById(req.user);
    // Check for user
    if (!user) {
      res.status(400);
      throw new Error("查無此使用者");
    }
    // Make sure the logged in user matches the record user
    if (req.user !== user._id.toString()) {
      res.status(401);
      throw new Error("使用者未授權");
    }
    const record = await Record.findById(req.params.recordId);
    if (!record) {
      res.status(400);
      throw new Error("查無此紀錄");
    }
    const recordUrl = await cloudfrontHandler.generateCloudfrontSignedUrl(
      record.videoFileName
    );
    res.status(200).json({ success: true, data: { record, recordUrl } });
  }),
  // @desc   Update record
  // @route  PATCH /api/record/:recordId
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
      res.status(400);
      throw new Error("查無此使用者");
    }
    // Make sure the logged in user matches the record user
    if (record.user.toString() !== user._id.toString()) {
      res.status(401);
      throw new Error("User not authorized");
    }
    const updatedRecord = await Record.findByIdAndUpdate(
      req.params.recordId,
      req.body,
      { new: true }
    );
    if (updatedRecord) {
      res.status(200).json({ success: true });
    }
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
    if (record.user.toString() !== user._id.toString()) {
      res.status(401);
      throw new Error("使用者未授權");
    }
    try {
      await s3Handler.deleteFile(record.videoFileName);
      await cloudfrontHandler.createCloudfrontInvalid(record.videoFileName);
      await record.remove();
      res.status(200).json({ success: true });
    } catch (error) {
      console.log(error);
      res.status(400);
      throw new Error("刪除失敗");
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
};
