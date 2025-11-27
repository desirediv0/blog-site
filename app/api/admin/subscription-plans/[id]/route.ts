import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const planUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  duration: z.number().int().min(1).optional(),
  features: z.array(z.string()).optional(),
  active: z.boolean().optional(),
});

// GET single plan
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: params.id },
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ plan });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch plan', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PUT update plan (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const data = planUpdateSchema.parse(body);

    const plan = await prisma.subscriptionPlan.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({
      message: 'Plan updated successfully',
      plan,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update plan' },
      { status: 500 }
    );
  }
}

// DELETE plan (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if plan has active subscriptions
    const activeSubscriptions = await prisma.subscription.count({
      where: {
        planId: params.id,
        status: 'ACTIVE',
      },
    });

    if (activeSubscriptions > 0) {
      // Deactivate instead of delete
      const plan = await prisma.subscriptionPlan.update({
        where: { id: params.id },
        data: { active: false },
      });
      return NextResponse.json({
        message: 'Plan deactivated (has active subscriptions)',
        plan,
      });
    }

    await prisma.subscriptionPlan.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: 'Plan deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete plan', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}



