import { NextRequest, NextResponse } from 'next/server';
import { GeminiAIEngine } from '@/lib/ai/gemini-engine';

// 16개 정밀 기본 문항 (Fallback 및 Base)
const BASE_QUESTIONS = [
    {
        id: 'p1', category: '신체', text: '아침에 일어났을 때 몸의 무게감이 어느 정도인가요?', options: [
            { label: '매우 가볍고 개운하다', score: 10 },
            { label: '보통이며 일상에 지장 없다', score: 7 },
            { label: '약간 무겁고 찌릿한 느낌이 있다', score: 4 },
            { label: '납덩어리를 매단 듯이 무겁다', score: 1 }
        ]
    },
    {
        id: 'p2', category: '신체', text: '최근 목, 어깨, 혹은 허리에 만성적인 통증이 있나요?', options: [
            { label: '전혀 없다', score: 10 },
            { label: '가끔 뻐근한 정도다', score: 7 },
            { label: '자주 통증을 느끼며 신경 쓰인다', score: 4 },
            { label: '매일 통증이 심해 일상이 힘들다', score: 1 }
        ]
    },
    {
        id: 'p3', category: '신체', text: '계단을 오르거나 빠르게 걸을 때 숨이 차는 정도는?', options: [
            { label: '전혀 숨차지 않고 에너지가 넘친다', score: 10 },
            { label: '약간 숨차지만 금방 회복된다', score: 7 },
            { label: '숨이 많이 차고 회복에 시간이 걸린다', score: 4 },
            { label: '조금만 움직여도 숨이 턱 끝까지 차오른다', score: 1 }
        ]
    },
    {
        id: 'p4', category: '신체', text: '눈이 침침하거나 만성적인 안구 건조를 느끼나요?', options: [
            { label: '전혀 느끼지 않는다', score: 10 },
            { label: '장시간 모니터 볼 때만 가끔 그렇다', score: 7 },
            { label: '자주 충혈되고 건조함이 느껴진다', score: 4 },
            { label: '항상 눈이 뻑뻑하고 통증이 있다', score: 1 }
        ]
    },
    {
        id: 'm1', category: '심리', text: '사소한 일에도 감정이 예민해지거나 짜증이 나나요?', options: [
            { label: '천하태평, 평정심을 유지한다', score: 10 },
            { label: '가끔 스트레스 상황에서만 그렇다', score: 7 },
            { label: '자주 감정 기복을 조절하기 힘들다', score: 4 },
            { label: '매우 예민하고 통제 불능 상태다', score: 1 }
        ]
    },
    {
        id: 'm2', category: '심리', text: '업무나 학습 시 집중력이 유지되는 시간은?', options: [
            { label: '2시간 이상 몰입 가능하다', score: 10 },
            { label: '1시간 정도는 거뜬하다', score: 7 },
            { label: '30분도 집중하기 힘들어 잡생각이 난다', score: 4 },
            { label: '단 5분도 몰입하기가 불가능하다', score: 1 }
        ]
    },
    {
        id: 'm3', category: '심리', text: '무엇인가 새로운 것을 시작할 때의 의욕은?', options: [
            { label: '호기심이 넘치고 의욕이 앞선다', score: 10 },
            { label: '흥미가 생기면 열심히 하려 한다', score: 7 },
            { label: '해야 한다는 건 알지만 몸이 안 움직인다', score: 4 },
            { label: '만사가 귀찮고 아무것도 하기 싫다', score: 1 }
        ]
    },
    {
        id: 'm4', category: '심리', text: '미래에 대한 불안감이나 막연한 걱정이 드나요?', options: [
            { label: '차근차근 준비하고 있어 걱정 없다', score: 10 },
            { label: '가끔 고민에 빠지지만 금방 털어낸다', score: 7 },
            { label: '잠들기 전 불쑥불쑥 불안감이 찾아온다', score: 4 },
            { label: '항상 불안과 걱정에 시달려 무기력하다', score: 1 }
        ]
    },
    {
        id: 'l1', category: '생활습관', text: '하루에 물(순수 생수)을 얼마나 마시나요?', options: [
            { label: '2L 이상 충분히 마신다', score: 10 },
            { label: '1L 이상은 꾸준히 마신다', score: 7 },
            { label: '생각날 때만 한두 잔 마신다', score: 4 },
            { label: '커피나 음료 외에는 거의 안 마신다', score: 1 }
        ]
    },
    {
        id: 'l2', category: '생활습관', text: '식사 시간의 규칙성은 어느 정도인가요?', options: [
            { label: '일정한 시간에 균형 잡힌 식사를 한다', score: 10 },
            { label: '대체로 시간을 지키려 노력한다', score: 7 },
            { label: '업무에 따라 불규칙하게 식사한다', score: 4 },
            { label: '항상 폭식하거나 끼니를 거르기 일쑤다', score: 1 }
        ]
    },
    {
        id: 'l3', category: '생활습관', text: '주중 운동(땀 흘릴 정도) 횟수는?', options: [
            { label: '4회 이상 꾸준히 운동한다', score: 10 },
            { label: '2-3회 정도 가볍게 운동한다', score: 7 },
            { label: '주 1회 겨우 시간을 낸다', score: 4 },
            { label: '한 달에 한 번도 운동하지 않는다', score: 1 }
        ]
    },
    {
        id: 's1', category: '수면', text: '잠자리에 들어 실제 잠들기까지 걸리는 시간은?', options: [
            { label: '15분 이내로 바로 잠든다', score: 10 },
            { label: '30분 정도 뒤척이다 잠든다', score: 7 },
            { label: '1시간 이상 잠이 안 와 힘들다', score: 4 },
            { label: '거의 밤을 지새우는 날이 많다', score: 1 }
        ]
    }
];

