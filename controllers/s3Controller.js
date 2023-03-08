import asyncHandler from "express-async-handler";
import crypto from "crypto";
import dotenv from "dotenv";
// import { s3Client, bucketName } from "../public/js/s3.js";
import {
  S3Client,
  DeleteObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

dotenv.config();

const bucketName = process.env.AWS_BUCKET_NAME;
const bucketRegion = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const s3Client = new S3Client({
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion,
});

export const s3Controller = {
  // @desc   Get putObjectSignedUrl
  // @route  GET /api/s3
  // @access Private
  getPutObjectSignedUrl: asyncHandler(async (req, res) => {
    const fileName = generateFileName();
    const params = {
      Bucket: bucketName,
      Key: fileName,
    };
    const command = new PutObjectCommand(params);
    const seconds = 60;
    try {
      const url = await getSignedUrl(s3Client, command, { expiresIn: seconds });
      if (!url || !fileName) {
        throw new Error("無法連結S3");
      } else {
        res.status(200).json({ success: true, data: { url, fileName } });
      }
    } catch (error) {
      console.log(error);
    }
  }),
  deleteFile: function (fileName) {
    const deleteParams = {
      Bucket: bucketName,
      Key: fileName,
    };
    return s3Client.send(new DeleteObjectCommand(deleteParams));
  },
};

function generateFileName(bytes = 16) {
  return crypto.randomBytes(bytes).toString("hex");
}
