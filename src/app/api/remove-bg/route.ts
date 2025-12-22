import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const imageFile = formData.get('image') as File;

        if (!imageFile) {
            return NextResponse.json({ error: '이미지가 제공되지 않았습니다' }, { status: 400 });
        }

        const apiKey = process.env.REMOVEBG_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: 'Remove.bg API 키가 설정되지 않았습니다. .env.local 파일을 확인하세요.' },
                { status: 500 }
            );
        }

        // Remove.bg API 호출
        const formDataToSend = new FormData();
        formDataToSend.append('image_file', imageFile);
        formDataToSend.append('size', 'auto');

        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
                'X-Api-Key': apiKey,
            },
            body: formDataToSend,
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { error: errorData.errors?.[0]?.title || '배경 제거 실패' },
                { status: response.status }
            );
        }

        const blob = await response.blob();

        // Blob을 Buffer로 변환
        const arrayBuffer = await blob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'image/png',
                'Content-Length': buffer.length.toString(),
            },
        });
    } catch (error) {
        console.error('배경 제거 오류:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
    }
}
