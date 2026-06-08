export type Question = {
    id: number;
    text: string;
    type: 'EI' | 'SN' | 'TF' | 'JP' | 'OD' | 'SR' | 'PN' | 'WT'; // MBTI or Baumann
    options: [
        { text: string; value: string }, // value represents the trait code (e.g., 'E', 'O')
        { text: string; value: string }
    ];
};

export type ResultType = {
    code: string;
    title: string;
    description: string;
    traits: string[];
    partner?: string; // Best match
    enemy?: string; // Worst match
    recommend?: string; // Product recommendation
};

export type QuizCategory = {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    questions: Question[];
    results: Record<string, ResultType>; // Key is the 4-letter code
};

export const QUIZ_DATA: Record<string, QuizCategory> = {
    personality: {
        id: 'personality',
        title: '성격 유형 테스트',
        description: '나의 성격 유형을 알아보고 어울리는 회복 방법을 찾아보세요.',
        icon: '🧠',
        color: 'from-violet-500 to-purple-500',
        questions: [
            { id: 1, text: '휴일이 생겼을 때, 나는?', type: 'EI', options: [{ text: '친구들과 만나서 신나게 논다', value: 'E' }, { text: '집에서 혼자만의 시간을 즐긴다', value: 'I' }] },
            { id: 2, text: '새로운 사람을 만났을 때', type: 'EI', options: [{ text: '먼저 말을 걸고 분위기를 주도한다', value: 'E' }, { text: '상대방이 말 걸 때까지 기다린다', value: 'I' }] },
            { id: 3, text: '멍 때릴 때 하는 생각은?', type: 'SN', options: [{ text: '오늘 저녁 뭐 먹지? (현실적)', value: 'S' }, { text: '내가 만약 초능력이 생긴다면? (상상)', value: 'N' }] },
            { id: 4, text: '정보를 받아들일 때', type: 'SN', options: [{ text: '눈에 보이는 구체적인 사실 위주', value: 'S' }, { text: '전체적인 흐름과 의미 위주', value: 'N' }] },
            { id: 5, text: '친구가 우울해서 머리를 잘랐다고 한다면?', type: 'TF', options: [{ text: '왜 우울해? 무슨 일 있어?', value: 'T' }, { text: '헐 ㅠㅠ 기분 전환 됐어? 예쁘다!', value: 'F' }] },
            { id: 6, text: '의사 결정을 할 때', type: 'TF', options: [{ text: '논리적이고 객관적인 사실 기반', value: 'T' }, { text: '사람들과의 관계와 상황 고려', value: 'F' }] },
            { id: 7, text: '여행 계획을 짤 때', type: 'JP', options: [{ text: '분 단위로 철저하게 계획한다', value: 'J' }, { text: '큰 틀만 잡고 발길 닿는 대로', value: 'P' }] },
            { id: 8, text: '책상 정리 정돈 상태는?', type: 'JP', options: [{ text: '항상 깔끔하게 정돈되어 있다', value: 'J' }, { text: '어디에 뭐가 있는지만 알면 된다', value: 'P' }] },
        ],
        results: {
            'ESTJ': { code: 'ESTJ', title: '현실적인 관리자', description: '체계적이고 규칙을 준수하며 사실적 목표 설정을 선호합니다.', traits: ['책임감', '현실적', '리더십'], recommend: '플래너, 정리 용품' },
            'ESTP': { code: 'ESTP', title: '모험을 즐기는 사업가', description: '에너지가 넘치고 직관적이며 즉흥적인 도전을 즐깁니다.', traits: ['활동적', '유머', '적응력'], recommend: '스포츠 용품, 에너지 드링크' },
            'ESFJ': { code: 'ESFJ', title: '사교적인 외교관', description: '사람들에 대한 관심이 많고 친절하며 협조적입니다.', traits: ['친절', '봉사', '조화'], recommend: '파티 용품, 선물 세트' },
            'ENFJ': { code: 'ENFJ', title: '정의로운 사회운동가', description: '카리스마와 충만한 열정을 지닌 타고난 리더형입니다.', traits: ['언변', '공감', '리더십'], recommend: '자기계발서, 다이어리' },
            'ENFP': { code: 'ENFP', title: '재기발랄한 활동가', description: '창의적이며 항상 웃을 거리를 찾아다니는 활발한 성격입니다.', traits: ['창의적', '열정', '상상력'], recommend: '여행 용품, 카메라' },
            'ENTJ': { code: 'ENTJ', title: '대담한 통솔자', description: '대담하고 상상력이 풍부하며 강한 의지의 지도자입니다.', traits: ['결단력', '계획', '통솔'], recommend: '비즈니스 용품, 고급 필기구' },
            'ENTP': { code: 'ENTP', title: '뜨거운 논쟁을 즐기는 변론가', description: '지적인 도전을 두려워하지 않는 똑똑한 호기심형입니다.', traits: ['다재다능', '토론', '아이디어'], recommend: '퍼즐, 보드게임' },
            'ESFP': { code: 'ESFP', title: '자유로운 영혼의 연예인', description: '주위에 있으면 인생이 지루할 틈이 없을 정도로 즉흥적입니다.', traits: ['사교적', '낙천적', '센스'], recommend: '패션 아이템, 스피커' },
            'ISTJ': { code: 'ISTJ', title: '청렴결백한 논리주의자', description: '사실에 근거하여 사고하며 현실적이고 신중합니다.', traits: ['신중', '성실', '책임감'], recommend: '수납 정리함, 시계' },
            'ISFJ': { code: 'ISFJ', title: '용감한 수호자', description: '소중한 이들을 수호하는 데 심혈을 기울이는 성실한 방어자입니다.', traits: ['헌신', '인내', '배려'], recommend: '힐링 티 세트, 향초' },
            'ISTP': { code: 'ISTP', title: '만능 재주꾼', description: '모든 종류의 도구를 자유자재로 다루는 장인입니다.', traits: ['손재주', '객관적', '관찰'], recommend: 'DIY 키트, 공구 세트' },
            'ISFP': { code: 'ISFP', title: '호기심 많은 예술가', description: '항상 새로운 것을 찾아 시도하거나 도전할 준비가 되어 있습니다.', traits: ['예술적', '온화', '겸손'], recommend: '미술 도구, LP판' },
            'INFJ': { code: 'INFJ', title: '선의의 옹호자', description: '조용하고 신비로우며 샘솟는 영감으로 타인에게 영향을 줍니다.', traits: ['통찰력', '독창적', '신념'], recommend: '명상 용품, 에세이' },
            'INTJ': { code: 'INTJ', title: '용의주도한 전략가', description: '상상력이 풍부하며 철두철미한 계획을 세우는 전략가입니다.', traits: ['분석적', '독립적', '논리'], recommend: '과학 서적, 체스' },
            'INFP': { code: 'INFP', title: '열정적인 중재자', description: '상냥한 성격과 이타주의적인 성향을 가지고 있습니다.', traits: ['낭만적', '이상주의', '예술'], recommend: '일기장, 감성 소품' },
            'INTP': { code: 'INTP', title: '논리적인 사색가', description: '지식을 끝없이 갈망하는 혁신적인 발명가형입니다.', traits: ['논리', '분석', '아이디어'], recommend: '과학 키트, IT 기기' },
        }
    },
    skin: {
        id: 'skin',
        title: '피부 타입 리듬체크 (Baumann)',
        description: '내 피부는 지성일까 건성일까? 정확한 피부 타입을 알아보세요.',
        icon: '✨',
        color: 'from-pink-400 to-rose-400',
        questions: [
            { id: 1, text: '세안 후 2~3시간 뒤 피부 상태는?', type: 'OD', options: [{ text: '번들거림이 심하다', value: 'O' }, { text: '당기거나 건조하다', value: 'D' }] },
            { id: 2, text: '사진을 찍으면 얼굴이 어떻게 나오나요?', type: 'OD', options: [{ text: '광이 나서 번들거린다', value: 'O' }, { text: '푸석해 보인다', value: 'D' }] },
            { id: 3, text: '새로운 화장품을 쓰면?', type: 'SR', options: [{ text: '자주 트러블이 생긴다', value: 'S' }, { text: '별 반응 없다', value: 'R' }] },
            { id: 4, text: '얼굴에 붉은 기가 있나요?', type: 'SR', options: [{ text: '자주 붉어진다', value: 'S' }, { text: '거의 그렇지 않다', value: 'R' }] },
            { id: 5, text: '여드름 자국이나 색소 침착이?', type: 'PN', options: [{ text: '오래 남고 잘 생긴다', value: 'P' }, { text: '금방 없어진다', value: 'N' }] },
            { id: 6, text: '야외 활동 후 피부색 변화는?', type: 'PN', options: [{ text: '검게 잘 탄다', value: 'P' }, { text: '빨개졌다가 돌아온다', value: 'N' }] },
            { id: 7, text: '눈가나 입가 잔주름이?', type: 'WT', options: [{ text: '눈에 띄게 있다', value: 'W' }, { text: '아직 탱탱하다', value: 'T' }] },
            { id: 8, text: '평소 자외선 차단제를?', type: 'WT', options: [{ text: '잘 안 바른다', value: 'W' }, { text: '꼼꼼히 바른다', value: 'T' }] },
        ],
        results: {
            // Representative types only for brevity (Logic needs to map combinations)
            'OSPW': { code: 'OSPW', title: '기름진 민감성 (OSPW)', description: '피지가 많고 민감하며, 색소 침착과 주름에 취약합니다.', traits: ['지성', '민감', '색소'], recommend: '진정 토너, 약산성 클렌저' },
            'DSPT': { code: 'DSPT', title: '건조한 민감성 (DSPT)', description: '건조하고 예민하지만 주름은 적은 편입니다.', traits: ['건성', '민감', '탄력'], recommend: '고보습 크림, 오일' },
            'ORNT': { code: 'ORNT', title: '축복받은 강철 피부 (ORNT)', description: '유수분 밸런스가 좋고 저항력이 강한 건강한 피부입니다.', traits: ['지성', '저항', '건강'], recommend: '가벼운 수분 크림' },
            'DRNW': { code: 'DRNW', title: '건조한 노화성 (DRNW)', description: '건조하고 주름이 생기기 쉬워 안티에이징이 필요합니다.', traits: ['건성', '주름', '저항'], recommend: '탄력 크림, 아이크림' },
            // Fallback for combinations not listed (will use closest match logic in component)
            'DEFAULT': { code: '???', title: '복합성 피부', description: '다양한 특성이 섞여 있는 피부입니다. 밸런스 케어가 필요합니다.', traits: ['복합', '관리필요'], recommend: '밸런싱 토너' }
        }
    }
};
