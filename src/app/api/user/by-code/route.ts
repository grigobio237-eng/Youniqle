import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ referralCode: code })
      .select('name avatar role isNavigator referralCode')
      .lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Failed to fetch user by code:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
