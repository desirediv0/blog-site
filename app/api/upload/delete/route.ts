import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { deleteFromS3 } from '@/lib/s3-utils';
import { config } from '@/lib/config';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { url } = body;

        if (!url) {
            return NextResponse.json(
                { error: 'URL is required' },
                { status: 400 }
            );
        }

        // Check if it's an S3 URL or local file
        if (url.startsWith('http')) {
            // S3/Spaces URL
            try {
                await deleteFromS3(url);
                return NextResponse.json({
                    success: true,
                    message: 'File deleted from S3',
                });
            } catch (error) {
                console.error('S3 delete error:', error);
                // Don't fail if S3 delete fails (file might not exist)
                return NextResponse.json({
                    success: true,
                    message: 'File deletion attempted',
                });
            }
        } else {
            // Local file
            const uploadFolder = config.upload.folder;
            const filePath = path.join(process.cwd(), uploadFolder, url.replace(/^\//, ''));

            try {
                await fs.unlink(filePath);
                return NextResponse.json({
                    success: true,
                    message: 'File deleted from local storage',
                });
            } catch (error) {
                console.error('Local delete error:', error);
                // Don't fail if file doesn't exist
                return NextResponse.json({
                    success: true,
                    message: 'File deletion attempted',
                });
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




