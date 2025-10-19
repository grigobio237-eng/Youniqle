const { WebSocketServer } = require('ws');

// AI 응답 시뮬레이션 함수
function generateAIResponse(userMessage) {
  const message = userMessage.toLowerCase();
  
  // 홈페이지 목적 관련 질문
  if (message.includes('홈페이지') || message.includes('홈피') || message.includes('목적') || message.includes('만들어진')) {
    return "Youniqle은 프리미엄 온라인 쇼핑 플랫폼입니다. 고품질 상품을 합리적인 가격에 제공하여 고객들에게 특별한 쇼핑 경험을 선사하는 것이 주요 목적입니다. AI 기반 개인화 추천 시스템과 실시간 고객 지원을 통해 최고의 서비스를 제공합니다.";
  }
  
  // AI 기능 관련 질문
  if (message.includes('ai') || message.includes('알려줄') || message.includes('도와') || message.includes('기능')) {
    return "저는 Youniqle의 AI 어시스턴트입니다! 다음과 같은 도움을 드릴 수 있습니다:\n\n• 상품 추천 및 검색 도움\n• 주문 및 배송 문의 처리\n• 기술 지원 및 문제 해결\n• 개인화된 쇼핑 조언\n• 실시간 고객 서비스\n\n무엇을 도와드릴까요?";
  }
  
  // 상품 관련 질문
  if (message.includes('상품') || message.includes('쇼핑') || message.includes('구매')) {
    return "Youniqle에서는 다양한 프리미엄 상품을 만나보실 수 있습니다:\n\n• 패션 및 액세서리\n• 전자제품 및 가전\n• 홈 & 리빙\n• 뷰티 & 헬스\n• 스포츠 & 아웃도어\n\n개인화된 추천을 받고 싶으시면 관심 카테고리를 알려주세요!";
  }
  
  // 가격 관련 질문
  if (message.includes('가격') || message.includes('비싸') || message.includes('저렴') || message.includes('할인')) {
    return "Youniqle은 고품질 상품을 합리적인 가격에 제공합니다:\n\n• 경쟁력 있는 가격 정책\n• 정기적인 할인 이벤트\n• 회원 전용 특가 상품\n• 무료배송 서비스\n• 30일 무료반품 보장\n\n특별 할인 정보는 이메일로 받아보실 수 있습니다!";
  }
  
  // 배송 관련 질문
  if (message.includes('배송') || message.includes('언제') || message.includes('받을')) {
    return "Youniqle의 배송 서비스:\n\n• 전국 무료배송 (3만원 이상)\n• 당일배송 (서울 일부 지역)\n• 1-2일 배송 (전국)\n• 안전한 포장 및 배송\n• 실시간 배송 추적\n\n배송 문의사항이 있으시면 주문번호를 알려주세요!";
  }
  
  // 기본 응답
  return "안녕하세요! Youniqle AI 어시스턴트입니다. 상품, 주문, 배송, 할인 등에 대해 궁금한 것이 있으시면 언제든 말씀해주세요. 구체적인 질문을 해주시면 더 정확한 답변을 드릴 수 있습니다!";
}

// WebSocket 서버 시작
const wss = new WebSocketServer({ port: 3001 });

console.log('🤖 AI WebSocket 서버 시작: ws://localhost:3001');

wss.on('connection', (ws) => {
  console.log('✅ 클라이언트 연결됨');
  
  // 연결 시 환영 메시지
  ws.send(JSON.stringify({
    type: 'connection',
    content: '안녕하세요! Youniqle AI 어시스턴트입니다. 무엇을 도와드릴까요?',
    timestamp: new Date().toISOString()
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('📨 수신:', data.content);
      
      // AI 응답 생성
      const aiResponse = generateAIResponse(data.content);
      
      // 응답 전송
      ws.send(JSON.stringify({
        type: 'ai_response',
        content: aiResponse,
        timestamp: new Date().toISOString()
      }));
      
      console.log('🤖 AI 응답 전송 완료');
      
    } catch (error) {
      console.error('❌ 메시지 처리 오류:', error);
      ws.send(JSON.stringify({
        type: 'error',
        content: '죄송합니다. 메시지를 처리하는 중 오류가 발생했습니다.',
        timestamp: new Date().toISOString()
      }));
    }
  });

  ws.on('close', () => {
    console.log('❌ 클라이언트 연결 종료');
  });

  ws.on('error', (error) => {
    console.error('❌ WebSocket 오류:', error);
  });
});

console.log('🚀 AI WebSocket 서버가 준비되었습니다!');




