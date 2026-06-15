import { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: '유니클 Youniqle｜개인 맞춤형 웰니스 & 회복 라이프스타일',
  description: '60초 리듬체크를 통해 나의 회복 점수와 밸런스를 측정하고, 데이터 기반 맞춤형 웰니스 케어 솔루션과 일상 속 회복 프로토콜을 경험하세요.',
};

export default function HomePage() {
  return <HomeClient />;
}
