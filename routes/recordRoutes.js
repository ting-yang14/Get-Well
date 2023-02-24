import express from "express";
import { recordController } from "../controllers/recordController.js";
// import { protect } from "../middleware/authMiddleware.js";
import passport from "passport";
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
    recordController.createRecordFrontend
  );
// .post(
//   passport.authenticate("jwt", { session: false }),
//   upload.single("uploadVideo"),
//   recordController.createRecordMulter
// );

recordRouter.get("/s3Url", recordController.getPutObjectSignedUrl);

recordRouter
  .route("/:recordId")
  .get(
    passport.authenticate("jwt", { session: false }),
    recordController.getRecord
  )
  .patch(
    passport.authenticate("jwt", { session: false }),
    recordController.updateRecord
  )
  .delete(
    passport.authenticate("jwt", { session: false }),
    recordController.deleteRecord
  );
