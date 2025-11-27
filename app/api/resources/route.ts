import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET resources by category slug or all resources
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");
    const accessType = searchParams.get("accessType");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      published: true,
    };

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
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [resources, total] = await Promise.all([
      prisma.resource.findMany({
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
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.resource.count({ where }),
    ]);

    // Check user access for each resource
    const resourcesWithAccess = await Promise.all(
      resources.map(async (resource) => {
        let hasAccess = resource.accessType === "FREE";

        if (session?.user && resource.accessType !== "FREE") {
          if (resource.accessType === "PAID") {
            const purchase = await prisma.resourcePurchase.findUnique({
              where: {
                userId_resourceId: {
                  userId: session.user.id,
                  resourceId: resource.id,
                },
              },
            });
            hasAccess = !!purchase;
          } else if (resource.accessType === "SUBSCRIPTION") {
            const subscription = await prisma.subscription.findFirst({
              where: {
                userId: session.user.id,
                status: "ACTIVE",
                endDate: {
                  gte: new Date(),
                },
              },
            });
            hasAccess = !!subscription;
          }
        }

        return {
          ...resource,
          hasAccess,
          // Don't send full content if no access
          content: hasAccess ? resource.content : null,
          codeBlocks: hasAccess ? resource.codeBlocks : null,
        };
      })
    );

    return NextResponse.json({
      resources: resourcesWithAccess,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch resources:", error);
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500 }
    );
  }
}
