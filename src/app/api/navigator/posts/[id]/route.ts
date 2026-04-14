import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import NavigatorPost from '@/models/NavigatorPost';
import { authOptions } from '@/lib/auth';

export async function GET(
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

    await dbConnect();

    const post = await NavigatorPost.findById(id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // 조회수 증가
    post.viewCount = (post.viewCount || 0) + 1;
    await post.save();

    return NextResponse.json(post);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
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
    await dbConnect();

    // Check auth options for user ID structure
    // @ts-ignore
    const authorId = session.user.id || session.user._id;

    const post = await NavigatorPost.findById(id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.authorId.toString() !== authorId.toString()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { title, content, images, category } = await request.json();
    
    post.title = title || post.title;
    post.content = content || post.content;
    if (images !== undefined) post.images = images;
    if (category) post.category = category;

    await post.save();

    return NextResponse.json(post);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
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
    await dbConnect();

    // @ts-ignore
    const authorId = session.user.id || session.user._id;

    const post = await NavigatorPost.findById(id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // @ts-ignore (Admin bypassing is optional, assuming only author can delete for now)
    if (post.authorId.toString() !== authorId.toString() && session.user.role !== 'admin' && session.user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await NavigatorPost.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
