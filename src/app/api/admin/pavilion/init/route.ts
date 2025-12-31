import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PavilionFloor from '@/models/PavilionFloor';
import { withAdminAuth } from '@/lib/authMiddleware';

const INITIAL_PAVILION_DATA = [
    {
        floor: 1, // Art Gallery
        owners: [
            {
                id: 'artist-a',
                name: 'Master A',
                role: 'Media Artist',
                bio: '디지털 생명력과 회복의 메시지를 담는 미디어 아트의 거장입니다.',
                items: [
                    { id: 'art-a1', type: 'ARTWORK', title: 'Eternal Recovery I', description: '영원한 회복의 첫 번째 전조를 시각화한 대작입니다.', specs: { size: '250x250cm', medium: 'Digital mix' }, price: '₩25,000,000', rental: '₩1,200,000' },
                    { id: 'art-a2', type: 'ARTWORK', title: 'Soul Resonance', description: '영혼의 공명을 담은 위치 가변형 작품입니다.', specs: { size: '180x210cm', medium: 'NFT Board' }, price: '₩18,000,000', rental: '₩800,000' },
                    { id: 'art-a3', type: 'ARTWORK', title: 'Flow of Vitality', description: '생명력의 흐름을 유기적인 곡선으로 표현한 디지털 캔버스입니다.', specs: { size: '120x120cm', medium: 'LED Matrix' }, price: '₩12,500,000', rental: '₩500,000' },
                ]
            },
            {
                id: 'artist-b',
                name: 'Master B',
                role: 'Digital Sculptor',
                bio: '가상 공간에서의 형태와 질감을 재정의하는 디지털 조각가입니다.',
                items: [
                    { id: 'art-b1', type: 'ARTWORK', title: 'Virtual Form', description: '가상 세계의 본질을 담은 조각 작품입니다.', specs: { platform: 'Unity 3D', format: 'Interactive' }, price: '₩12,000,000' },
                    { id: 'art-b2', type: 'ARTWORK', title: 'Cybernetic Anatomy', description: '인간과 기계의 융합을 탐구하는 디지털 정밀 조형물입니다.', specs: { format: 'USDZ', textures: '8K PBR' }, price: '₩15,500,000' },
                ]
            },
            {
                id: 'artist-c',
                name: 'Master C',
                role: 'Abstract Painter',
                bio: '무의식의 흐름을 강렬한 색채로 표현하는 추상화가입니다.',
                items: [
                    { id: 'art-c3', type: 'ARTWORK', title: 'Chaos & Order', description: '혼돈 속에서 발견하는 회복의 질서입니다.', specs: { material: 'Oil on Canvas', size: '150x150cm' }, price: '₩30,000,000' },
                    { id: 'art-c4', type: 'ARTWORK', title: 'Ethereal Calm', description: '깊은 명상 상태에서 영감을 얻은 평온한 색채의 정수입니다.', specs: { material: 'Acrylic on Linen', size: '200x200cm' }, price: '₩22,000,000' },
                ]
            }
        ]
    },
    {
        floor: 2, // Prestige Shop
        owners: [
            {
                id: 'shop-a',
                name: 'Elena Vance',
                role: 'Luxury Curator',
                bio: '전 세계 최상위 1%를 위한 회복 솔루션 아이템을 큐레이션합니다.',
                items: [
                    { id: 'shop-p1', type: 'PRODUCT', title: 'Nano-Ceramic Kit', description: '스위스 연구소의 기술력이 집약된 세포 재생 홈케어 시스템입니다.', specs: { tech: 'Nano-Cell', origin: 'Switzerland' }, price: '₩3,500,000' },
                    { id: 'shop-p2', type: 'PRODUCT', title: 'Obsidian Diffuser', description: '심신 안정을 돕는 아이슬란드산 고밀도 흑요석 디퓨저 세트입니다.', specs: { material: 'Volcanic Rock', scent: 'Deep Forest' }, price: '₩850,000' },
                    { id: 'shop-p3', type: 'PRODUCT', title: 'Silk Sleep Aura', description: '숙면을 위한 100% 최고급 실크 및 은 이온 항균 처리 침구 세트입니다.', specs: { material: 'Mulberry Silk', tech: 'Silver Ion' }, price: '₩2,100,000' },
                ]
            },
            {
                id: 'shop-b',
                name: 'Tech Master X',
                role: 'Bio-Hacking Specialist',
                bio: '최첨단 바이오 해킹 디바이스를 통해 신체 기능을 최적화합니다.',
                items: [
                    { id: 'shop-p4', type: 'PRODUCT', title: 'Neural Sync Headset', description: '뇌파를 동기화하여 순식간에 깊은 휴식 상태로 유도하는 헤드셋입니다.', specs: { sensor: 'Dry EEG', channels: '16' }, price: '₩4,800,000' },
                    { id: 'shop-p5', type: 'PRODUCT', title: 'Oxygen Infusion Chamber', description: '고농도 산소 공급을 통해 빠른 피로 회복을 돕는 개인용 챔버입니다.', specs: { pressure: '1.5 ATA', oxygen: '95%' }, price: '₩15,000,000' },
                ]
            }
        ]
    },
    {
        floor: 3, // Dynamic Coaching
        owners: [
            {
                id: 'coach-a',
                name: 'Coach Leon',
                role: 'Performance specialist',
                bio: '국가대표 선수들의 컨디셔닝을 담당하는 신체 회복 전문가입니다.',
                items: [
                    { id: 'coach-c1', type: 'COACHING', title: 'Neuro-Muscle Reset', description: '신경계와 근육의 조화를 되찾아주는 1:1 리셋 프로그램입니다.', specs: { duration: '90min', level: 'Professional' }, price: '₩450,000 / Session' },
                    { id: 'coach-c2', type: 'COACHING', title: 'Mobility Flow VR', description: 'VR 환경에서 진행되는 맞춤형 가동성 향상 코칭입니다.', specs: { tech: 'VR-Track', focus: 'Mobility' }, price: '₩1,200,000 / 10회' },
                ]
            },
            {
                id: 'coach-b',
                name: 'Mind Master J',
                role: 'Mental Health Coach',
                bio: '고도의 집중력과 멘탈 회복을 돕는 정석 멘탈 코치입니다.',
                items: [
                    { id: 'coach-c3', type: 'COACHING', title: 'Zen Focus Strategy', description: '비즈니스 리더들을 위한 고도의 집중력 유지 및 스트레스 관리 전략입니다.', specs: { duration: '60min', sessions: 'Monthly' }, price: '₩800,000' },
                    { id: 'coach-c4', type: 'COACHING', title: 'Breath Control Master', description: '호흡법을 통한 자율신경계 조절 및 불안 해소 프로그램입니다.', specs: { focus: 'Breathing', level: 'All-Levels' }, price: '₩300,000' },
                ]
            }
        ]
    },
    {
        floor: 4, // Medical Archive
        owners: [
            {
                id: 'med-a',
                name: 'Dr. Sarah',
                role: 'Medical Director',
                bio: '유전자 분석 기반의 정밀 의료 솔루션을 제공하는 의학 박사입니다.',
                items: [
                    { id: 'med-m1', type: 'MEDICAL', title: 'Genome Recovery Plan', description: '유전자 분석을 통해 설계된 개인맞춤형 재생 치료 플랜입니다.', specs: { analysis: 'Whole Genome', duration: '3 Months' }, price: '₩12,000,000' },
                    { id: 'med-m2', type: 'MEDICAL', title: 'IV Nutrient Infusion', description: '세포 활성화를 위한 고농축 영양 수액 테라피입니다.', specs: { type: 'Intravenous', effect: 'Cellular Regen' }, price: '₩350,000' },
                ]
            },
            {
                id: 'med-b',
                name: 'Dr. Kim',
                role: 'Longevity Researcher',
                bio: '항노화 및 장수 과학을 전문으로 하는 내과 전문의입니다.',
                items: [
                    { id: 'med-m3', type: 'MEDICAL', title: 'Anti-Aging Protocol', description: '텔로미어 관리 및 생체 시계를 되돌리는 의학적 가이드를 제공합니다.', specs: { focus: 'Telomeres', cycles: '6 Months' }, price: '₩25,000,000' },
                    { id: 'med-m4', type: 'MEDICAL', title: 'Metabolic Detox', description: '대사 기능을 정상화하고 체내 독소를 제거하는 집중 케어입니다.', specs: { program: '7 Days Detox', monitor: '24/7' }, price: '₩1,800,000' },
                ]
            }
        ]
    },
    {
        floor: 5, // Omakase Suite
        owners: [
            {
                id: 'omakase-master',
                name: 'The Orchestrator',
                role: 'Custom Architect',
                bio: '당신만의 완벽한 회복 여정을 위한 모든 아이템을 조율합니다.',
                items: [
                    { id: 'omakase-o1', type: 'OMAKASE', title: 'Ultimate Recovery Suite', description: '1~4층의 모든 혜택이 집약된 단 하나의 맞춤형 패키지입니다.', specs: { customization: 'Full-Range', concierge: '24/7' }, price: 'Custom Quote' },
                    { id: 'omakase-o2', type: 'OMAKASE', title: 'Executive Wellness Pass', description: '핵심 케어 요소만 엄선하여 바쁜 경영진을 위해 설계된 집중 패키지입니다.', specs: { quick: 'Yes', quality: 'Top-Tier' }, price: '₩80,000,000' },
                ]
            }
        ]
    }
];

async function initPavilionHandler() {
    try {
        await connectDB();

        // Clear existing data (optional, but good for fresh start)
        await PavilionFloor.deleteMany({});

        // Insert initial data
        await PavilionFloor.insertMany(INITIAL_PAVILION_DATA);

        return NextResponse.json({ success: true, message: 'Pavilion data initialized successfully.' });
    } catch (error) {
        console.error('Init Pavilion error:', error);
        return NextResponse.json({ success: false, error: 'Failed to initialize pavilion data.' }, { status: 500 });
    }
}

export const POST = withAdminAuth(initPavilionHandler);
