import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from "@aws-sdk/client-cloudfront";
import dotenv from "dotenv";
dotenv.config();
const cloudfrontKeyPairId = process.env.CLOUDFRONT_KEY_PAIR_ID;
// -- for docker build --
// const cloudfrontPrivateKey = process.env.CLOUDFRONT_PRIVATE_KEY.split(
//   String.raw`\n`
// ).join("\n");
// ---
// -- for local dev --
const cloudfrontPrivateKey = process.env.CLOUDFRONT_PRIVATE_KEY;
// ---
const cloudfrontDistributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID;
const cloudfrontUrl = process.env.CLOUDFRONT_URL;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const bucketRegion = process.env.AWS_BUCKET_REGION;
const cloudfront = new CloudFrontClient({
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion,
});

export const cloudfrontHandler = {
  generateCloudfrontSignedUrl: async function (fileName) {
    try {
      const signedUrl = getSignedUrl({
        keyPairId: cloudfrontKeyPairId,
        privateKey: cloudfrontPrivateKey,
        url: `${cloudfrontUrl}/${fileName}`,
        dateLessThan: new Date(Date.now() + 1000 /*sec*/ * 60 * 30),
      });
      return signedUrl;
    } catch (error) {
      console.log(error);
    }
  },
  createCloudfrontInvalid: async function (fileName) {
    const cfCommand = new CreateInvalidationCommand({
      DistributionId: cloudfrontDistributionId,
      InvalidationBatch: {
        CallerReference: fileName,
        Paths: { Quantity: 1, Items: ["/" + fileName] },
      },
    });
    cloudfront.send(cfCommand);
  },
};
