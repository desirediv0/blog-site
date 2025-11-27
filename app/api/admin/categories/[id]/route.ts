import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const categorySchema = z.object({
    name: z.string().min(1, 'Name is required'),
    slug: z.string().min(1, 'Slug is required'),
    description: z.string().optional(),
});

// GET category by ID
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

        const category = await prisma.category.findUnique({
            where: { id: params.id },
        });

        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ category });
    } catch {
        return NextResponse.json(
            { error: 'Failed to fetch category' },
            { status: 500 }
        );
    }
}

// PUT update category (admin only)
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
        const data = categorySchema.parse(body);

        // Check if slug already exists (excluding current category)
        const existingCategory = await prisma.category.findFirst({
            where: {
                slug: data.slug,
                id: { not: params.id },
            },
        });

        if (existingCategory) {
            return NextResponse.json(
                { error: 'Category with this slug already exists' },
                { status: 400 }
            );
        }

        const category = await prisma.category.update({
            where: { id: params.id },
            data,
        });

        return NextResponse.json({
            message: 'Category updated successfully',
            category,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.issues[0].message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to update category' },
            { status: 500 }
        );
    }
}

// DELETE category (admin only)
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

        // Check if category is being used by blogs or resources
        const blogsCount = await prisma.blog.count({
            where: { categoryId: params.id },
        });

        const resourcesCount = await prisma.resource.count({
            where: { categoryId: params.id },
        });

        if (blogsCount > 0 || resourcesCount > 0) {
            return NextResponse.json(
                {
                    error: `Cannot delete category. It is being used by ${blogsCount} blog(s) and ${resourcesCount} resource(s).`,
                },
                { status: 400 }
            );
        }

        await prisma.category.delete({
            where: { id: params.id },
        });

        return NextResponse.json({
            message: 'Category deleted successfully',
        });
    } catch {
        return NextResponse.json(
            { error: 'Failed to delete category' },
            { status: 500 }
        );
    }
}




