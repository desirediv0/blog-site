import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const tagSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    slug: z.string().min(1, 'Slug is required'),
    description: z.string().optional(),
});

// Helper function to create slug from name
function createSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// GET all tags
export async function GET() {
    try {
        const tags = await prisma.tag.findMany({
            include: {
                _count: {
                    select: {
                        blogs: true,
                        resources: true,
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });

        return NextResponse.json({ tags });
    } catch (error) {
        console.error('Failed to fetch tags:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tags' },
            { status: 500 }
        );
    }
}

// POST create tag (admin only)
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
        const data = tagSchema.parse(body);

        // Generate slug if not provided
        const slug = data.slug || createSlug(data.name);

        // Check if tag with same name or slug exists
        const existing = await prisma.tag.findFirst({
            where: {
                OR: [
                    { name: data.name },
                    { slug: slug },
                ],
            },
        });

        if (existing) {
            return NextResponse.json(
                { error: 'Tag with this name or slug already exists' },
                { status: 400 }
            );
        }

        const tag = await prisma.tag.create({
            data: {
                name: data.name,
                slug: slug,
                description: data.description,
            },
        });

        return NextResponse.json(
            { message: 'Tag created successfully', tag },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.issues[0].message },
                { status: 400 }
            );
        }

        console.error('Failed to create tag:', error);
        return NextResponse.json(
            { error: 'Failed to create tag' },
            { status: 500 }
        );
    }
}


