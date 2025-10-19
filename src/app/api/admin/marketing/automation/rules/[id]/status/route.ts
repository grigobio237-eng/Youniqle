import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';

const AutomationRuleModel = mongoose.models.AutomationRule || mongoose.model('AutomationRule', new mongoose.Schema({}));

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid rule ID' }, { status: 400 });
    }

    if (!['active', 'inactive', 'draft'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be active, inactive, or draft' },
        { status: 400 }
      );
    }

    const rule = await AutomationRuleModel.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    ).populate('createdBy', 'name email');

    if (!rule) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Rule ${status} successfully`,
      rule
    });

  } catch (error) {
    console.error('Error updating rule status:', error);
    return NextResponse.json(
      { error: 'Failed to update rule status' },
      { status: 500 }
    );
  }
}














