import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET single user details
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

        const user = await prisma.user.findUnique({
            where: { id: params.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                banned: true,
                createdAt: true,
                blogPurchases: {
                    include: {
                        blog: {
                            select: {
                                id: true,
                                title: true,
                                slug: true,
                            },
                        },
                    },
                },
                resourcePurchases: {
                    include: {
                        resource: {
                            select: {
                                id: true,
                                title: true,
                                slug: true,
                            },
                        },
                    },
                },
                subscriptions: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Failed to fetch user:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user' },
            { status: 500 }
        );
    }
}

// PATCH update user (ban/unban)
export async function PATCH(
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
        const { banned } = body;

        if (typeof banned !== 'boolean') {
            return NextResponse.json(
                { error: 'Invalid request' },
                { status: 400 }
            );
        }

        const user = await prisma.user.update({
            where: { id: params.id },
            data: { banned },
            select: {
                id: true,
                email: true,
                name: true,
                banned: true,
            },
        });

        return NextResponse.json({
            message: banned ? 'User banned successfully' : 'User unbanned successfully',
            user,
        });
    } catch (error) {
        console.error('Failed to update user:', error);
        return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
        );
    }
}




