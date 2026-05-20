import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // role param을 쿼리로 임시로 받아서 테스트하기 위함 (실제로는 session.user.footballRole 사용)
    const { searchParams } = new URL(req.url);
    const roleParam = searchParams.get('role');
    const role = roleParam || session?.user?.footballRole || 'player'; 

    let nudges = [];

    // 코치 권한의 넛지 (부상 알림 포함)
    if (role === 'coach') {
      nudges.push({
        id: 'c-1',
        type: 'INJURY_RISK',
        title: '[위험 감지] 이태양 선수 우측 무릎 과부하 예상',
        message: 'ACWR 1.8 초과. 오늘 훈련 강도 조절이 필요합니다.'
      });
      nudges.push({
        id: 'c-2',
        type: 'MEAL_PLAN',
        title: '금요일 경기를 위한 팀 전체 식단 가이드 배포 완료',
        message: '토요일 저녁으로 설정된 자동 발행 식단입니다.'
      });
      nudges.push({
        id: 'c-3',
        type: 'MENTAL_CARE',
        title: '[집중 케어] 김민수 선수 번아웃 징후 포착',
        message: '스트레스 지수가 높게 유지되고 있습니다. 개인 면담을 권장합니다.'
      });
    } 
    // 부모/보호자 권한의 넛지 (부상 알림 제외)
    else if (role === 'guardian') {
      nudges.push({
        id: 'g-1',
        type: 'MEAL_PLAN',
        title: '목요일 저녁 추천 식단: 파스타 또는 쌀밥',
        message: '내일 경기를 위한 탄수화물 로딩 식단을 챙겨주세요.'
      });
      nudges.push({
        id: 'g-2',
        type: 'MENTAL_CARE',
        title: '아이의 심리적 안정 케어 필요',
        message: '최근 보이지 않는 심리적 압박감을 느끼고 있을 수 있습니다. 성적보다는 과정에 대한 칭찬을 건네어 보세요.'
      });
    } 
    // 선수 권한의 넛지 (부상 알림 제외)
    else {
      nudges.push({
        id: 'p-1',
        type: 'MEAL_PLAN',
        title: '내일은 고강도 인터벌 훈련이 있습니다!',
        message: '오늘 저녁 식사로 단백질을 평소보다 1.5배 섭취하세요.'
      });
      nudges.push({
        id: 'p-2',
        type: 'MENTAL_CARE',
        title: '유니클이 추천하는 5분 이완 호흡법',
        message: '최근 긴장감이 높아 보이네요. 잠들기 전 심호흡 루틴을 해보는 건 어떨까요?'
      });
    }

    return NextResponse.json({ success: true, data: nudges });

  } catch (error: any) {
    console.error('Failed to fetch nudges:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
