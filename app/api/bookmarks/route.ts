import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const bookmarkSchema = z.object({
    blogId: z.string().min(1, 'Blog ID is required'),
});

// POST - Add bookmark
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized. Please sign in to bookmark.' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { blogId } = bookmarkSchema.parse(body);

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

        // Check if bookmark already exists
        const existingBookmark = await prisma.bookmark.findUnique({
            where: {
                userId_blogId: {
                    userId: session.user.id,
                    blogId: blogId,
                },
            },
        });

        if (existingBookmark) {
            return NextResponse.json(
                { message: 'Blog already bookmarked', bookmark: existingBookmark },
                { status: 200 }
            );
        }

        // Create bookmark
        const bookmark = await prisma.bookmark.create({
            data: {
                userId: session.user.id,
                blogId: blogId,
            },
            include: {
                blog: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        coverImage: true,
                    },
                },
            },
        });

        return NextResponse.json(
            { message: 'Blog bookmarked successfully', bookmark },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.issues[0].message },
                { status: 400 }
            );
        }

        console.error('Failed to create bookmark:', error);
        return NextResponse.json(
            { error: 'Failed to create bookmark' },
            { status: 500 }
        );
    }
}

// DELETE - Remove bookmark
export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized. Please sign in.' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { blogId } = bookmarkSchema.parse(body);

        // Delete bookmark
        const bookmark = await prisma.bookmark.deleteMany({
            where: {
                userId: session.user.id,
                blogId: blogId,
            },
        });

        if (bookmark.count === 0) {
            return NextResponse.json(
                { error: 'Bookmark not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: 'Bookmark removed successfully' },
            { status: 200 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.issues[0].message },
                { status: 400 }
            );
        }

        console.error('Failed to delete bookmark:', error);
        return NextResponse.json(
            { error: 'Failed to delete bookmark' },
            { status: 500 }
        );
    }
}

