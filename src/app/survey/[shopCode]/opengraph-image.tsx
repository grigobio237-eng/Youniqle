import { ImageResponse } from 'next/og';
import fs from 'fs';
import path from 'path';

// Image metadata
export const alt = 'Youniqle - 맞춤 회복 솔루션';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const charIndex = (searchParams.c as string) || '1';
  
  let base64Image = '';
  try {
    const imagePath = path.join(process.cwd(), 'public', 'character', `youniqle-${charIndex}.png`);
    const imageData = fs.readFileSync(imagePath);
    base64Image = `data:image/png;base64,${imageData.toString('base64')}`;
  } catch (error) {
    console.error('Failed to load character image:', error);
    try {
        const fallbackPath = path.join(process.cwd(), 'public', 'character', 'youniqle-1.png');
        const fallbackData = fs.readFileSync(fallbackPath);
        base64Image = `data:image/png;base64,${fallbackData.toString('base64')}`;
    } catch (e) {
        // Fallback to no image
    }
  }

  // Satori (ImageResponse) 지원 범위에 맞게 CSS 최적화
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #F0F7FF 0%, #E6F3E6 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* 부드러운 배경 장식 (필터 제거, 투명도 조정으로 조화롭게 구현) */}
        <div 
            style={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 300,
                height: 300,
                borderRadius: '150px',
                background: 'rgba(56, 189, 248, 0.1)',
                display: 'flex',
            }}
        />
        <div 
            style={{
                position: 'absolute',
                bottom: -80,
                left: -80,
                width: 400,
                height: 400,
                borderRadius: '200px',
                background: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
            }}
        />

        {/* 캐릭터 이미지 (비율 유지를 위해 자동 가로세로 적용) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            paddingTop: '40px',
            paddingBottom: '80px',
          }}
        >
          {base64Image ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={base64Image}
              alt={`Character ${charIndex}`}
              style={{
                maxHeight: '520px',
                maxWidth: '520px',
                display: 'flex',
              }}
            />
          ) : (
             <div style={{ fontSize: 40, fontWeight: 900, color: '#1A1A1A' }}>YOUNIQLE</div>
          )}
        </div>

        {/* 하단 브랜딩 바 (그림자 대신 테두리로 강조) */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            alignItems: 'center',
            background: 'white',
            padding: '12px 32px',
            borderRadius: '24px',
            border: '2px solid rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', fontWeight: 900, color: '#1A1A1A', fontSize: 24, letterSpacing: '-0.02em' }}>
            YOUNIQLE
          </div>
          <div style={{ width: 2, height: 16, background: '#EEE', margin: '0 16px', display: 'flex' }} />
          <div style={{ fontSize: 18, fontWeight: 700, color: '#666', display: 'flex' }}>
            데이터 기반 맞춤 회복 솔루션
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
