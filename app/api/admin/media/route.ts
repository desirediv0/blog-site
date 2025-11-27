import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { s3Client, SPACES_BUCKET } from '@/lib/s3-client';
import { getFileUrl } from '@/lib/s3-utils';
import { config } from '@/lib/config';
import fs from 'fs/promises';
import path from 'path';

interface MediaFile {
    url: string;
    filename: string;
    key: string;
    size: number;
    uploadedAt: string;
}

// GET all media files
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const files: MediaFile[] = [];

        // Check if S3 is configured
        const s3Configured =
            config.s3.accessKey &&
            config.s3.secretKey &&
            config.s3.bucket &&
            config.s3.endpoint;

        if (s3Configured) {
            try {
                // Get folder name from config (e.g., "Blog-data")
                let folder = config.upload.folder;
                if (folder.startsWith("public/")) {
                    folder = folder.replace("public/", "");
                }

                // List all files from S3 bucket in the specified folder
                const command = new ListObjectsV2Command({
                    Bucket: SPACES_BUCKET,
                    Prefix: `${folder}/`, // Use folder from config (e.g., "Blog-data/")
                });

                const response = await s3Client.send(command);

                if (response.Contents) {
                    for (const object of response.Contents) {
                        if (object.Key && object.LastModified) {
                            files.push({
                                url: getFileUrl(object.Key) || '',
                                filename: object.Key.split('/').pop() || object.Key,
                                key: object.Key,
                                size: object.Size || 0,
                                uploadedAt: object.LastModified.toISOString(),
                            });
                        }
                    }
                }
            } catch (error) {
                console.error('S3 list error:', error);
                // Continue to local files if S3 fails
            }
        }

        // Also check local files
        try {
            const uploadFolder = config.upload.folder;
            const uploadPath = path.join(process.cwd(), uploadFolder);

            try {
                const localFiles = await fs.readdir(uploadPath);

                for (const file of localFiles) {
                    const filePath = path.join(uploadPath, file);
                    const stats = await fs.stat(filePath);

                    if (stats.isFile()) {
                        const urlPath = uploadFolder.startsWith('public/')
                            ? uploadFolder.replace('public/', '')
                            : uploadFolder.startsWith('public')
                                ? uploadFolder.replace('public', '')
                                : uploadFolder;
                        const url = `/${urlPath}/${file}`;

                        // Only add if not already in files (avoid duplicates)
                        if (!files.some((f) => f.filename === file)) {
                            files.push({
                                url,
                                filename: file,
                                key: file,
                                size: stats.size,
                                uploadedAt: stats.birthtime.toISOString(),
                            });
                        }
                    }
                }
            } catch (error) {
                console.log(error)
            }
        } catch (error) {
            console.error('Local files read error:', error);
        }

        // Sort by upload date (newest first)
        files.sort((a, b) => {
            return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        });

        return NextResponse.json({ files });
    } catch (error) {
        console.error('Failed to fetch media files:', error);
        return NextResponse.json(
            { error: 'Failed to fetch media files' },
            { status: 500 }
        );
    }
}

// DELETE media file
export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { url, key } = body;

        if (!url && !key) {
            return NextResponse.json(
                { error: 'URL or key is required' },
                { status: 400 }
            );
        }

        // Check if it's an S3 URL or local file
        if (url && url.startsWith('http')) {
            // S3/Spaces URL - use deleteFromS3
            const { deleteFromS3 } = await import('@/lib/s3-utils');
            try {
                await deleteFromS3(url);
                return NextResponse.json({
                    success: true,
                    message: 'File deleted from S3',
                });
            } catch (error) {
                console.error('S3 delete error:', error);
                return NextResponse.json(
                    { error: 'Failed to delete file from S3' },
                    { status: 500 }
                );
            }
        } else {
            // Local file or key-based deletion
            const fileKey = key || (url ? url.replace(/^\//, '') : '');

            // Try S3 first if key is provided
            if (key && config.s3.bucket) {
                try {
                    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
                    const command = new DeleteObjectCommand({
                        Bucket: SPACES_BUCKET,
                        Key: key,
                    });
                    await s3Client.send(command);
                    return NextResponse.json({
                        success: true,
                        message: 'File deleted from S3',
                    });
                } catch (error) {
                    console.error('S3 delete error:', error);
                }
            }

            // Try local file deletion
            const uploadFolder = config.upload.folder;
            const filePath = path.join(process.cwd(), uploadFolder, fileKey);

            try {
                await fs.unlink(filePath);
                return NextResponse.json({
                    success: true,
                    message: 'File deleted from local storage',
                });
            } catch (error) {
                console.error('Local delete error:', error);
                return NextResponse.json(
                    { error: 'File not found or already deleted' },
                    { status: 404 }
                );
            }
        }
    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json(
            { error: 'Failed to delete file' },
            { status: 500 }
        );
    }
}

