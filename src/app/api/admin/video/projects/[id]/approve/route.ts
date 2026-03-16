import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import VideoProject from '@/models/VideoProject';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await connectDB();
        const { action, feedback } = await request.json(); // action: 'approve_script', 'approve_assets', 'approve_video', 'reject'
        const projectId = params.id;

        const project = await VideoProject.findById(projectId);
        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        let updates: any = {};

        if (action === 'approve_script') {
            // 대본 승인 -> 자산 생성 요청
            updates = {
                status: 'asset_generating',
                logs: [...project.logs, `[User] Script Approved at ${new Date().toISOString()}`]
            };
            // If script was modified in frontend, update it
            if (feedback && feedback.script) {
                updates.script = feedback.script;
            }
        } else if (action === 'approve_assets') {
            // 자산 승인 -> 영상 렌더링 요청
            updates = {
                status: 'rendering',
                logs: [...project.logs, `[User] Assets Approved at ${new Date().toISOString()}`]
            };
        } else if (action === 'approve_video') {
            // 최종 영상 승인 -> 업로드 요청
            updates = {
                status: 'uploading',
                logs: [...project.logs, `[User] Video Approved at ${new Date().toISOString()}`]
            };
        } else if (action === 'reject') {
            // 반려 -> 이전 단계로 돌아가거나 실패 처리 (구현 필요)
            // 여기서는 간단히 failed로 처리하거나, 특정 단계로 리셋 로직 추가 가능
            updates = {
                status: 'failed',
                failReason: 'User Rejected: ' + feedback?.reason,
                logs: [...project.logs, `[User] Rejected: ${feedback?.reason}`]
            };
        }

        const updatedProject = await VideoProject.findByIdAndUpdate(
            projectId,
            { $set: updates },
            { new: true }
        );

        return NextResponse.json({ success: true, data: updatedProject });

    } catch (error: any) {
        console.error('Approval Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
