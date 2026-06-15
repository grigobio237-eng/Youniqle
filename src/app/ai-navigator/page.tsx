import { Metadata } from 'next';
import AiNavigatorClient from './AiNavigatorClient';

export const metadata: Metadata = {
  title: 'AI 회복 내비게이터｜나를 위한 맞춤 회복 루틴 및 예보',
  description: '실시간 수집된 리듬체크 데이터와 유니클 기반 분석을 활용하여 오늘과 내일의 맞춤형 일상 루틴과 건강 가이드를 확인하세요.',
};

export default function AiNavigatorPage() {
  return <AiNavigatorClient />;
}
