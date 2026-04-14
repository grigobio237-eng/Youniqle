import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import CommunityPost from '@/models/CommunityPost';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content } = await request.json();
    if (!content) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }

    await dbConnect();
    const post = await CommunityPost.findById(params.id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // @ts-ignore
    const userId = session.user.id || session.user._id;

    const newComment = {
      authorId: userId,
      authorName: session.user.name || '익명',
      authorImage: session.user.image,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    return NextResponse.json({ comments: post.comments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
