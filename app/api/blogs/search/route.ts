import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const q = searchParams.get('q');

        if (!q || q.trim() === '') {
            return NextResponse.json(
                { error: 'Search query is required' },
                { status: 400 }
            );
        }

        const blogs = await prisma.blog.findMany({
            where: {
                published: true,
                OR: [
                    {
                        title: {
                            contains: q,
                            mode: 'insensitive',
                        },
                    },
                    {
                        content: {
                            contains: q,
                            mode: 'insensitive',
                        },
                    },
                    {
                        excerpt: {
                            contains: q,
                            mode: 'insensitive',
                        },
                    },
                ],
            },
            include: {
                author: {
                    select: {
                        name: true,
                    },
                },
                category: {
                    select: {
                        name: true,
                        slug: true,
                    },
                },
                tags: true,
            },
            orderBy: {
                publishedAt: 'desc',
            },
        });

        return NextResponse.json({ blogs, count: blogs.length });
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json(
            { error: 'Failed to search blogs' },
            { status: 500 }
        );
    }
}

