import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateCommentSchema = z.object({
    content: z.string().min(1, 'Comment content is required'),
});

// PUT - Update comment
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized. Please sign in.' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { content } = updateCommentSchema.parse(body);

        // Find comment
        const comment = await prisma.comment.findUnique({
            where: { id: params.id },
        });

        if (!comment) {
            return NextResponse.json(
                { error: 'Comment not found' },
                { status: 404 }
            );
        }

        // Check if user owns the comment or is admin
        if (comment.userId !== session.user.id && session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized. You can only edit your own comments.' },
                { status: 403 }
            );
        }

        // Update comment
        const updatedComment = await prisma.comment.update({
            where: { id: params.id },
            data: {
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
            { message: 'Comment updated successfully', comment: updatedComment },
            { status: 200 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.issues[0].message },
                { status: 400 }
            );
        }

        console.error('Failed to update comment:', error);
        return NextResponse.json(
            { error: 'Failed to update comment' },
            { status: 500 }
        );
    }
}

// DELETE - Delete comment
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized. Please sign in.' },
                { status: 401 }
            );
        }

        // Find comment
        const comment = await prisma.comment.findUnique({
            where: { id: params.id },
        });

        if (!comment) {
            return NextResponse.json(
                { error: 'Comment not found' },
                { status: 404 }
            );
        }

        // Check if user owns the comment or is admin
        if (comment.userId !== session.user.id && session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized. You can only delete your own comments.' },
                { status: 403 }
            );
        }

        // Delete comment
        await prisma.comment.delete({
            where: { id: params.id },
        });

        return NextResponse.json(
            { message: 'Comment deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Failed to delete comment:', error);
        return NextResponse.json(
            { error: 'Failed to delete comment' },
            { status: 500 }
        );
    }
}

