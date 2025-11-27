import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      totalUsers,
      totalBlogs,
      totalCategories,
      totalPayments,
      totalSubscriptions,
      revenue,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.blog.count(),
      prisma.category.count(),
      prisma.payment.count({ where: { status: "SUCCESS" } }),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.payment.aggregate({
        where: { status: "SUCCESS" },
        _sum: { amount: true },
      }),
    ]);

    // Monthly earnings (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyEarnings = await prisma.payment.groupBy({
      by: ["createdAt"],
      where: {
        status: "SUCCESS",
        createdAt: { gte: sixMonthsAgo },
      },
      _sum: { amount: true },
    });

    // Group by month
    const earningsByMonth = monthlyEarnings.reduce((acc, payment) => {
      const month = new Date(payment.createdAt).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      acc[month] = (acc[month] || 0) + (payment._sum.amount || 0);
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalBlogs,
        totalCategories,
        totalPayments,
        totalSubscriptions,
        revenue: revenue._sum.amount || 0,
        monthlyEarnings: Object.entries(earningsByMonth).map(
          ([month, amount]) => ({
            month,
            amount,
          })
        ),
      },
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
