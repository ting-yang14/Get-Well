import express from "express";
import { recordController } from "../controllers/recordController.js";
// import { protect } from "../middleware/authMiddleware.js";
import passport from "passport";
import { recordSchemas } from "../config/joi.js";
import { joiMiddleware } from "../middleware/joiMiddleware.js";
// import multer from "multer";
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });
export const recordRouter = express.Router();
recordRouter
  .route("/")
  // .get(protect, recordController.getRecords)
  .get(
    passport.authenticate("jwt", { session: false }),
    recordController.getRecords
  )
  .post(
    passport.authenticate("jwt", { session: false }),
    joiMiddleware(recordSchemas.postRecord, "body"),
    recordController.createRecordFrontend
  );
// .post(
//   passport.authenticate("jwt", { session: false }),
//   upload.single("uploadVideo"),
//   recordController.createRecordMulter
// );

recordRouter
  .route("/:recordId")
  .get(
    passport.authenticate("jwt", { session: false }),
    recordController.getRecord
  )
  .patch(
    passport.authenticate("jwt", { session: false }),
    joiMiddleware(recordSchemas.patchRecord, "body"),
    recordController.updateRecord
  )
  .delete(
    passport.authenticate("jwt", { session: false }),
    recordController.deleteRecord
  );
