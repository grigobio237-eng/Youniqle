// track-view/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CommunityPost from '@/models/CommunityPost';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    await CommunityPost.findByIdAndUpdate(params.id, { $inc: { viewCount: 1 } });
    return NextResponse.json({ message: 'View tracked' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
