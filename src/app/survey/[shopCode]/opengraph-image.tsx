import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Image metadata
export const alt = 'Youniqle - 맞춤 회복 솔루션';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  // 캐틱터 번호 선택 (c=1~6, 기본값 1)
  const charIndex = searchParams.c || '1';
  const charUrl = `https://grigobio.co.kr/character/youniqle-${charIndex}.png`;

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
            }}
        />

        {/* 캐릭터 이미지 (비율 유지 및 머리 잘림 방지를 위해 85% 크기로 제한) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={charUrl}
            alt={`Character ${charIndex}`}
            style={{
              height: '85%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.08))',
            }}
          />
        </div>

        {/* 하단 브랜딩 노출 (선택 사항) */}
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
          <div style={{ width: 1, height: 16, background: '#DDD' }} />
          <div style={{ fontSize: 18, fontWeight: 700, color: '#666' }}>
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
