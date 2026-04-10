import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import PassInterest from '@/models/PassInterest';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { passId, navigatorId, status } = await req.json();
    if (!passId) {
      return NextResponse.json({ error: 'Pass ID is required' }, { status: 400 });
    }

    await dbConnect();

    // upsert logic
    const update: any = {
      $inc: { viewCount: 1 },
      $set: { lastViewedAt: new Date() }
    };

    if (navigatorId && mongoose.Types.ObjectId.isValid(navigatorId)) {
      update.$set.navigatorId = new mongoose.Types.ObjectId(navigatorId);
    }

    if (status) {
      update.$set.status = status;
    }

    const interest = await PassInterest.findOneAndUpdate(
      { userId: session.user.id, passId: passId.toLowerCase() },
      update,
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, data: interest });
  } catch (error: any) {
    console.error('Tracking API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
