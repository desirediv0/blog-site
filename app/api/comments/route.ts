import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createCommentSchema = z.object({
    blogId: z.string().min(1, 'Blog ID is required'),
    content: z.string().min(1, 'Comment content is required'),
});

// GET comments for a blog
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const blogId = searchParams.get('blogId');

        if (!blogId) {
            return NextResponse.json(
                { error: 'Blog ID is required' },
                { status: 400 }
            );
        }

        const comments = await prisma.comment.findMany({
            where: { blogId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ comments });
    } catch (error) {
        console.error('Failed to fetch comments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch comments' },
            { status: 500 }
        );
    }
}

// POST create a new comment
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized. Please sign in to comment.' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { blogId, content } = createCommentSchema.parse(body);

        // Verify blog exists
        const blog = await prisma.blog.findUnique({
            where: { id: blogId },
        });

        if (!blog) {
            return NextResponse.json(
                { error: 'Blog not found' },
                { status: 404 }
            );
        }

        // Create comment
        const comment = await prisma.comment.create({
            data: {
                blogId,
                userId: session.user.id,
                content,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json(
            { message: 'Comment added successfully', comment },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.issues[0].message },
                { status: 400 }
            );
        }

        console.error('Failed to create comment:', error);
        return NextResponse.json(
            { error: 'Failed to create comment' },
            { status: 500 }
        );
    }
}



