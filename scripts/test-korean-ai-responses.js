/**
 * AI 챗봇 한국어 응답 테스트 스크립트
 * 
 * 사용법:
 * node scripts/test-korean-ai-responses.js
 */

const testCases = [
  {
    name: "배송 정보 문의",
    query: "배송 정보에 대해 알려주세요",
    context: "배송은 전국 무료배송이며, 2-3일 내에 배송됩니다.",
    expectedKeywords: ["배송", "무료", "2-3일"]
  },
  {
    name: "반품 정책 문의",
    query: "반품은 어떻게 하나요?",
    context: "구매 후 7일 이내 반품 가능합니다. 단, 상품 택이 제거되지 않아야 합니다.",
    expectedKeywords: ["반품", "7일", "가능"]
  },
  {
    name: "결제 방법 문의",
    query: "결제 방법은 무엇이 있나요?",
    context: "신용카드, 계좌이체, 카카오페이, 네이버페이를 지원합니다.",
    expectedKeywords: ["결제", "신용카드", "카카오페이"]
  },
  {
    name: "포인트 적립 문의",
    query: "포인트는 어떻게 적립되나요?",
    context: "구매 금액의 5%가 자동으로 포인트로 적립됩니다.",
    expectedKeywords: ["포인트", "5%", "적립"]
  },
  {
    name: "회원 등급 문의",
    query: "회원 등급 혜택이 뭔가요?",
    context: "CEDAR, ROOTER, BLOOMER, GLOWER, ECOSOUL 5단계로 나뉘며, 등급별로 할인율이 다릅니다.",
    expectedKeywords: ["등급", "혜택", "할인"]
  }
];

/**
 * n8n 워크플로우 호출 함수
 */
async function testKoreanResponse(query, context) {
  try {
    // n8n 워크플로우 webhook URL (실제 URL로 변경 필요)
    const webhookUrl = "http://localhost:5678/webhook/ai-chat";
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_query: query,
        context: context
      })
    });

    const data = await response.json();
    return data.response || data.output || "";
  } catch (error) {
    console.error("Error calling n8n:", error);
    return null;
  }
}

/**
 * 한국어 응답 검증
 */
function validateKoreanResponse(response, expectedKeywords) {
  const results = {
    isKorean: false,
    koreanRatio: 0,
    hasKeywords: false,
    matchedKeywords: [],
    englishRatio: 0,
    quality: "FAIL"
  };

  if (!response) {
    return results;
  }

  // 한글 비율 계산
  const koreanChars = (response.match(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g) || []).length;
  const englishChars = (response.match(/[a-zA-Z]/g) || []).length;
  const totalChars = response.length;

  results.koreanRatio = (koreanChars / totalChars) * 100;
  results.englishRatio = (englishChars / totalChars) * 100;
  results.isKorean = results.koreanRatio > 50; // 50% 이상이면 한국어로 판정

  // 키워드 매칭
  results.matchedKeywords = expectedKeywords.filter(keyword => 
    response.includes(keyword)
  );
  results.hasKeywords = results.matchedKeywords.length > 0;

  // 품질 평가
  if (results.koreanRatio > 80 && results.hasKeywords) {
    results.quality = "EXCELLENT";
  } else if (results.koreanRatio > 60 && results.hasKeywords) {
    results.quality = "GOOD";
  } else if (results.koreanRatio > 40) {
    results.quality = "FAIR";
  } else {
    results.quality = "FAIL";
  }

  return results;
}

/**
 * 테스트 실행
 */
async function runTests() {
  console.log("🚀 AI 챗봇 한국어 응답 테스트 시작\n");
  console.log("=" .repeat(80));

  const results = [];

  for (const testCase of testCases) {
    console.log(`\n📝 테스트: ${testCase.name}`);
    console.log(`   질문: ${testCase.query}`);
    console.log(`   컨텍스트: ${testCase.context}`);
    
    // AI 응답 받기
    const response = await testKoreanResponse(testCase.query, testCase.context);
    
    if (!response) {
      console.log("   ❌ 응답 없음");
      results.push({
        name: testCase.name,
        success: false,
        quality: "FAIL"
      });
      continue;
    }

    console.log(`\n   🤖 AI 응답:\n   ${response}\n`);

    // 검증
    const validation = validateKoreanResponse(response, testCase.expectedKeywords);
    
    console.log(`   📊 검증 결과:`);
    console.log(`      한글 비율: ${validation.koreanRatio.toFixed(1)}%`);
    console.log(`      영문 비율: ${validation.englishRatio.toFixed(1)}%`);
    console.log(`      키워드 매칭: ${validation.matchedKeywords.join(", ") || "없음"}`);
    console.log(`      품질: ${validation.quality}`);
    
    const success = validation.quality === "EXCELLENT" || validation.quality === "GOOD";
    console.log(`      ${success ? "✅ PASS" : "❌ FAIL"}`);

    results.push({
      name: testCase.name,
      success: success,
      quality: validation.quality,
      koreanRatio: validation.koreanRatio
    });

    console.log("   " + "-".repeat(76));
  }

  // 최종 결과
  console.log("\n" + "=".repeat(80));
  console.log("📊 최종 테스트 결과\n");

  const passCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  const passRate = (passCount / totalCount) * 100;

  results.forEach(result => {
    const icon = result.success ? "✅" : "❌";
    console.log(`${icon} ${result.name}: ${result.quality} (한글 ${result.koreanRatio?.toFixed(1)}%)`);
  });

  console.log(`\n총 테스트: ${totalCount}개`);
  console.log(`성공: ${passCount}개 (${passRate.toFixed(1)}%)`);
  console.log(`실패: ${totalCount - passCount}개`);

  if (passRate >= 80) {
    console.log("\n🎉 EXCELLENT! 한국어 응답이 매우 우수합니다.");
  } else if (passRate >= 60) {
    console.log("\n👍 GOOD! 한국어 응답이 양호합니다. 약간의 개선이 필요합니다.");
  } else if (passRate >= 40) {
    console.log("\n⚠️  FAIR. 한국어 응답 품질 개선이 필요합니다.");
  } else {
    console.log("\n❌ FAIL. 한국어 응답 시스템을 재검토해야 합니다.");
  }

  console.log("=".repeat(80));
}

// 테스트 실행
runTests().catch(console.error);


