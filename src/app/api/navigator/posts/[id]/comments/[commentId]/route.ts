import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import NavigatorPost from '@/models/NavigatorPost';
import { authOptions } from '@/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session?.user?.isNavigator) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id, commentId } = await params;
    await dbConnect();

    // @ts-ignore
    const userId = session.user.id || session.user._id;

    const post = await NavigatorPost.findById(id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const comment = post.comments.find((c: any) => c._id.toString() === commentId);

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // 작성자 본인 혹은 관리자만 삭제 가능
    // @ts-ignore
    if (comment.authorId.toString() !== userId.toString() && session.user.role !== 'admin' && session.user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    post.comments = post.comments.filter((c: any) => c._id.toString() !== commentId);
    await post.save();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
