import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';

const products = [
    {
        name: '유니클 딥 슬립 디퓨저',
        slug: 'youniqle-deep-sleep-diffuser',
        price: 35000,
        stock: 100,
        category: 'SLEEP',
        status: 'active',
        approvalStatus: 'approved',
        summary: '천연 라벤더와 캐모마일 추출물로 신경을 이완시켜 깊고 편안한 수면을 유도합니다.',
        description: '유니클 딥 슬립 디퓨저는 현대인의 스트레스와 불면을 해결하기 위해 개발되었습니다.',
        images: [{ url: 'https://images.unsplash.com/photo-1608528577891-eb0559ec5e18?w=800&q=80' }]
    },
    {
        name: '리커버리 프로틴 쉐이크 (초코)',
        slug: 'recovery-protein-shake-choco',
        price: 45000,
        stock: 200,
        category: 'MEAL',
        status: 'active',
        approvalStatus: 'approved',
        summary: '손상된 근육 회복과 에너지 충전에 최적화된 고단백 쉐이크입니다.',
        description: '하루 한 포로 간편하게 단백질 25g을 보충하세요. 시술 후 회복에도 탁월합니다.',
        images: [{ url: 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=800&q=80' }]
    },
    {
        name: '유니클 밸런스 폼 롤러',
        slug: 'youniqle-balance-foam-roller',
        price: 28000,
        stock: 50,
        category: 'ACTIVITY',
        status: 'active',
        approvalStatus: 'approved',
        summary: '근막 이완과 자세 교정에 도움을 주는 고밀도 EVA 폼 롤러입니다.',
        description: '단단한 내구성으로 오래 사용해도 모양이 변하지 않는 최고급 폼 롤러입니다.',
        images: [{ url: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=800&q=80' }]
    },
    {
        name: '아쿠아 카밍 수분 크림',
        slug: 'aqua-calming-moisture-cream',
        price: 42000,
        stock: 150,
        category: 'SKIN',
        status: 'active',
        approvalStatus: 'approved',
        summary: '피부 진정과 붉은기 완화에 탁월한 시카 병풀 추출물 70% 함유 수분 크림',
        description: '피부과 시술 후 예민해진 피부에도 안심하고 사용할 수 있는 저자극 크림입니다.',
        images: [{ url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80' }]
    },
    {
        name: '프리미엄 바른 자세 방석',
        slug: 'premium-posture-cushion',
        price: 59000,
        stock: 80,
        category: 'SPACE',
        status: 'active',
        approvalStatus: 'approved',
        summary: '골반을 모아주고 척추를 세워주는 인체공학적 설계의 메모리폼 방석',
        description: '하루 8시간 이상 앉아있는 직장인과 학생들의 골반 틀어짐을 예방합니다.',
        images: [{ url: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=800&q=80' }]
    }
];

export async function GET() {
    try {
        await connectDB();
        await Product.deleteMany({ slug: { $in: products.map(p => p.slug) } });
        await Product.insertMany(products);
        return NextResponse.json({ success: true, message: 'Seeded dummy products' });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message });
    }
}
