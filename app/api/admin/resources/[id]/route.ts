import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET single resource
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        const resource = await prisma.resource.findUnique({
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

        if (!resource) {
            return NextResponse.json(
                { error: 'Resource not found' },
                { status: 404 }
            );
        }

        // Access control
        if (!resource.published && (!session?.user || session.user.role !== 'ADMIN')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check if user has access to paid/subscription content
        if (session?.user && resource.accessType !== 'FREE') {
            const hasAccess = await checkUserResourceAccess(session.user.id, resource);
            if (!hasAccess && session.user.role !== 'ADMIN') {
                return NextResponse.json(
                    { resource: { ...resource, content: null, codeBlocks: null }, requiresPurchase: true },
                    { status: 200 }
                );
            }
        } else if (!session?.user && resource.accessType !== 'FREE') {
            return NextResponse.json(
                { resource: { ...resource, content: null, codeBlocks: null }, requiresPurchase: true },
                { status: 200 }
            );
        }

        return NextResponse.json({ resource });
    } catch {
        return NextResponse.json(
            { error: 'Failed to fetch resource' },
            { status: 500 }
        );
    }
}

// PUT update resource (admin only)
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
        const {
            title,
            slug,
            description,
            content,
            coverImage,
            categoryId,
            accessType,
            price,
            published,
            metaTitle,
            metaDescription,
            keywords,
            codeBlocks,
            tags,
        } = body;

        // Get existing resource to check for old image
        const existingResource = await prisma.resource.findUnique({
            where: { id: params.id },
            select: { coverImage: true },
        });

        // Auto-fill SEO fields if not provided
        const existingResourceData = await prisma.resource.findUnique({
            where: { id: params.id },
            select: { title: true, description: true },
        });

        const finalMetaTitle = metaTitle || existingResourceData?.title || title;
        const finalMetaDescription = metaDescription || existingResourceData?.description?.substring(0, 160) || description?.substring(0, 160);
        
        // Auto-generate keywords if not provided
        let finalKeywords = keywords;
        if (!finalKeywords || finalKeywords.length === 0) {
            const titleToUse = title || existingResourceData?.title || '';
            if (titleToUse) {
                const titleWords = titleToUse
                    .toLowerCase()
                    .replace(/[^a-z0-9\s]/g, '')
                    .split(/\s+/)
                    .filter((word: string) => word.length > 3)
                    .slice(0, 5);
                finalKeywords = titleWords;
            }
        }

        // Helper function to create slug from tag name
        const createTagSlug = (name: string) => {
            return name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
        };

        // Handle tags update if provided
        let tagConnections;
        if (tags !== undefined) {
            // First, disconnect all existing tags
            await prisma.resource.update({
                where: { id: params.id },
                data: {
                    tags: {
                        set: [],
                    },
                },
            });

            // Then connect or create new tags
            if (tags.length > 0) {
                tagConnections = {
                    connectOrCreate: tags.map((tagName: string) => {
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

        // Update resource
        const updateData: Record<string, unknown> = {
            title,
            slug,
            description: description || content,
            content: content || description,
            coverImage: coverImage || null,
            categoryId,
            accessType,
            price: accessType === 'PAID' ? price : null,
            published: published || false,
            publishedAt: published ? new Date() : null,
            metaTitle: finalMetaTitle || null,
            metaDescription: finalMetaDescription || null,
            keywords: finalKeywords || [],
            codeBlocks: codeBlocks && codeBlocks.length > 0 ? codeBlocks : null,
        };

        if (tagConnections) {
            updateData.tags = tagConnections;
        }

        const resource = await prisma.resource.update({
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
        if (existingResource?.coverImage && existingResource.coverImage !== coverImage) {
            try {
                const { deleteFromS3 } = await import('@/lib/s3-utils');
                await deleteFromS3(existingResource.coverImage);
            } catch (deleteError) {
                console.error('Failed to delete old image:', deleteError);
                // Don't fail the update if delete fails
            }
        }

        return NextResponse.json(
            { message: 'Resource updated successfully', resource },
            { status: 200 }
        );
    } catch (error) {
        console.error('Failed to update resource:', error);
        return NextResponse.json(
            { error: 'Failed to update resource' },
            { status: 500 }
        );
    }
}

// DELETE resource (admin only)
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

        // Get resource to delete its image
        const resource = await prisma.resource.findUnique({
            where: { id: params.id },
            select: { coverImage: true },
        });

        // Delete the resource
        await prisma.resource.delete({
            where: { id: params.id },
        });

        // Delete image from storage
        if (resource?.coverImage) {
            try {
                const { deleteFromS3 } = await import('@/lib/s3-utils');
                await deleteFromS3(resource.coverImage);
            } catch (deleteError) {
                console.error('Failed to delete image:', deleteError);
                // Don't fail if image delete fails
            }
        }

        return NextResponse.json(
            { message: 'Resource deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Failed to delete resource:', error);
        return NextResponse.json(
            { error: 'Failed to delete resource' },
            { status: 500 }
        );
    }
}

async function checkUserResourceAccess(userId: string, resource: { id: string; accessType: string }) {
    if (resource.accessType === 'PAID') {
        const purchase = await prisma.resourcePurchase.findUnique({
            where: {
                userId_resourceId: {
                    userId,
                    resourceId: resource.id,
                },
            },
        });
        return !!purchase;
    }

    if (resource.accessType === 'SUBSCRIPTION') {
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
