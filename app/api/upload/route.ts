import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadFile } from "@/lib/upload-utils";
import { config } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only images are allowed." },
        { status: 400 }
      );
    }

    // Validate file size
    const maxSize = config.upload.maxSize;
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: `File size too large. Maximum ${Math.round(
            maxSize / 1024 / 1024
          )}MB allowed.`,
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to S3/Spaces or local storage (fallback)
    const { url: fileUrl, filename } = await uploadFile(
      buffer,
      file.name,
      file.type
    );

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: filename || file.name,
    });
  } catch (error) {
    console.error("Upload error:", error);

    // More detailed error message
    let errorMessage = "Failed to upload file";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    // Check if it's an S3 configuration issue
    if (
      errorMessage.includes("credentials") ||
      errorMessage.includes("access")
    ) {
      errorMessage =
        "S3/Spaces configuration error. Please check your environment variables.";
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
