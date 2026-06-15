import { Metadata } from 'next';
import HealingCenterClient from './HealingCenterClient';

export const metadata: Metadata = {
  title: '프라이빗 힐링 라운지｜맞춤형 회복 케어 & 컨시어지 서비스',
  description: '김미정 원장의 1:1 맞춤형 회복 설계 철학과 프로토콜을 바탕으로 신체 활력 회복을 극대화하는 프라이빗 힐링 라운지의 독점 솔루션을 만나보세요.',
};

export default function HealingCenterPage() {
  return <HealingCenterClient />;
}
