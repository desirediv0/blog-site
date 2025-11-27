import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";

const verifyOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

// Generate a secure verification token for auto-login
function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp } = verifyOtpSchema.parse(body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if OTP matches and is not expired
    if (!user.otp || user.otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    if (!user.otpExpires || user.otpExpires < new Date()) {
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Generate a verification token for auto-login (valid for 5 minutes)
    const verificationToken = generateVerificationToken();
    const verificationTokenExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Verify user email, clear OTP, and set verification token for auto-login
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        otp: null,
        otpExpires: null,
        verificationToken: verificationToken,
        verificationTokenExpires: verificationTokenExpires,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return NextResponse.json(
      {
        message: "Email verified successfully",
        user: updatedUser,
        verificationToken: verificationToken, // Return token for auto-login
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("OTP verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
