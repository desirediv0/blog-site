import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET blog by slug
export async function GET(
    req: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        const blog = await prisma.blog.findUnique({
            where: { slug: params.slug, published: true },
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
        });

        if (!blog) {
            return NextResponse.json(
                { error: 'Blog not found' },
                { status: 404 }
            );
        }

        // Check if user has access to paid/subscription content
        let hasAccess = blog.accessType === 'FREE';

        if (session?.user && blog.accessType !== 'FREE') {
            if (blog.accessType === 'PAID') {
                const purchase = await prisma.blogPurchase.findUnique({
                    where: {
                        userId_blogId: {
                            userId: session.user.id,
                            blogId: blog.id,
                        },
                    },
                });
                hasAccess = !!purchase;
            } else if (blog.accessType === 'SUBSCRIPTION') {
                const subscription = await prisma.subscription.findFirst({
                    where: {
                        userId: session.user.id,
                        status: 'ACTIVE',
                        endDate: {
                            gte: new Date(),
                        },
                    },
                });
                hasAccess = !!subscription;
            }
        }

        if (!hasAccess && blog.accessType !== 'FREE') {
            return NextResponse.json({
                blog: {
                    ...blog,
                    content: blog.excerpt || blog.content.substring(0, 500) + '...',
                },
                requiresPurchase: true,
                accessType: blog.accessType,
                price: blog.price,
                hasAccess: false,
            });
        }

        return NextResponse.json({ blog, hasAccess: true });
    } catch {
        return NextResponse.json(
            { error: 'Failed to fetch blog' },
            { status: 500 }
        );
    }
}
