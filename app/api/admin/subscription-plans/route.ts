import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const planSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0),
  duration: z.number().int().min(1), // Duration in months
  features: z.array(z.string()),
  active: z.boolean().default(true),
});

// GET all subscription plans (public for display, admin for management)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === 'ADMIN';

    const plans = await prisma.subscriptionPlan.findMany({
      where: isAdmin ? {} : { active: true },
      orderBy: {
        price: 'asc',
      },
    });

    return NextResponse.json({ plans });
  } catch (error) {
    console.error('Failed to fetch subscription plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription plans' },
      { status: 500 }
    );
  }
}

// POST create subscription plan (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const data = planSchema.parse(body);

    const plan = await prisma.subscriptionPlan.create({
      data,
    });

    return NextResponse.json(
      { message: 'Subscription plan created successfully', plan },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Failed to create subscription plan:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription plan' },
      { status: 500 }
    );
  }
}


