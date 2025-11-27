import { S3Client } from "@aws-sdk/client-s3";
import { config } from "./config";

// Validate required environment variables
const requiredEnvVars = [
  "SPACES_ENDPOINT",
  "SPACES_REGION",
  "SPACES_ACCESS_KEY",
  "SPACES_SECRET_KEY",
  "SPACES_BUCKET",
];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn(
    `Missing S3/Spaces environment variables: ${missingVars.join(", ")}`
  );
}

const spacesConfig = {
  endpoint: config.s3.endpoint,
  region: config.s3.region,
  credentials: {
    accessKeyId: config.s3.accessKey,
    secretAccessKey: config.s3.secretKey,
  },
  forcePathStyle: false,
};

export const s3Client = new S3Client(spacesConfig);

export const SPACES_BUCKET = config.s3.bucket;
export const SPACES_CDN_URL = config.s3.cdnUrl;
