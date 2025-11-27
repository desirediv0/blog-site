import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { razorpay } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";
import { config } from "@/lib/config";

// Create subscription
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { planId } = body;

    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      );
    }

    // Get the plan
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.active) {
      return NextResponse.json(
        { error: "Plan not found or inactive" },
        { status: 404 }
      );
    }

    // Check if user already has active subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: "ACTIVE",
        endDate: {
          gte: new Date(),
        },
      },
    });

    if (existingSubscription) {
      return NextResponse.json(
        { error: "Already have active subscription" },
        { status: 400 }
      );
    }

    // Validate Razorpay config
    if (!config.razorpay.keyId || !config.razorpay.keySecret) {
      console.error("Razorpay credentials missing");
      return NextResponse.json(
        {
          error:
            "Payment gateway not configured. Please check server configuration.",
        },
        { status: 500 }
      );
    }

    // Create Razorpay subscription

    try {
      // For now, we'll create a one-time payment order instead of recurring subscription
      // You can implement Razorpay recurring subscriptions later if needed
      const order = await razorpay.orders.create({
        amount: Math.round(plan.price * 100), // Convert to paise
        currency: "INR",
        receipt: `SUB_${Date.now()}`,
      });

      // Calculate end date based on plan duration
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + plan.duration);

      // Create subscription record (will be activated after payment)
      const dbSubscription = await prisma.subscription.create({
        data: {
          userId: session.user.id,
          planId: plan.id,
          price: plan.price, // Store price at time of subscription
          status: "PENDING",
          endDate,
        },
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
          plan: true,
        },
      });

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          userId: session.user.id,
          amount: plan.price,
          currency: "INR",
          status: "PENDING",
          razorpayOrderId: order.id,
          subscriptionId: dbSubscription.id,
          metadata: {
            type: "SUBSCRIPTION",
            planId: plan.id,
          },
        },
      });

      return NextResponse.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        subscriptionId: dbSubscription.id,
        paymentId: payment.id,
      });
    } catch (razorpayError: unknown) {
      const errorMessage = razorpayError instanceof Error ? razorpayError.message : String(razorpayError);

      let errorDescription = "Failed to create subscription order.";
      if (razorpayError && typeof razorpayError === 'object') {
        const err = razorpayError as Record<string, unknown>;
        const errorObj = err.error as Record<string, unknown>;
        const description = errorObj?.description;
        const message = err.message;

        if (typeof description === 'string') {
          errorDescription = description;
        } else if (typeof message === 'string') {
          errorDescription = message;
        }
      }

      console.error("Razorpay order creation failed:", errorMessage);
      return NextResponse.json(
        { error: errorDescription },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Failed to create subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}

// Get user subscriptions
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId: session.user.id,
      },
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
        createdAt: "desc",
      },
    });

    return NextResponse.json({ subscriptions });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}
