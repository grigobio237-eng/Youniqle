import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PavilionFloor from '@/models/PavilionFloor';

const INITIAL_DATA = [
    {
        floor: 1,
        owners: [
            {
                id: 'artist-a', name: 'Master A', role: 'Media Artist', bio: '디지털 생명력과 회복의 메시지를 담는 미디어 아트의 거장입니다.',
                items: [
                    { id: 'art-a1', type: 'ARTWORK', title: 'Eternal Recovery I', description: '영원한 회복의 첫 번째 전조를 시각화한 대작입니다.', specs: { size: '250x250cm', medium: 'Digital mix' }, price: '₩25,000,000', rental: '₩1,200,000' },
                    { id: 'art-a2', type: 'ARTWORK', title: 'Soul Resonance', description: '영혼의 공명을 담은 위치 가변형 작품입니다.', specs: { size: '180x210cm', medium: 'NFT Board' }, price: '₩18,000,000', rental: '₩800,000' },
                ]
            },
            {
                id: 'artist-b', name: 'Master B', role: 'Digital Sculptor', bio: '가상 공간에서의 형태와 질감을 재정의하는 디지털 조각가입니다.',
                items: [
                    { id: 'art-b1', type: 'ARTWORK', title: 'Virtual Form', description: '가상 세계의 본질을 담은 조각 작품입니다.', specs: { platform: 'Unity 3D' }, price: '₩12,000,000' },
                ]
            }
        ]
    },
    {
        floor: 2,
        owners: [
            {
                id: 'shop-a', name: 'Elena Vance', role: 'Luxury Curator', bio: '전 세계 최상위 1%를 위한 회복 솔루션 아이템을 큐레이션합니다.',
                items: [
                    { id: 'shop-p1', type: 'PRODUCT', title: 'Nano-Ceramic Kit', description: '스위스 연구소의 기술력이 집약된 세포 재생 홈케어 시스템입니다.', specs: { tech: 'Nano-Cell' }, price: '₩3,500,000' },
                ]
            }
        ]
    },
    {
        floor: 3,
        owners: [
            {
                id: 'coach-a', name: 'Coach Leon', role: 'Performance specialist', bio: '국가대표 선수들의 컨디셔닝을 담당하는 신체 회복 전문가입니다.',
                items: [
                    { id: 'coach-c1', type: 'COACHING', title: 'Neuro-Muscle Reset', description: '신경계와 근육의 조화를 되찾아주는 1:1 리셋 프로그램입니다.', specs: { duration: '90min' }, price: '₩450,000' },
                ]
            }
        ]
    },
    {
        floor: 4,
        owners: [
            {
                id: 'med-a', name: 'Dr. Sarah', role: 'Medical Director', bio: '유전자 분석 기반의 정밀 의료 솔루션을 제공하는 의학 박사입니다.',
                items: [
                    { id: 'med-m1', type: 'MEDICAL', title: 'Genome Recovery Plan', description: '유전자 분석을 통해 설계된 개인맞춤형 재생 치료 플랜입니다.', specs: { analysis: 'Whole Genome' }, price: '₩12,000,000' },
                ]
            }
        ]
    },
    {
        floor: 5,
        owners: [
            {
                id: 'omakase-master', name: 'The Orchestrator', role: 'Custom Architect', bio: '당신만의 완벽한 회복 여정을 위한 모든 아이템을 조율합니다.',
                items: [
                    { id: 'omakase-o1', type: 'OMAKASE', title: 'Ultimate Recovery Suite', description: '1~4층의 모든 혜택이 집약된 단 하나의 맞춤형 패키지입니다.', specs: { customization: 'Full-Range' }, price: 'Custom Quote' },
                ]
            }
        ]
    }
];

export async function GET() {
    try {
        await connectDB();

        let data = await PavilionFloor.find().sort({ floor: 1 });

        // Auto-initialize if empty
        if (data.length === 0) {
            await PavilionFloor.insertMany(INITIAL_DATA);
            data = await PavilionFloor.find().sort({ floor: 1 });
        }

        // Convert to Record<number, FloorOwner[]> for compatibility with current frontend
        const pavilionData: Record<number, any[]> = {};
        data.forEach((f: any) => {
            pavilionData[f.floor] = f.owners;
        });

        return NextResponse.json(pavilionData);
    } catch (error) {
        console.error('Fetch Pavilion error:', error);
        return NextResponse.json({ error: 'Failed to fetch pavilion data' }, { status: 500 });
    }
}
