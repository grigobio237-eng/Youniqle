import { Metadata } from 'next';
import ReportsClient from './ReportsClient';

export const metadata: Metadata = {
  title: '나의 회복 리포트｜유니클 종합 웰니스 분석서',
  description: '데일리 리듬체크, 정밀 회복 문진, 이미지 스캔 등 유니클 웰니스 엔진이 분석한 통합 회복 리포트와 개인화된 솔루션을 한눈에 확인해 보세요.',
};

export default function ReportsHubPage() {
  return <ReportsClient />;
}
