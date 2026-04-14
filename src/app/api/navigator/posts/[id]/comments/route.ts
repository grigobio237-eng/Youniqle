import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import NavigatorPost from '@/models/NavigatorPost';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session?.user?.isNavigator) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    await dbConnect();

    // @ts-ignore
    const authorId = session.user.id || session.user._id;

    const post = await NavigatorPost.findById(id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const newComment = {
      _id: new mongoose.Types.ObjectId(),
      authorId,
      authorName: session.user.name || '네비게이터',
      authorImage: session.user.image,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    post.comments.push(newComment as any);
    await post.save();

    return NextResponse.json(newComment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
