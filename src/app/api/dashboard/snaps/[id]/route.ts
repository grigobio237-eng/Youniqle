import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import LifeSnap from '@/models/LifeSnap';
import { StorageService } from '@/lib/storage';

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const userId = (session.user as any).id;

        // 1. MongoDB에서 해당 스냅 찾기
        const snap = await LifeSnap.findOne({ _id: id, userId });

        if (!snap) {
            return NextResponse.json({ error: 'Snap not found' }, { status: 404 });
        }

        // 2. Firebase Storage에서 이미지 삭제 (있는 경우)
        if (snap.imageUrl) {
            try {
                await StorageService.deleteFile(snap.imageUrl);
                console.log(`[LifeSnap API] Deleted image: ${snap.imageUrl}`);
            } catch (storageError) {
                console.error('[LifeSnap API] Image deletion failed:', storageError);
                // 이미지 삭제 실패해도 DB 삭제는 진행 (이미 삭제되었거나 경로 오류일 수 있음)
            }
        }

        // 3. User 모델의 scanTimeline에서도 삭제 (리듬체크 타임라인 동기화)
        const User = (await import('@/models/User')).default;
        await User.updateOne(
            { _id: userId },
            { $pull: { scanTimeline: { imageUrl: snap.imageUrl } } }
        );
        console.log(`[LifeSnap API] Removed from User.scanTimeline: ${snap.imageUrl}`);

        // 4. RecoveryScore에서도 snapData 비우기 (리듬체크 리포트 동기화)
        const RecoveryScore = (await import('@/models/RecoveryScore')).default;
        await RecoveryScore.updateMany(
            { userId, "snapData.content": snap.imageUrl },
            { $unset: { snapData: "" } }
        );
        console.log(`[LifeSnap API] Cleared snapData in RecoveryScore for image: ${snap.imageUrl}`);

        // 5. MongoDB에서 데이터 삭제
        await LifeSnap.deleteOne({ _id: id });

        return NextResponse.json({
            success: true,
            message: 'Snap deleted successfully'
        });

    } catch (error) {
        console.error('Failed to delete life snap:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
