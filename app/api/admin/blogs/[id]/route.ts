import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const blogUpdateSchema = z.object({
    title: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
    excerpt: z.string().optional(),
    coverImage: z.string().optional(),
    accessType: z.enum(['FREE', 'PAID', 'SUBSCRIPTION']).optional(),
    price: z.number().optional(),
    published: z.boolean().optional(),
    categoryId: z.string().optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(), // Array of tag names
});

// GET single blog
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        const blog = await prisma.blog.findUnique({
            where: { id: params.id },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                category: true,
                tags: true,
            },
        });

        if (!blog) {
            return NextResponse.json(
                { error: 'Blog not found' },
                { status: 404 }
            );
        }

        // Access control
        if (!blog.published && (!session?.user || session.user.role !== 'ADMIN')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check if user has access to paid/subscription content
        if (session?.user && blog.accessType !== 'FREE') {
            const hasAccess = await checkUserAccess(session.user.id, blog);
            if (!hasAccess && session.user.role !== 'ADMIN') {
                return NextResponse.json(
                    { blog: { ...blog, content: null }, requiresPurchase: true },
                    { status: 200 }
                );
            }
        } else if (!session?.user && blog.accessType !== 'FREE') {
            return NextResponse.json(
                { blog: { ...blog, content: null }, requiresPurchase: true },
                { status: 200 }
            );
        }

        return NextResponse.json({ blog });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch blog', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

// PUT update blog (admin only)
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
        const data = blogUpdateSchema.parse(body);

        // Handle tags update if provided
        let tagConnections;
        if (data.tags !== undefined) {
            // First, disconnect all existing tags
            await prisma.blog.update({
                where: { id: params.id },
                data: {
                    tags: {
                        set: [],
                    },
                },
            });

            // Helper function to create slug from tag name
            const createTagSlug = (name: string) => {
                return name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '');
            };

            // Then connect or create new tags
            if (data.tags.length > 0) {
                tagConnections = {
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
                };
            }
        }

        // Get existing blog to check for old image
        const existingBlog = await prisma.blog.findUnique({
            where: { id: params.id },
            select: { coverImage: true },
        });

        // Auto-fill SEO fields if not provided but title/excerpt exists
        const existingBlogData = await prisma.blog.findUnique({
            where: { id: params.id },
            select: { title: true, excerpt: true, content: true },
        });

        const metaTitle = data.metaTitle || existingBlogData?.title || data.title;
        const metaDescription = data.metaDescription || existingBlogData?.excerpt || data.excerpt || existingBlogData?.content?.substring(0, 160);

        // Auto-generate keywords if not provided
        let keywords = data.keywords;
        if (!keywords || keywords.length === 0) {
            const titleToUse = data.title || existingBlogData?.title || '';
            if (titleToUse) {
                const titleWords = titleToUse
                    .toLowerCase()
                    .replace(/[^a-z0-9\s]/g, '')
                    .split(/\s+/)
                    .filter((word: string) => word.length > 3)
                    .slice(0, 5);
                keywords = titleWords;
            }
        }

        const updateData: Record<string, unknown> = {
            ...data,
            metaTitle: metaTitle,
            metaDescription: metaDescription,
            keywords: keywords || [],
            publishedAt: data.published ? new Date() : undefined,
        };

        // Remove tags from updateData as we handle it separately
        delete updateData.tags;

        if (tagConnections) {
            updateData.tags = tagConnections;
        }

        const blog = await prisma.blog.update({
            where: { id: params.id },
            data: updateData,
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

        // Delete old image if it was changed
        if (existingBlog?.coverImage && existingBlog.coverImage !== data.coverImage) {
            try {
                const { deleteFromS3 } = await import('@/lib/s3-utils');
                await deleteFromS3(existingBlog.coverImage);
            } catch (deleteError) {
                console.error('Failed to delete old image:', deleteError);
                // Don't fail the update if delete fails
            }
        }

        return NextResponse.json(
            { message: 'Blog updated successfully', blog },
            { status: 200 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.issues[0].message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to update blog' },
            { status: 500 }
        );
    }
}

// DELETE blog (admin only)
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

        // Get blog to delete its image
        const blog = await prisma.blog.findUnique({
            where: { id: params.id },
            select: { coverImage: true },
        });

        // Delete the blog
        await prisma.blog.delete({
            where: { id: params.id },
        });

        // Delete image from storage
        if (blog?.coverImage) {
            try {
                const { deleteFromS3 } = await import('@/lib/s3-utils');
                await deleteFromS3(blog.coverImage);
            } catch (deleteError) {
                console.error('Failed to delete image:', deleteError);
                // Don't fail if image delete fails
            }
        }

        return NextResponse.json(
            { message: 'Blog deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to delete blog', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

async function checkUserAccess(userId: string, blog: { accessType: string; id: string }) {
    if (blog.accessType === 'PAID') {
        const purchase = await prisma.blogPurchase.findUnique({
            where: {
                userId_blogId: {
                    userId,
                    blogId: blog.id,
                },
            },
        });
        return !!purchase;
    }

    if (blog.accessType === 'SUBSCRIPTION') {
        const subscription = await prisma.subscription.findFirst({
            where: {
                userId,
                status: 'ACTIVE',
                endDate: {
                    gte: new Date(),
                },
            },
        });
        return !!subscription;
    }

    return true;
}
