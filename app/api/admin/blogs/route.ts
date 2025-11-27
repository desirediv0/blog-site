import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const blogSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    slug: z.string().min(1, 'Slug is required'),
    content: z.string().min(1, 'Content is required'),
    excerpt: z.string().optional(),
    coverImage: z.string().optional(),
    accessType: z.enum(['FREE', 'PAID', 'SUBSCRIPTION']),
    price: z.number().optional(),
    published: z.boolean().default(false),
    categoryId: z.string().min(1, 'Category is required'),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    keywords: z.array(z.string()).default([]),
    tags: z.array(z.string()).optional(), // Array of tag names
});

// GET all blogs (public + user access control)
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const { searchParams } = new URL(req.url);
        const published = searchParams.get('published');
        const accessType = searchParams.get('accessType');
        const categoryId = searchParams.get('categoryId');

        const where: Record<string, unknown> = {};

        // If not admin, only show published blogs
        if (!session?.user || session.user.role !== 'ADMIN') {
            where.published = true;
        } else if (published !== null) {
            where.published = published === 'true';
        }

        if (accessType) {
            where.accessType = accessType;
        }

        if (categoryId) {
            where.categoryId = categoryId;
        }

        const blogs = await prisma.blog.findMany({
            where,
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                category: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ blogs });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch blogs', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

// POST create blog (admin only)
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Verify user exists in database
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found. Please log in again.' },
                { status: 404 }
            );
        }

        const body = await req.json();
        const data = blogSchema.parse(body);

        // Check if slug already exists
        const existingBlog = await prisma.blog.findUnique({
            where: { slug: data.slug },
        });

        if (existingBlog) {
            return NextResponse.json(
                { error: 'Blog with this slug already exists' },
                { status: 400 }
            );
        }

        // Auto-fill SEO fields if not provided
        const metaTitle = data.metaTitle || data.title;
        const metaDescription = data.metaDescription || data.excerpt || data.content.substring(0, 160);

        // Auto-generate keywords from title if not provided
        let keywords = data.keywords || [];
        if (keywords.length === 0 && data.title) {
            // Extract keywords from title
            const titleWords = data.title
                .toLowerCase()
                .replace(/[^a-z0-9\s]/g, '')
                .split(/\s+/)
                .filter((word: string) => word.length > 3)
                .slice(0, 5);
            keywords = titleWords;
        }

        // Helper function to create slug from tag name
        const createTagSlug = (name: string) => {
            return name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
        };

        // Handle tags: create or connect tags
        const tagConnections = data.tags && data.tags.length > 0
            ? {
                connectOrCreate: data.tags.map((tagName: string) => {
                    const trimmedName = tagName.trim();
                    return {
                        where: { name: trimmedName },
                        create: {
                            name: trimmedName,
                            slug: createTagSlug(trimmedName),
                        },
                    };
                }),
            }
            : undefined;

        const blog = await prisma.blog.create({
            data: {
                title: data.title,
                slug: data.slug,
                content: data.content,
                excerpt: data.excerpt,
                coverImage: data.coverImage,
                accessType: data.accessType,
                price: data.price,
                published: data.published,
                categoryId: data.categoryId,
                metaTitle: metaTitle,
                metaDescription: metaDescription,
                keywords: keywords,
                authorId: session.user.id,
                publishedAt: data.published ? new Date() : null,
                tags: tagConnections,
            },
            include: {
                category: true,
                tags: true,
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json(
            { message: 'Blog created successfully', blog },
            { status: 201 }
        );
    } catch (error) {
        console.error('Blog creation error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.issues[0].message },
                { status: 400 }
            );
        }

        const errorMessage = error instanceof Error ? error.message : 'Failed to create blog';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
