import { Metadata } from 'next';
import FootballMyPageClient from './FootballMyPageClient';

export const metadata: Metadata = {
  title: '팀 스포츠 클럽하우스｜유니클 스포츠 웰니스 관리',
  description: '유소년부터 프로, 동호회까지 모든 스포츠 팀을 위한 최적의 웰니스 및 컨디션 관리 솔루션. 감독/코치의 팀원 관리부터 선수 및 보호자의 데일리 리듬체크, 분석 리포트를 한 곳에서 제공합니다.',
};

export default function FootballMyPage() {
  return <FootballMyPageClient />;
}
