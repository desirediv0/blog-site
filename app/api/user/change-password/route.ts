import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { compare, hash } from 'bcrypt';
import { z } from 'zod';

const changePasswordSchema = z.object({
    oldPassword: z.string().min(1, 'Old password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { oldPassword, newPassword } = changePasswordSchema.parse(body);

        // Get user with password
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                password: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Validate old password
        const isOldPasswordValid = await compare(oldPassword, user.password);

        if (!isOldPasswordValid) {
            return NextResponse.json(
                { error: 'Invalid old password' },
                { status: 400 }
            );
        }

        // Hash new password
        const hashedNewPassword = await hash(newPassword, 12);

        // Update password
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedNewPassword,
            },
        });

        return NextResponse.json(
            { message: 'Password updated successfully' },
            { status: 200 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.issues[0].message },
                { status: 400 }
            );
        }

        console.error('Change password error:', error);
        return NextResponse.json(
            { error: 'Failed to change password' },
            { status: 500 }
        );
    }
}



