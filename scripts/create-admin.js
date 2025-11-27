import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdminUser() {
    try {
        const email = 'admin@example.com';
        const password = 'admin123'; // Change this!
        const name = 'Admin';

        // Check if admin already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            console.log('❌ Admin user already exists!');
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);        // Create admin user
        const admin = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: 'ADMIN',
            },
        });

        console.log('✅ Admin user created successfully!');
        console.log('📧 Email:', admin.email);
        console.log('🔑 Password:', password);
        console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdminUser();
