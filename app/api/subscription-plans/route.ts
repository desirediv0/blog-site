import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET all subscription plans (public - anyone can view active plans)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "ADMIN";

    // Admin can see all plans, public users can only see active plans
    const plans = await prisma.subscriptionPlan.findMany({
      where: isAdmin ? {} : { active: true },
      orderBy: {
        price: "asc",
      },
    });

    return NextResponse.json({ plans });
  } catch (error) {
    console.error("Failed to fetch subscription plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription plans" },
      { status: 500 }
    );
  }
}
