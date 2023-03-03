import express from "express";
import { s3Controller } from "../controllers/s3Controller.js";
export const s3Router = express.Router();
s3Router.get("/", s3Controller.getPutObjectSignedUrl);
