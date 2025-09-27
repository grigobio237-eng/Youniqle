# Youniqle 캐릭터 이미지

이 폴더에는 Youniqle의 대표 캐릭터 이미지들이 저장됩니다.

## 파일 구조

```
public/character/
├── youniqle-1.png    # 대표 캐릭터 이미지 (메인 로고용)
├── youniqle-2.png    # 보조 캐릭터 이미지
├── youniqle-3.png    # 보조 캐릭터 이미지
└── ...
```

## 이미지 사용법

### 1. 메인 로고 (youniqle-1.png)
- **용도**: Header, Footer, Hero 섹션의 메인 로고
- **크기**: 40x40px (Header), 400x400px (Hero)
- **형식**: PNG (투명 배경 권장)

### 2. 보조 캐릭터들
- **용도**: 특별 페이지, 이벤트 페이지 등
- **크기**: 용도에 따라 조정
- **형식**: PNG, JPG, WebP

## 이미지 최적화

- **WebP 형식** 사용 권장 (용량 최적화)
- **투명 배경** PNG 사용 (로고용)
- **고해상도** 이미지 준비 (Retina 디스플레이 대응)

## 사용 예시

```jsx
<Image
  src="/character/youniqle-1.png"
  alt="Youniqle 대표 캐릭터"
  width={40}
  height={40}
  className="object-contain"
/>
```

