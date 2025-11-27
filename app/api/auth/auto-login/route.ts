import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getTempPasswordFromDB, deleteTempPassword } from '@/lib/temp-password-store';

const autoLoginSchema = z.object({
    email: z.string().email('Invalid email address'),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email } = autoLoginSchema.parse(body);

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found', success: false },
                { status: 404 }
            );
        }

        // Check if email is verified
        if (!user.emailVerified) {
            return NextResponse.json(
                { error: 'Email not verified', success: false },
                { status: 400 }
            );
        }

        // Get temporary password from database
        console.log(`[AutoLogin] Attempting to get temp password for: ${email}`);
        const tempPassword = await getTempPasswordFromDB(email);
        if (!tempPassword) {
            console.log(`[AutoLogin] Temp password not found or expired for: ${email}`);
            return NextResponse.json(
                { error: 'Temporary password expired. Please sign in manually.', success: false },
                { status: 400 }
            );
        }
        console.log(`[AutoLogin] Temp password retrieved successfully for: ${email}`);

        // Delete temporary password after use
        await deleteTempPassword(email);

        // Return temporary password for client-side signIn
        return NextResponse.json(
            { 
                success: true,
                tempPassword, // Return for client-side signIn
            },
            { status: 200 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.issues[0].message, success: false },
                { status: 400 }
            );
        }

        console.error('Auto-login error:', error);
        return NextResponse.json(
            { error: 'Internal server error', success: false },
            { status: 500 }
        );
    }
}

