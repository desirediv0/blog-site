import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const tagUpdateSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    slug: z.string().min(1, 'Slug is required').optional(),
    description: z.string().optional(),
});

// Helper function to create slug from name
function createSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// GET tag by ID
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const tag = await prisma.tag.findUnique({
            where: { id: params.id },
            include: {
                _count: {
                    select: {
                        blogs: true,
                        resources: true,
                    },
                },
            },
        });

        if (!tag) {
            return NextResponse.json(
                { error: 'Tag not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ tag });
    } catch (error) {
        console.error('Failed to fetch tag:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tag' },
            { status: 500 }
        );
    }
}

// PUT update tag (admin only)
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const data = tagUpdateSchema.parse(body);

        // Check if tag exists
        const existingTag = await prisma.tag.findUnique({
            where: { id: params.id },
        });

        if (!existingTag) {
            return NextResponse.json(
                { error: 'Tag not found' },
                { status: 404 }
            );
        }

        // If name is being updated, generate slug if not provided
        const updateData: Record<string, unknown> = { ...data };
        if (data.name && !data.slug) {
            updateData.slug = createSlug(data.name);
        }

        // Check if new name or slug conflicts with existing tags
        if (data.name || data.slug) {
            const conflictingTag = await prisma.tag.findFirst({
                where: {
                    AND: [
                        { id: { not: params.id } },
                        {
                            OR: [
                                data.name ? { name: data.name } : {},
                                updateData.slug ? { slug: updateData.slug } : {},
                            ],
                        },
                    ],
                },
            });

            if (conflictingTag) {
                return NextResponse.json(
                    { error: 'Tag with this name or slug already exists' },
                    { status: 400 }
                );
            }
        }

        const tag = await prisma.tag.update({
            where: { id: params.id },
            data: updateData,
        });

        return NextResponse.json(
            { message: 'Tag updated successfully', tag },
            { status: 200 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.issues[0].message },
                { status: 400 }
            );
        }

        console.error('Failed to update tag:', error);
        return NextResponse.json(
            { error: 'Failed to update tag' },
            { status: 500 }
        );
    }
}

// DELETE tag (admin only)
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check if tag exists and get usage count
        const tag = await prisma.tag.findUnique({
            where: { id: params.id },
            include: {
                _count: {
                    select: {
                        blogs: true,
                        resources: true,
                    },
                },
            },
        });

        if (!tag) {
            return NextResponse.json(
                { error: 'Tag not found' },
                { status: 404 }
            );
        }

        // Check if tag is being used
        const totalUsage = tag._count.blogs + tag._count.resources;
        if (totalUsage > 0) {
            return NextResponse.json(
                {
                    error: `Cannot delete tag. It is being used in ${tag._count.blogs} blog(s) and ${tag._count.resources} resource(s). Please remove the tag from all content first.`,
                },
                { status: 400 }
            );
        }

        await prisma.tag.delete({
            where: { id: params.id },
        });

        return NextResponse.json(
            { message: 'Tag deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Failed to delete tag:', error);
        return NextResponse.json(
            { error: 'Failed to delete tag' },
            { status: 500 }
        );
    }
}


