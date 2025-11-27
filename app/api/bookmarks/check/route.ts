import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { isBookmarked: false },
                { status: 200 }
            );
        }

        const { searchParams } = new URL(req.url);
        const blogId = searchParams.get('blogId');

        if (!blogId) {
            return NextResponse.json(
                { error: 'Blog ID is required' },
                { status: 400 }
            );
        }

        const bookmark = await prisma.bookmark.findUnique({
            where: {
                userId_blogId: {
                    userId: session.user.id,
                    blogId: blogId,
                },
            },
        });

        return NextResponse.json({
            isBookmarked: !!bookmark,
        });
    } catch (error) {
        console.error('Failed to check bookmark:', error);
        return NextResponse.json(
            { error: 'Failed to check bookmark' },
            { status: 500 }
        );
    }
}

