import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { prisma } from './prisma';

/**
 * Get authenticated user with banned check
 * Returns null if user is not authenticated or is banned
 */
export async function getAuthenticatedUser() {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
        return null;
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            banned: true,
        },
    });

    if (!user || user.banned) {
        return null;
    }

    return user;
}

/**
 * Get authenticated admin user
 * Returns null if user is not admin or is banned
 */
export async function getAuthenticatedAdmin() {
    const user = await getAuthenticatedUser();
    
    if (!user || user.role !== 'ADMIN') {
        return null;
    }

    return user;
}




