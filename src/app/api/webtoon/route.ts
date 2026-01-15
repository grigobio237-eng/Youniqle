import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Webtoon from '@/models/Webtoon';
import User from '@/models/User';
import { getFirebaseStorageInstance } from '@/lib/firebase-admin';
import { uploadImageToFirebase } from '@/lib/utils/firebase-storage';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const {
            date,
            episodeNumber,
            title,
            panels,
            script,
            summary,
            imageUrl,
            characterPrompt,
            visualStyle,
            genre,
            isPublic
        } = body;

        await dbConnect();

        const user = await User.findOne({ email: session.user.email });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        const month = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
        const timestamp = Date.now();

        // 패널 이미지들을 Firebase Storage에 WebP로 업로드
        let uploadedPanels = [];
        if (panels && panels.length > 0) {
            console.log(`[Webtoon Save] Processing ${panels.length} panel images...`);

            for (let i = 0; i < panels.length; i++) {
                const panel = panels[i];
                const panelNum = panel.panelNumber || i + 1;

                // 이미 Firebase URL이면 스킵
                if (panel.imageUrl && panel.imageUrl.includes('storage.googleapis.com')) {
                    uploadedPanels.push(panel);
                    continue;
                }

                // Base64 이미지인 경우 Firebase에 업로드
                if (panel.imageUrl && panel.imageUrl.startsWith('data:image/')) {
                    try {
                        console.log(`[Webtoon Save] Uploading panel ${panelNum}/${panels.length}...`);
                        const path = `webtoons/${user._id}/${timestamp}_panel_${panelNum}.webp`;
                        const firebaseUrl = await uploadImageToFirebase(panel.imageUrl, path);

                        uploadedPanels.push({
                            ...panel,
                            imageUrl: firebaseUrl,
                            // cleanImageUrl은 프론트에서 제외하고 보냈으므로 여기서도 제외되거나 명시적으로 null 처리
                        });
                        console.log(`[Webtoon Save] Panel ${panelNum} upload success.`);
                    } catch (uploadError: any) {
                        console.error(`[Webtoon Save] Panel ${panelNum} upload failed:`, uploadError.message);
                        uploadedPanels.push(panel); // 실패 시 원본 유지
                    }
                } else {
                    uploadedPanels.push(panel);
                }
            }
            console.log('[Webtoon Save] All panel images processed.');
        }

        // 대표 이미지도 Firebase URL로 업데이트
        const finalImageUrl = uploadedPanels && uploadedPanels.length > 0
            ? uploadedPanels[0].imageUrl
            : imageUrl;

        // Upsert daily webtoon
        const webtoon = await Webtoon.findOneAndUpdate(
            { userId: user._id, date: targetDate },
            {
                userId: user._id,
                date: targetDate,
                episodeNumber,
                title: title || summary || '오늘의 회복 웹툰',
                panels: uploadedPanels,
                script: script || (uploadedPanels && uploadedPanels.length > 0 ? uploadedPanels[0].script : ""),
                summary,
                imageUrl: finalImageUrl,
                characterPrompt,
                visualStyle,
                genre,
                isPublic,
                month
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return NextResponse.json({ success: true, webtoon });

    } catch (error: any) {
        console.error('Webtoon Save API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        await dbConnect();
        const user = await User.findOne({ email: session.user.email });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Ensure owner
        const webtoon = await Webtoon.findOne({ _id: id, userId: user._id });
        if (!webtoon) return NextResponse.json({ error: 'Webtoon not found or unauthorized' }, { status: 404 });

        // Firebase Storage에서 패널 이미지 삭제
        try {
            const storage = getFirebaseStorageInstance();
            if (storage && webtoon.panels) {
                const bucket = storage.bucket();
                for (const panel of webtoon.panels) {
                    if (panel.imageUrl && panel.imageUrl.includes('firebasestorage.googleapis.com')) {
                        // URL에서 파일 경로 추출
                        const urlMatch = panel.imageUrl.match(/\/o\/(.+?)\?/);
                        if (urlMatch && urlMatch[1]) {
                            const filePath = decodeURIComponent(urlMatch[1]);
                            try {
                                await bucket.file(filePath).delete();
                                console.log(`[Webtoon Delete] Deleted Firebase file: ${filePath}`);
                            } catch (fileError: any) {
                                console.warn(`[Webtoon Delete] Failed to delete file ${filePath}:`, fileError.message);
                            }
                        }
                    }
                }
            }
        } catch (storageError: any) {
            console.error('[Webtoon Delete] Firebase Storage error:', storageError.message);
            // Storage 삭제 실패해도 DB 삭제는 계속 진행
        }

        await Webtoon.deleteOne({ _id: id });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Webtoon Delete API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// 웹툰 공개/비공개 전환
export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { id, isPublic } = body;

        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        await dbConnect();
        const user = await User.findOne({ email: session.user.email });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // 소유자 확인
        const webtoon = await Webtoon.findOne({ _id: id, userId: user._id });
        if (!webtoon) return NextResponse.json({ error: 'Webtoon not found or unauthorized' }, { status: 404 });

        // 공개 상태 업데이트
        webtoon.isPublic = isPublic;
        await webtoon.save();

        return NextResponse.json({ success: true, webtoon });
    } catch (error: any) {
        console.error('Webtoon Update API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const month = searchParams.get('month');
        const userId = searchParams.get('userId');
        const isPublic = searchParams.get('public') === 'true';
        const isMine = searchParams.get('mine') === 'true';

        const query: any = {};
        if (month) query.month = month;
        if (userId) query.userId = userId;
        if (isPublic) query.isPublic = true;

        // 내 웹툰 조회 (로그인 필요)
        if (isMine) {
            const session = await getServerSession(authOptions);
            if (!session || !session.user || !session.user.email) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            const user = await User.findOne({ email: session.user.email });
            if (user) {
                query.userId = user._id;
                delete query.isPublic; // 본인 웹툰은 공개/비공개 모두 조회
            }
        }

        const webtoons = await Webtoon.find(query)
            .sort({ date: -1 }) // 최신순 정렬
            .populate('userId', 'name characterImage email');

        return NextResponse.json({ success: true, webtoons });

    } catch (error: any) {
        console.error('Webtoon Fetch API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
