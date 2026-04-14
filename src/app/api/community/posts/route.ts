import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import CommunityPost from '@/models/CommunityPost';
import { authOptions } from '@/lib/auth';

// 게시글 목록 조회 (모두 공개)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const query: any = {};
    if (category && category !== 'all') {
      query.category = category;
    }

    await dbConnect();
    const posts = await CommunityPost.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await CommunityPost.countDocuments(query);

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

// 게시글 작성 (로그인 필요)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, images, category } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    await dbConnect();

    // @ts-ignore
    const authorId = session.user.id || session.user._id;

    const newPost = new CommunityPost({
      title,
      content,
      images: images || [],
      category: category || 'free',
      authorId,
      authorName: session.user.name || '익명',
      authorImage: session.user.image,
      likes: [],
      comments: [],
    });

    await newPost.save();
    return NextResponse.json(newPost, { status: 201 });
  } catch (error: any) {
    console.error('[CommunityPost] POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
