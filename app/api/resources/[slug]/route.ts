import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET resource by slug
export async function GET(
    req: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        const slug = params.slug;

        const resource = await prisma.resource.findUnique({
            where: { slug },
            include: {
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
        });

        if (!resource) {
            return NextResponse.json(
                { error: 'Resource not found' },
                { status: 404 }
            );
        }

        if (!resource.published) {
            return NextResponse.json(
                { error: 'Resource not found' },
                { status: 404 }
            );
        }

        // Check access
        let hasAccess = resource.accessType === 'FREE';

        if (session?.user && resource.accessType !== 'FREE') {
            if (resource.accessType === 'PAID') {
                const purchase = await prisma.resourcePurchase.findUnique({
                    where: {
                        userId_resourceId: {
                            userId: session.user.id,
                            resourceId: resource.id,
                        },
                    },
                });
                hasAccess = !!purchase;
            } else if (resource.accessType === 'SUBSCRIPTION') {
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

        // Don't send full content if no access - send preview only
        const resourceData = {
            ...resource,
            content: hasAccess ? resource.content : (resource.description ? resource.description.substring(0, 500) + '...' : null),
            codeBlocks: hasAccess ? resource.codeBlocks : null,
            hasAccess,
            // Send minimal description for preview
            description: hasAccess ? resource.description : resource.description.substring(0, 200) + '...',
        };

        return NextResponse.json({ resource: resourceData });
    } catch (error) {
        console.error('Failed to fetch resource:', error);
        return NextResponse.json(
            { error: 'Failed to fetch resource' },
            { status: 500 }
        );
    }
}

