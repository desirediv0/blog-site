import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { sendOtpEmail } from '@/lib/email-templates';

const resendOtpSchema = z.object({
    email: z.string().email('Invalid email address'),
});

// Generate 6-digit OTP
function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email } = resendOtpSchema.parse(body);

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Check if already verified
        if (user.emailVerified) {
            return NextResponse.json(
                { error: 'Email is already verified' },
                { status: 400 }
            );
        }

        // Generate new OTP
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Update user with new OTP
        await prisma.user.update({
            where: { id: user.id },
            data: {
                otp,
                otpExpires,
            },
        });

        // Send OTP email
        try {
            await sendOtpEmail(user.email, user.name, otp);
        } catch (error) {
            console.error('Failed to send OTP email:', error);
            // Don't fail the request if email fails
        }

        return NextResponse.json(
            { message: 'OTP sent successfully' },
            { status: 200 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.issues[0].message },
                { status: 400 }
            );
        }

        console.error('Resend OTP error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

