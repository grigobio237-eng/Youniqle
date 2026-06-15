import { Metadata } from 'next';
import DashboardClient from './DashboardClient';

export const metadata: Metadata = {
  title: '회복 대시보드｜나의 리듬 변화 & 종합 컨디션 분석',
  description: '60초 리듬체크 및 웨어러블 분석 데이터를 바탕으로 신체 피로, 수면 패턴, 정신 스트레스를 모니터링하고 개인화된 건강 흐름을 확인해 보세요.',
};

export default function DashboardPage() {
  return <DashboardClient />;
}
