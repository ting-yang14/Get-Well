import express from "express";
import passport from "passport";
import { recordController } from "../controllers/recordController.js";
import { recordSchemas } from "../config/joi.js";
import { joiMiddleware } from "../middleware/joiMiddleware.js";

export const recordRouter = express.Router();
recordRouter
  .route("/")
  .get(
    passport.authenticate("jwt", { session: false }),
    recordController.getRecords
  )
  .post(
    passport.authenticate("jwt", { session: false }),
    joiMiddleware(recordSchemas.postRecord, "body"),
    recordController.createRecordFrontend
  );

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
