import express from "express";
import { userController } from "../controllers/userController.js";
import passport from "passport";

export const userRouter = express.Router();
userRouter.post("/register", userController.registerUser);
userRouter.post("/login", userController.loginUser);
userRouter.get(
  "/me",
  passport.authenticate("jwt", { session: false }),
  userController.getMe
);
