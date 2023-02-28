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
      res.status(401);
      throw new Error("查無此使用者");
    }
    // Make sure the logged in user matches the record user
    if (req.user !== user._id.toString()) {
      res.status(401);
      throw new Error("使用者未授權");
    }
    // check for query
    if (!req.query.time && !req.query.keyword && !req.query.page) {
      res.status(401);
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
        res.status(200).json({ success: true, data: records });
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
          { createdAt: 1 }
        );
        res.status(200).json({ success: true, data: records });
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
      res.status(201).json({ success: true, data: record });
    } else {
      throw new Error("紀錄儲存失敗");
    }
  }),
  // @desc   get S3 signed put objectUrl
  // @route  GET /api/record/s3Url
  // @access Private
  getPutObjectSignedUrl: asyncHandler(async (req, res) => {
    const { url, fileName } = await s3Handler.putObjectSignedUrl();
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
    console.log(req.user);
    const user = await User.findById(req.user);

    // Check for user
    if (!user) {
      res.status(401);
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
    const recordUrl = await s3Handler.getObjectSignedUrl(record.videoFileName);
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
      res.status(401);
      throw new Error("查無此使用者");
    }
    // Make sure the logged in user matches the record user
    console.log("record user", record.user);
    console.log("user _id", user._id.toString());
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
      console.log(`record ${req.params.recordId} :modify record`);
      res
        .status(200)
        .json({ success: true, data: { recordId: req.params.recordId } });
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
      const s3Response = await s3Handler.deleteFile(record.videoFileName);
      console.log(s3Response);
      const cfResponse = await cloudfrontHandler.createCloudfrontInvalid(
        record.videoFileName
      );
      console.log(cfResponse);
      const dbResponse = await record.remove();
      console.log(dbResponse);
      res
        .status(200)
        .json({ success: true, data: { recordId: req.params.recordId } });
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
