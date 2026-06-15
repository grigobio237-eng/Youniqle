import { Metadata } from 'next';
import DiagnosisClient from './DiagnosisClient';

export const metadata: Metadata = {
  title: '오늘의 리듬체크｜60초 웰니스 측정 & 피로·스트레스 진단',
  description: '피로, 수면, 스트레스, 라이프스타일을 60초 만에 측정하고 나에게 필요한 회복 리듬을 진단해 보세요.',
};

export default function DiagnosisPage() {
  return <DiagnosisClient />;
}
