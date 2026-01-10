import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PavilionFloor from '@/models/PavilionFloor';
import { withPartnerAuth } from '@/lib/authMiddleware';

// Helper to get floor by partner type
function getFloorByType(partnerType: string): number {
    switch (partnerType) {
        case 'artist': return 1;
        case 'business':
        case 'shopper': return 2;
        case 'coach': return 3;
        default: return 0; // Invalid or other floors
    }
}

// GET: 파트너 본인의 전시 데이터 조회
async function getPartnerPavilionHandler(request: NextRequest, user: any) {
    try {
        await connectDB();

        const partnerType = user.partnerApplication?.partnerType;
        const floorNum = getFloorByType(partnerType);

        if (floorNum === 0 && user.role !== 'admin') {
            return NextResponse.json({ error: '전시 관리 권한이 없는 파트너 타입입니다.' }, { status: 403 });
        }

        // 해당 층 데이터 가져오기 (관리자는 1층 기본 또는 쿼리 파라미터로 확장 가능하지만 일단 1층)
        const targetFloor = floorNum || 1;
        const floorData = await PavilionFloor.findOne({ floor: targetFloor });

        if (!floorData) {
            return NextResponse.json({ error: `Pavilion Floor ${targetFloor} not found` }, { status: 404 });
        }

        // 현재 파트너의 ID와 일치하는 owner 찾기
        const partnerId = user._id.toString();
        let owner = floorData.owners.find((o: any) => o.id === partnerId);

        // 만약 owner가 없다면 기본 정보로 초기화
        if (!owner) {
            const roleMap: Record<string, string> = {
                'artist': '아티스트',
                'business': '대표자',
                'shopper': '대표자',
                'coach': '마스터 코치'
            };

            owner = {
                id: partnerId,
                name: user.name || '파트너',
                role: roleMap[partnerType] || '전문가',
                bio: user.partnerApplication?.businessDescription || '소개를 입력해주세요.',
                image: user.avatar || '',
                items: []
            };
        }

        return NextResponse.json({ owner, floor: targetFloor });
    } catch (error) {
        console.error('Fetch partner pavilion error:', error);
        return NextResponse.json({ error: 'Failed to fetch pavilion data' }, { status: 500 });
    }
}

// POST: 파트너 본인의 전시 데이터 업데이트
async function updatePartnerPavilionHandler(request: NextRequest, user: any) {
    try {
        await connectDB();
        const body = await request.json();
        const { bio, role, image, items, name, schedule } = body;

        const partnerType = user.partnerApplication?.partnerType;
        const floorNum = getFloorByType(partnerType);

        if (floorNum === 0 && user.role !== 'admin') {
            return NextResponse.json({ error: '작가, 상점 또는 코치 권한이 필요합니다.' }, { status: 403 });
        }

        const partnerId = user._id.toString();
        const targetFloor = floorNum || 1;
        const floorData = await PavilionFloor.findOne({ floor: targetFloor });

        if (!floorData) {
            return NextResponse.json({ error: `Pavilion Floor ${targetFloor} not found` }, { status: 404 });
        }

        const owners = [...floorData.owners];
        const ownerIndex = owners.findIndex((o: any) => o.id === partnerId);

        const updatedOwner = {
            id: partnerId,
            name: name || user.name,
            role: role || (partnerType === 'artist' ? '아티스트' : '전문가'),
            bio: bio || '',
            image: image || '',
            items: items || [],
            schedule: schedule || []
        };

        if (ownerIndex > -1) {
            owners[ownerIndex] = updatedOwner;
        } else {
            owners.push(updatedOwner);
        }

        floorData.owners = owners;
        await floorData.save();

        return NextResponse.json({
            message: '성공적으로 업데이트되었습니다.',
            owner: updatedOwner,
            floor: targetFloor
        });
    } catch (error) {
        console.error('Update partner pavilion error:', error);
        return NextResponse.json({ error: 'Failed to update pavilion data' }, { status: 500 });
    }
}

export const GET = withPartnerAuth(getPartnerPavilionHandler);
export const POST = withPartnerAuth(updatePartnerPavilionHandler);
