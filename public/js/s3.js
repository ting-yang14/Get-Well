import dotenv from "dotenv";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

dotenv.config();

export const bucketName = process.env.AWS_BUCKET_NAME;
const bucketRegion = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
export const s3Client = new S3Client({
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion,
});

export const s3Handler = {
  // createRecordMulter
  //   uploadVideo: function (file, fileName, mimetype) {
  //     const uploadParams = {
  //       Bucket: bucketName,
  //       Body: file,
  //       Key: fileName,
  //       ContentType: mimetype,
  //     };
  //     return s3Client.send(new PutObjectCommand(uploadParams));
  //   },
  deleteFile: function (fileName) {
    const deleteParams = {
      Bucket: bucketName,
      Key: fileName,
    };
    return s3Client.send(new DeleteObjectCommand(deleteParams));
  },
};
