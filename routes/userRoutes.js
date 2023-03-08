import express from "express";
import passport from "passport";
import { userController } from "../controllers/userController.js";
import { userSchemas } from "../config/joi.js";
import { joiMiddleware } from "../middleware/joiMiddleware.js";

export const userRouter = express.Router();
userRouter.post(
  "/register",
  joiMiddleware(userSchemas.register, "body"),
  userController.registerUser
);
userRouter.post(
  "/login",
  joiMiddleware(userSchemas.login, "body"),
  userController.loginUser
);
userRouter.patch(
  "/:userId",
  passport.authenticate("jwt", { session: false }),
  joiMiddleware(userSchemas.patchUser, "body"),
  userController.updateUser
);
userRouter.get(
  "/me",
  passport.authenticate("jwt", { session: false }),
  userController.getMe
);
