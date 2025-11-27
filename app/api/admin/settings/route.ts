import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { config } from '@/lib/config';

// GET all settings (admin only)
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get database settings
        const dbSettings = await prisma.setting.findMany({
            orderBy: { category: 'asc' },
        });

        // Convert to key-value object
        const settings: Record<string, unknown> = {};
        dbSettings.forEach((setting) => {
            let value: unknown = setting.value;
            if (setting.type === 'number') {
                value = Number(value);
            } else if (setting.type === 'boolean') {
                value = value === 'true';
            } else if (setting.type === 'json') {
                try {
                    value = JSON.parse(String(value));
                } catch {
                    value = value;
                }
            }
            settings[setting.key] = value;
        });

        // Add read-only environment-based settings
        const readOnlySettings = {
            // Razorpay (read-only for security)
            razorpayKeyId: config.razorpay.keyId ? '***' + config.razorpay.keyId.slice(-4) : 'Not configured',
            razorpayPublicKeyId: config.razorpay.publicKeyId ? '***' + config.razorpay.publicKeyId.slice(-4) : 'Not configured',

            // Database
            databaseUrl: config.database.url ? 'Configured' : 'Not configured',

            // NextAuth
            nextAuthUrl: config.auth.url,
            nextAuthSecret: config.auth.secret ? '***' : 'Not configured',

            // Email
            smtpHost: config.smtp.host,
            smtpPort: config.smtp.port,
            smtpUser: config.smtp.user || 'Not configured',

            // Storage
            storageType: config.s3.bucket ? 'S3/Spaces' : 'Local',
            s3Bucket: config.s3.bucket || 'Not configured',
            uploadFolder: config.upload.folder,

            // App
            appUrl: config.app.url,
        };

        return NextResponse.json({
            settings,
            readOnlySettings,
            dbSettings: dbSettings.map(s => ({
                id: s.id,
                key: s.key,
                value: s.value,
                type: s.type,
                category: s.category,
                description: s.description,
            })),
        });
    } catch (error) {
        console.error('Failed to fetch settings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
            { status: 500 }
        );
    }
}

// POST/PUT update settings (admin only)
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { settings } = body;

        if (!settings || typeof settings !== 'object') {
            return NextResponse.json(
                { error: 'Invalid settings data' },
                { status: 400 }
            );
        }

        // Update each setting
        const updates = await Promise.all(
            Object.entries(settings).map(async ([key, value]) => {
                let stringValue = String(value);
                let type = 'string';

                if (typeof value === 'number') {
                    type = 'number';
                } else if (typeof value === 'boolean') {
                    type = 'boolean';
                    stringValue = String(value);
                } else if (typeof value === 'object') {
                    type = 'json';
                    stringValue = JSON.stringify(value);
                }

                return prisma.setting.upsert({
                    where: { key },
                    update: {
                        value: stringValue,
                        type,
                    },
                    create: {
                        key,
                        value: stringValue,
                        type,
                        category: 'general',
                    },
                });
            })
        );

        return NextResponse.json({
            message: 'Settings updated successfully',
            updated: updates.length,
        });
    } catch (error) {
        console.error('Failed to update settings:', error);
        return NextResponse.json(
            { error: 'Failed to update settings' },
            { status: 500 }
        );
    }
}


