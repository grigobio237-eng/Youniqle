import { ImageResponse } from 'next/og';
import fs from 'fs';
import path from 'path';

// Node.js 환경에서 파일 시스템을 사용하여 이미지를 안정적으로 로드합니다.
// (Edge 런타임 대신 Node.js 기본 런타임 사용)

// Image metadata
export const alt = 'Youniqle - 맞춤 회복 솔루션';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  // 캐릭터 번호 선택 (c=1~6, 기본값 1)
  const charIndex = (searchParams.c as string) || '1';
  
  let base64Image = '';
  try {
    // public 디렉토리에서 캐릭터 이미지를 직접 읽어옵니다.
    const imagePath = path.join(process.cwd(), 'public', 'character', `youniqle-${charIndex}.png`);
    const imageData = fs.readFileSync(imagePath);
    base64Image = `data:image/png;base64,${imageData.toString('base64')}`;
  } catch (error) {
    console.error('Failed to load character image:', error);
    // 이미지 로드 실패 시 기본 캐릭터(1번) 시도
    try {
        const fallbackPath = path.join(process.cwd(), 'public', 'character', 'youniqle-1.png');
        const fallbackData = fs.readFileSync(fallbackPath);
        base64Image = `data:image/png;base64,${fallbackData.toString('base64')}`;
    } catch (e) {
        // 완전 실패 시 배경만 렌더링
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #F0F7FF 0%, #F1F9F1 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* 자연스러운 장식적 요소들 (배경) */}
        <div 
            style={{
                position: 'absolute',
                top: -100,
                right: -100,
                width: 400,
                height: 400,
                borderRadius: '50%',
                background: 'rgba(56, 189, 248, 0.05)',
                filter: 'blur(60px)',
                display: 'flex',
            }}
        />
        <div 
            style={{
                position: 'absolute',
                bottom: -100,
                left: -100,
                width: 500,
                height: 500,
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.05)',
                filter: 'blur(80px)',
                display: 'flex',
            }}
        />

        {/* 캐릭터 이미지 (데이터 URI 방식으로 안정적 로드) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          {base64Image ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={base64Image}
              alt={`Character ${charIndex}`}
              style={{
                height: '80%',
                objectFit: 'contain',
              }}
            />
          ) : (
             <div style={{ fontSize: 40, fontWeight: 900, color: '#333' }}>YOUNIQLE</div>
          )}
        </div>

        {/* 하단 브랜딩 노출 */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'rgba(255, 255, 255, 0.8)',
            padding: '12px 24px',
            borderRadius: '20px',
            border: '1px solid rgba(0,0,0,0.05)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', fontWeight: 900, color: '#1A1A1A', fontSize: 24, letterSpacing: '-0.02em' }}>
            YOUNIQLE
          </div>
          <div style={{ width: 1, height: 16, background: '#DDD', display: 'flex' }} />
          <div style={{ fontSize: 18, fontWeight: 700, color: '#666', display: 'flex' }}>
            맞춤 회복 진단
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
