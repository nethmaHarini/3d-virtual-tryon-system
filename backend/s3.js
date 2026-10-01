require("dotenv").config();

const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

const {
  getSignedUrl,
} = require("@aws-sdk/s3-request-presigner");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
});

const BUCKET = process.env.AWS_S3_BUCKET;

/**
 * Upload a Buffer to S3
 */
async function uploadToS3(buffer, key, contentType) {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return key;
}

/**
 * Generate a temporary URL for a private object
 */
async function getSignedFileUrl(key, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  return await getSignedUrl(s3, command, {
    expiresIn,
  });
}

/**
 * Delete an S3 object
 */
async function deleteFromS3(key) {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
}

module.exports = {
  uploadToS3,
  getSignedFileUrl,
  deleteFromS3,
};