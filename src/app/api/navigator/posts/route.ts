import { NextResponse } from 'next/navigation';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import NavigatorPost from '@/models/NavigatorPost';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session?.user?.isNavigator) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const query: any = {};
    if (category) {
      query.category = category;
    }

    await dbConnect();
    const posts = await NavigatorPost.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await NavigatorPost.countDocuments(query);

    return NextResponse.json({
      posts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session?.user?.isNavigator) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { title, content, images, category } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    await dbConnect();

    // Check auth options for user ID structure. NextAuth default is session.user.id or maybe custom
    // If our session contains id, use it
    // @ts-ignore
    const authorId = session.user.id || session.user._id;

    const newPost = new NavigatorPost({
      title,
      content,
      images: images || [],
      category: category || 'knowhow',
      authorId,
      authorName: session.user.name || '네비게이터',
      authorImage: session.user.image,
      likes: [],
      comments: [],
    });

    await newPost.save();
    return NextResponse.json(newPost, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
