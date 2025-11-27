import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { razorpay } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";
import { config } from "@/lib/config";

const createOrderSchema = z.object({
  type: z.enum(["BLOG", "RESOURCE"]),
  itemId: z.string(),
});

// Create Razorpay order for one-time payment
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, itemId } = createOrderSchema.parse(body);

    // Fetch item details
    let item;
    let amount;

    if (type === "BLOG") {
      item = await prisma.blog.findUnique({
        where: { id: itemId },
      });

      if (!item || item.accessType !== "PAID" || !item.price) {
        return NextResponse.json(
          { error: "Invalid blog or not available for purchase" },
          { status: 400 }
        );
      }

      // Check if already purchased
      const existingPurchase = await prisma.blogPurchase.findUnique({
        where: {
          userId_blogId: {
            userId: session.user.id,
            blogId: itemId,
          },
        },
      });

      if (existingPurchase) {
        return NextResponse.json(
          { error: "Already purchased" },
          { status: 400 }
        );
      }

      amount = item.price;
    } else {
      item = await prisma.resource.findUnique({
        where: { id: itemId },
      });

      if (!item || item.accessType !== "PAID" || !item.price) {
        return NextResponse.json(
          { error: "Invalid resource or not available for purchase" },
          { status: 400 }
        );
      }

      // Check if already purchased
      const existingPurchase = await prisma.resourcePurchase.findUnique({
        where: {
          userId_resourceId: {
            userId: session.user.id,
            resourceId: itemId,
          },
        },
      });

      if (existingPurchase) {
        return NextResponse.json(
          { error: "Already purchased" },
          { status: 400 }
        );
      }

      amount = item.price;
    }

    // Validate Razorpay config
    if (!config.razorpay.keyId || !config.razorpay.keySecret) {
      console.error(
        "Razorpay credentials missing. Check your .env file for RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET"
      );
      return NextResponse.json(
        {
          error:
            "Payment gateway not configured. Please check server configuration.",
        },
        { status: 500 }
      );
    }

    // Check if Razorpay is properly initialized (not using fallback)
    if (!config.razorpay.keyId || !config.razorpay.keySecret || !razorpay) {
      console.error("Razorpay instance not properly initialized");
      return NextResponse.json(
        {
          error:
            "Payment gateway initialization failed. Please check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env file.",
        },
        { status: 500 }
      );
    }

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Create Razorpay order
    // Receipt must be max 40 characters
    // Format: TYPE_TIMESTAMP (e.g., "BLOG_1735123456" or "RES_1735123456")
    const receipt = `${type.substring(0, 4)}_${Date.now()}`.substring(0, 40);

    let order;
    try {
      order = await razorpay.orders.create({
        amount: Math.round(amount * 100), // Convert to paise, ensure integer
        currency: "INR",
        receipt: receipt,
      });
    } catch (razorpayError: unknown) {
      console.error("Razorpay order creation failed:", razorpayError);
      let errorMessage =
        "Failed to create payment order. Please check Razorpay credentials.";

      if (razorpayError && typeof razorpayError === "object") {
        const error = razorpayError as {
          error?: { description?: string };
          message?: string;
        };
        errorMessage =
          error.error?.description || error.message || errorMessage;
      } else if (razorpayError instanceof Error) {
        errorMessage = razorpayError.message;
      }

      return NextResponse.json(
        {
          error: errorMessage,
        },
        { status: 500 }
      );
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        amount,
        currency: "INR",
        status: "PENDING",
        razorpayOrderId: order.id,
        metadata: {
          type,
          itemId,
        },
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentId: payment.id,
    });
  } catch (error) {
    console.error("Payment order creation error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    // Return more detailed error message
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create order";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Verify payment
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentId } =
      body;

    // Verify signature
    const text = `${razorpayOrderId}|${razorpayPaymentId}`;
    const signature = crypto
      .createHmac("sha256", config.razorpay.keySecret)
      .update(text)
      .digest("hex");

    if (signature !== razorpaySignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Update payment record
    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "SUCCESS",
        razorpayPaymentId,
        razorpaySignature,
      },
    });

    // Handle different payment types
    const metadata = payment.metadata as {
      type: string;
      itemId?: string;
      planId?: string;
    };

    if (metadata.type === "BLOG") {
      const blogPurchase = await prisma.blogPurchase.create({
        data: {
          userId: session.user.id,
          blogId: metadata.itemId!,
          paymentId: payment.id,
        },
        include: {
          blog: {
            select: {
              title: true,
              slug: true,
            },
          },
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      });

      // Send blog purchase email (non-blocking)
      try {
        const { sendBlogPurchaseEmail } = await import("@/lib/email-templates");
        sendBlogPurchaseEmail(
          blogPurchase.user.email,
          blogPurchase.user.name,
          blogPurchase.blog.title,
          blogPurchase.blog.slug,
          payment.amount
        ).catch(console.error);
      } catch (error) {
        console.error("Failed to send blog purchase email:", error);
      }
    } else if (metadata.type === "RESOURCE") {
      await prisma.resourcePurchase.create({
        data: {
          userId: session.user.id,
          resourceId: metadata.itemId!,
          paymentId: payment.id,
        },
      });
    } else if (metadata.type === "SUBSCRIPTION" && payment.subscriptionId) {
      // Activate subscription after payment
      const subscription = await prisma.subscription.update({
        where: { id: payment.subscriptionId },
        data: {
          status: "ACTIVE",
          startDate: new Date(),
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

      // Send subscription activated email (non-blocking)
      try {
        const { sendSubscriptionActivatedEmail } = await import(
          "@/lib/email-templates"
        );
        sendSubscriptionActivatedEmail(
          subscription.user.email,
          subscription.user.name,
          subscription.startDate,
          subscription.endDate
        ).catch(console.error);
      } catch (error) {
        console.error("Failed to send subscription activated email:", error);
      }
    }

    return NextResponse.json({
      message: "Payment verified successfully",
      success: true,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
