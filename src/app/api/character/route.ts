import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Character from '@/models/Character';
import User from '@/models/User';
import { uploadImageToFirebase, uploadImageFromUrl } from '@/lib/utils/firebase-storage';

/**
 * 캐릭터 API
 * GET: 사용자의 저장된 캐릭터 목록 조회
 * POST: 새 캐릭터 저장
 * DELETE: 캐릭터 삭제
 */

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const characters = await Character.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .limit(10);

        return NextResponse.json({
            success: true,
            characters: characters.map((c: any) => ({
                id: c._id.toString(),
                name: c.name,
                imageUrl: c.imageUrl,
                prompt: c.prompt,
                visualStyle: c.visualStyle,
                isDefault: c.isDefault,
                createdAt: c.createdAt
            }))
        });

    } catch (error: any) {
        console.error('[Character API] GET error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name, imageData, prompt, visualStyle, setAsDefault } = body;

        if (!name || !imageData) {
            return NextResponse.json({ error: 'Name and imageData required' }, { status: 400 });
        }

        await dbConnect();
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 이미지 Firebase에 업로드
        const timestamp = Date.now();
        const safeName = name.replace(/[^a-zA-Z0-9가-힣]/g, '_').substring(0, 20);
        const path = `characters/${user._id}/${safeName}_${timestamp}.webp`;

        let imageUrl: string;
        if (imageData.startsWith('http')) {
            // URL인 경우
            imageUrl = await uploadImageFromUrl(imageData, path);
        } else {
            // Base64인 경우
            imageUrl = await uploadImageToFirebase(imageData, path);
        }

        // isDefault를 설정할 경우 기존 기본 캐릭터 해제
        if (setAsDefault) {
            await Character.updateMany(
                { userId: user._id, isDefault: true },
                { isDefault: false }
            );
        }

        // 캐릭터 저장
        const character = await Character.create({
            userId: user._id,
            name,
            imageUrl,
            prompt: prompt || '',
            visualStyle: visualStyle || 'premium',
            isDefault: setAsDefault || false
        });

        return NextResponse.json({
            success: true,
            character: {
                id: (character as any)._id.toString(),
                name: character.name,
                imageUrl: character.imageUrl,
                prompt: character.prompt,
                visualStyle: character.visualStyle,
                isDefault: character.isDefault,
                createdAt: character.createdAt
            }
        });

    } catch (error: any) {
        console.error('[Character API] POST error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const characterId = searchParams.get('id');

        if (!characterId) {
            return NextResponse.json({ error: 'Character ID required' }, { status: 400 });
        }

        await dbConnect();
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const deleted = await Character.findOneAndDelete({
            _id: characterId,
            userId: user._id
        });

        if (!deleted) {
            return NextResponse.json({ error: 'Character not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[Character API] DELETE error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
