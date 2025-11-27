import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET featured items for home page (public)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Get featured blogs
    const featuredBlogs = await prisma.blog.findMany({
      where: {
        featured: true,
        published: true,
      },
      take: 6,
      orderBy: {
        publishedAt: "desc",
      },
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    // Get featured resources
    const featuredResources = await prisma.resource.findMany({
      where: {
        featured: true,
        published: true,
      },
      take: 6,
      orderBy: {
        publishedAt: "desc",
      },
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        author: {
          select: {
            name: true,
          },
        },
        purchases: userId
          ? {
            where: {
              userId,
            },
            select: {
              id: true,
            },
          }
          : false,
      },
    });

    // Get latest blogs (for Latest Articles section)
    const latestBlogs = await prisma.blog.findMany({
      where: {
        published: true,
      },
      take: 6,
      orderBy: {
        publishedAt: "desc",
      },
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    // Check access for resources
    const resourcesWithAccess = await Promise.all(
      featuredResources.map(async (resource) => {
        let hasAccess = resource.accessType === "FREE";

        if (userId && resource.accessType !== "FREE") {
          if (resource.accessType === "PAID") {
            hasAccess = resource.purchases && resource.purchases.length > 0;
          } else if (resource.accessType === "SUBSCRIPTION") {
            const subscription = await prisma.subscription.findFirst({
              where: {
                userId,
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
          purchases: undefined, // Remove purchases from response
        };
      })
    );

    return NextResponse.json({
      featuredBlogs,
      featuredResources: resourcesWithAccess,
      latestBlogs,
    });
  } catch (error) {
    console.error("Failed to fetch featured items:", error);
    return NextResponse.json(
      { error: "Failed to fetch featured items" },
      { status: 500 }
    );
  }
}

// PATCH - Update featured status (admin only)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, id, featured } = body;

    if (!type || !id || typeof featured !== "boolean") {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    if (type === "BLOG") {
      const blog = await prisma.blog.update({
        where: { id },
        data: { featured },
        include: {
          category: true,
          author: {
            select: {
              name: true,
            },
          },
        },
      });
      return NextResponse.json({ message: "Blog updated", blog });
    } else if (type === "RESOURCE") {
      const resource = await prisma.resource.update({
        where: { id },
        data: { featured },
        include: {
          category: true,
          author: {
            select: {
              name: true,
            },
          },
        },
      });
      return NextResponse.json({ message: "Resource updated", resource });
    } else {
      return NextResponse.json(
        { error: "Invalid type. Use BLOG or RESOURCE" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Failed to update featured status:", error);
    return NextResponse.json(
      { error: "Failed to update featured status" },
      { status: 500 }
    );
  }
}
