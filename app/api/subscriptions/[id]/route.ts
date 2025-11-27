import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { razorpay } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";

// Cancel subscription
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find subscription
    const subscription = await prisma.subscription.findUnique({
      where: { id: params.id },
    });

    if (!subscription || subscription.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    // Cancel Razorpay subscription if exists
    if (subscription.razorpaySubscriptionId) {
      try {
        await razorpay.subscriptions.cancel(
          subscription.razorpaySubscriptionId
        );
      } catch {
        // Continue even if Razorpay cancellation fails
      }
    }

    // Update subscription status
    const updatedSubscription = await prisma.subscription.update({
      where: { id: params.id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    // Send subscription cancelled email (non-blocking)
    try {
      const { sendSubscriptionCancelledEmail } = await import(
        "@/lib/email-templates"
      );
      if (updatedSubscription.cancelledAt) {
        sendSubscriptionCancelledEmail(
          updatedSubscription.user.email,
          updatedSubscription.user.name,
          updatedSubscription.cancelledAt,
          updatedSubscription.endDate
        ).catch(console.error);
      }
    } catch (error) {
      console.error("Failed to send subscription cancelled email:", error);
    }

    return NextResponse.json({
      message: "Subscription cancelled successfully",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
