import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const resourceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().min(1, "Description is required"), // Required in Prisma
  excerpt: z.string().optional().default(""), // Not in schema, but keep for compatibility
  content: z.string().optional().default(""), // Required in Prisma, but we'll use description if not provided
  coverImage: z.string().optional(),
  codeBlocks: z
    .array(
      z.object({
        language: z.string(),
        code: z.string(),
        title: z.string().optional(),
      })
    )
    .optional()
    .default([]),
  accessType: z.enum(["FREE", "PAID", "SUBSCRIPTION"]),
  price: z.number().optional(),
  isPublished: z.boolean().optional().default(false),
  published: z.boolean().optional().default(false),
  categoryId: z.string().min(1, "Category is required"),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  keywords: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
});

// GET all resources
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const published = searchParams.get("published");
    const accessType = searchParams.get("accessType");
    const categoryId = searchParams.get("categoryId");

    const where: Record<string, unknown> = {};

    if (!session?.user || session.user.role !== "ADMIN") {
      where.published = true;
    } else if (published !== null) {
      where.published = published === "true";
    }

    if (accessType) {
      where.accessType = accessType;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const resources = await prisma.resource.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ resources });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500 }
    );
  }
}

// POST create resource (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = resourceSchema.parse(body);

    const existingResource = await prisma.resource.findUnique({
      where: { slug: data.slug },
    });

    if (existingResource) {
      return NextResponse.json(
        { error: "Resource with this slug already exists" },
        { status: 400 }
      );
    }

    // Prepare data according to Prisma schema
    // Resource model requires: title, slug, description, content (both are required)
    // If content is not provided, use description for both
    const finalDescription = data.description || "";
    const finalContent = data.content || data.description || "";

    // Ensure both are not empty (Prisma requirement)
    if (!finalDescription && !finalContent) {
      return NextResponse.json(
        { error: "Description or content is required" },
        { status: 400 }
      );
    }

    // Auto-fill SEO fields if not provided
    const metaTitle = data.metaTitle || data.title;
    const metaDescription = data.metaDescription || finalDescription?.substring(0, 160) || finalContent?.substring(0, 160);

    // Auto-generate keywords from title if not provided
    let keywords = data.keywords || [];
    if (keywords.length === 0 && data.title) {
      const titleWords = data.title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter((word: string) => word.length > 3)
        .slice(0, 5);
      keywords = titleWords;
    }

    // Helper function to create slug from tag name
    const createTagSlug = (name: string) => {
      return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    };

    // Handle tags: create or connect tags
    const tagConnections = data.tags && data.tags.length > 0
      ? {
        connectOrCreate: data.tags.map((tagName: string) => {
          const trimmedName = tagName.trim();
          return {
            where: { name: trimmedName },
            create: {
              name: trimmedName,
              slug: createTagSlug(trimmedName),
            },
          };
        }),
      }
      : undefined;

    // Build the resource data with proper typing
    const resourceDataInput = {
      title: data.title,
      slug: data.slug,
      description: finalDescription || finalContent, // Required field
      content: finalContent || finalDescription, // Required field
      coverImage: data.coverImage || undefined,
      accessType: data.accessType,
      price: data.price || undefined,
      author: {
        connect: {
          id: session.user.id,
        },
      },
      category: {
        connect: {
          id: data.categoryId,
        },
      },
      published: data.published || data.isPublished || false,
      publishedAt: data.published || data.isPublished ? new Date() : undefined,
      codeBlocks:
        data.codeBlocks && data.codeBlocks.length > 0
          ? JSON.parse(JSON.stringify(data.codeBlocks))
          : undefined, // Store as JSON, null if empty
      metaTitle: metaTitle || undefined,
      metaDescription: metaDescription || undefined,
      keywords: keywords, // Array of strings
      ...(tagConnections && { tags: tagConnections }),
    };

    const resource = await prisma.resource.create({
      data: resourceDataInput,
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

    return NextResponse.json(
      { message: "Resource created successfully", resource },
      { status: 201 }
    );
  } catch (error) {
    console.error("Resource creation error:", error);

    if (error instanceof z.ZodError) {
      console.error("Zod validation error:", error.issues);
      return NextResponse.json(
        { error: `Validation error: ${error.issues[0].message}` },
        { status: 400 }
      );
    }

    // Log the actual error for debugging
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      return NextResponse.json(
        { error: `Failed to create resource: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create resource" },
      { status: 500 }
    );
  }
}
