import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

// Get user profile with purchases and subscriptions
export async function GET() {
    try {
        const user = await getAuthenticatedUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userProfile = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                blogPurchases: {
                    include: {
                        blog: {
                            select: {
                                id: true,
                                title: true,
                                slug: true,
                                coverImage: true,
                                accessType: true,
                                price: true,
                            },
                        },
                        payment: {
                            select: {
                                amount: true,
                                createdAt: true,
                                status: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                resourcePurchases: {
                    include: {
                        resource: {
                            select: {
                                id: true,
                                title: true,
                                slug: true,
                                accessType: true,
                                price: true,
                            },
                        },
                        payment: {
                            select: {
                                amount: true,
                                createdAt: true,
                                status: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                subscriptions: {
                    include: {
                        plan: {
                            select: {
                                id: true,
                                name: true,
                                duration: true,
                                features: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                payments: {
                    include: {
                        subscription: {
                            select: {
                                id: true,
                                status: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 50,
                },
                bookmarks: {
                    include: {
                        blog: {
                            select: {
                                id: true,
                                title: true,
                                slug: true,
                                coverImage: true,
                                excerpt: true,
                                accessType: true,
                                price: true,
                                publishedAt: true,
                                author: {
                                    select: {
                                        id: true,
                                        name: true,
                                    },
                                },
                                category: {
                                    select: {
                                        id: true,
                                        name: true,
                                        slug: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });

        if (!userProfile) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ user: userProfile });
    } catch {
        return NextResponse.json(
            { error: 'Failed to fetch user profile' },
            { status: 500 }
        );
    }
}
