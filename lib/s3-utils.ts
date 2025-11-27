import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, SPACES_BUCKET, SPACES_CDN_URL } from "./s3-client";
import { config } from "./config";

export const deleteFromS3 = async (fileUrl: string) => {
  try {
    if (!fileUrl) return;

    let Key: string;

    // Check if fileUrl is a full URL
    if (fileUrl.startsWith("http")) {
      const parsedUrl = new URL(fileUrl);
      Key = parsedUrl.pathname.slice(1);
    } else {
      Key = fileUrl.startsWith("/") ? fileUrl.slice(1) : fileUrl;
    }

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: SPACES_BUCKET,
        Key,
      })
    );

    console.log(`Successfully deleted file: ${Key}`);
  } catch (error) {
    console.error("S3 deletion error:", error);
    throw error;
  }
};

export const uploadToS3 = async (
  file: Buffer,
  filename: string,
  contentType: string
) => {
  try {
    if (!SPACES_BUCKET) {
      throw new Error("S3 bucket not configured");
    }

    const command = new PutObjectCommand({
      Bucket: SPACES_BUCKET,
      Key: filename,
      Body: file,
      ContentType: contentType,
      ACL: "public-read",
    });

    await s3Client.send(command);

    return getFileUrl(filename);
  } catch (error) {
    console.error("S3 upload error:", error);
    // Re-throw with more context
    if (error instanceof Error) {
      if (
        error.message.includes("bucket") ||
        error.message.includes("Bucket")
      ) {
        throw new Error(
          `S3 bucket "${SPACES_BUCKET}" does not exist or is not accessible. Please check your SPACES_BUCKET environment variable.`
        );
      }
    }
    throw error;
  }
};

export const getFileUrl = (filename: string) => {
  if (!filename) return null;

  // Check if we have a CDN URL configured
  if (SPACES_CDN_URL) {
    return `${SPACES_CDN_URL}/${filename}`;
  }

  // Fallback to direct bucket URL
  return `https://${SPACES_BUCKET}.${config.s3.region}.digitaloceanspaces.com/${filename}`;
};

export const generateUniqueFilename = (originalName: string) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = originalName.split(".").pop();

  // Use UPLOAD_FOLDER from config (e.g., "Blog-data")
  // Remove "public/" prefix if present for S3
  let folder = config.upload.folder;
  if (folder.startsWith("public/")) {
    folder = folder.replace("public/", "");
  }

  return `${folder}/${timestamp}-${random}.${ext}`;
};
