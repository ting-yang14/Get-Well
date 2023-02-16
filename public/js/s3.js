import dotenv from "dotenv";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { generateFileName } from "../public/js/utils.js";

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

export const s3Handler = {
  uploadVideo: function (file, fileName, mimetype) {
    const uploadParams = {
      Bucket: bucketName,
      Body: file,
      Key: fileName,
      ContentType: mimetype,
    };
    return s3Client.send(new PutObjectCommand(uploadParams));
  },
  getObjectSignedUrl: async function (fileName) {
    const params = {
      Bucket: bucketName,
      Key: fileName,
    };
    const command = new GetObjectCommand(params);
    const seconds = 60;
    try {
      const url = await getSignedUrl(s3Client, command, { expiresIn: seconds });
      return url;
    } catch (error) {
      console.log(error);
    }
  },
  putObjectSignedUrl: async function () {
    const fileName = generateFileName();
    const params = {
      Bucket: bucketName,
      Key: fileName,
    };
    const command = new PutObjectCommand(params);
    const seconds = 60;
    try {
      const url = await getSignedUrl(s3Client, command, { expiresIn: seconds });
      return { url, fileName };
    } catch (error) {
      console.log(error);
    }
  },
  deleteFile: function (fileName) {
    const deleteParams = {
      Bucket: bucketName,
      Key: fileName,
    };
    return s3Client.send(new DeleteObjectCommand(deleteParams));
  },
};
