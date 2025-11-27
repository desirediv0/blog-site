import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcrypt";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendOtpEmail } from "@/lib/email-templates";

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().optional(),
});

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name } = signupSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const tempPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Create user with temp password stored in database
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        emailVerified: false,
        otp,
        otpExpires,
        tempPassword: password, // Store plain password temporarily
        tempPasswordExpires, // 30 minutes
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    console.log(`[Signup] Created user and stored temp password for: ${email}`);

    // Send OTP email (non-blocking)
    try {
      await sendOtpEmail(user.email, user.name, otp);
    } catch (error) {
      // Don't fail signup if email fails, but log it
      console.error("Failed to send OTP email:", error);
    }

    return NextResponse.json(
      {
        message:
          "User created successfully. Please check your email for OTP verification.",
        user,
        requiresVerification: true,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
