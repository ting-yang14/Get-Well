import asyncHandler from "express-async-handler";
import { s3Client, bucketName } from "../public/js/s3.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { generateFileName } from "../public/js/utils.js";
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
};
