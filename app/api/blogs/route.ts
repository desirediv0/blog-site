import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

// GET published blogs
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const categorySlug = searchParams.get('category');
        const accessType = searchParams.get('accessType');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = { published: true };

        if (categorySlug) {
            where.category = {
                slug: categorySlug,
            };
        }

        if (accessType) {
            where.accessType = accessType;
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
                { excerpt: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [blogs, total] = await Promise.all([
            prisma.blog.findMany({
                where,
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    category: true,
                    tags: true,
                },
                orderBy: {
                    publishedAt: 'desc',
                },
                skip,
                take: limit,
            }),
            prisma.blog.count({ where }),
        ]);

        return NextResponse.json({
            blogs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch {
        return NextResponse.json(
            { error: 'Failed to fetch blogs' },
            { status: 500 }
        );
    }
}