const WEEKDAY_THEMES: Record<string, string> = {
    '월요일': '새로운 시작, 한 주를 여는 활기찬 회복 에너지 체크',
    '화요일': '안정된 루틴, 일상의 밸런스를 찾아가는 중반 점검',
    '수요일': '중간 지점, 쌓인 피로를 해소하고 에너지를 재충전하는 시간',
    '목요일': '주말을 향한 준비, 지친 몸과 마음을 다독이는 차분한 관리',
    '금요일': '한 주 마무리, 성취감과 함께 주말의 완벽한 휴식을 위한 체크',
    '토요일': '자유로운 휴식, 온전히 나 자신에게 집중하는 깊은 이완',
    '일요일': '평온한 준비, 새로운 내일을 위해 몸의 리듬을 정돈하는 시간'
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userName } = body;

        const now = new Date();
        const dayOfWeek = now.toLocaleDateString('ko-KR', { weekday: 'long' });
        const theme = WEEKDAY_THEMES[dayOfWeek] || '일상의 회복';

        // Gemini를 통해 질문 변주 생성 (타임아웃 10초 설정)
        const dynamicQuestions = await Promise.race([
            GeminiAIEngine.paraphrasePrecisionQuestions(
                BASE_QUESTIONS,
                dayOfWeek,
                theme,
                userName
            ),
            new Promise<any[]>((_, reject) => 
                setTimeout(() => reject(new Error('AI Paraphrasing Timeout')), 10000)
            )
        ]).catch(err => {
            console.warn(`[API] Paraphrasing failed or timed out: ${err.message}. Using base questions.`);
            return BASE_QUESTIONS;
        });

        return NextResponse.json({
            theme: `${dayOfWeek}의 테마: ${theme}`,
            questions: dynamicQuestions
        });
    } catch (error: any) {
        console.error('Dynamic Questions API Error:', error);
        return NextResponse.json({ questions: BASE_QUESTIONS }, { status: 200 }); // 에러 시 기본 문항 반환
    }
}
