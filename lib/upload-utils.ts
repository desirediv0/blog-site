import fs from "fs/promises";
import path from "path";
import { config } from "./config";
import { uploadToS3, generateUniqueFilename } from "./s3-utils";

/**
 * Upload file to S3/Spaces or local storage (fallback)
 */
export async function uploadFile(
  buffer: Buffer,
  originalName: string,
  contentType: string
): Promise<{ url: string; filename: string }> {
  // Check if S3 is configured
  const s3Configured =
    config.s3.accessKey &&
    config.s3.secretKey &&
    config.s3.bucket &&
    config.s3.endpoint;

  if (s3Configured) {
    try {
      // Try S3 upload first
      // generateUniqueFilename already uses config.upload.folder
      const filename = generateUniqueFilename(originalName);
      const url = await uploadToS3(buffer, filename, contentType);
      if (!url) {
        throw new Error("S3 upload failed: No URL returned");
      }
      return { url, filename };
    } catch (error) {
      console.error("S3 upload failed, falling back to local storage:", error);
      // Fall through to local upload
    }
  }

  // Fallback to local file storage
  return await uploadToLocal(buffer, originalName);
}

/**
 * Upload file to local storage
 */
async function uploadToLocal(
  buffer: Buffer,
  originalName: string
): Promise<{ url: string; filename: string }> {
  const uploadFolder = config.upload.folder;
  const uploadPath = path.join(process.cwd(), uploadFolder);

  // Create upload directory if it doesn't exist
  try {
    await fs.mkdir(uploadPath, { recursive: true });
  } catch (error) {
    console.error("Failed to create upload directory:", error);
    throw new Error("Failed to create upload directory");
  }

  // Generate unique filename
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = originalName.split(".").pop() || "jpg";
  const filename = `${timestamp}-${random}.${ext}`;
  const filePath = path.join(uploadPath, filename);

  // Write file
  await fs.writeFile(filePath, buffer);

  // Return URL (relative to public folder)
  // If uploadFolder is "public/uploads", return "/uploads/filename"
  // If uploadFolder is "uploads", return "/uploads/filename"
  const urlPath = uploadFolder.startsWith("public/")
    ? uploadFolder.replace("public/", "")
    : uploadFolder.startsWith("public")
    ? uploadFolder.replace("public", "")
    : uploadFolder;
  const url = `/${urlPath}/${filename}`;

  return { url, filename };
}
