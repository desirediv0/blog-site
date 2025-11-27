import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const excludeId = searchParams.get('excludeId');
        const limit = parseInt(searchParams.get('limit') || '3');

        if (!category) {
            return NextResponse.json(
                { error: 'Category is required' },
                { status: 400 }
            );
        }

        const where: Record<string, unknown> = {
            published: true,
            category: {
                slug: category,
            },
        };

        if (excludeId) {
            where.id = {
                not: excludeId,
            };
        }

        const relatedBlogs = await prisma.blog.findMany({
            where,
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                category: {
                    select: {
                        name: true,
                        slug: true,
                    },
                },
            },
            orderBy: {
                publishedAt: 'desc',
            },
            take: limit,
        });

        return NextResponse.json({ blogs: relatedBlogs });
    } catch (error) {
        console.error('Failed to fetch related blogs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch related blogs' },
            { status: 500 }
        );
    }
}

