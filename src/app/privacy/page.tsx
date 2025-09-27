import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* 뒤로가기 버튼 */}
            <div className="flex justify-start mb-8">
              <Button variant="outline" asChild className="bg-white border-gray-300 hover:bg-gray-50">
                <Link href="/" className="flex items-center">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  홈으로 돌아가기
                </Link>
              </Button>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-6">
                <Shield className="w-4 h-4 mr-2" />
                개인정보 보호
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                개인정보 처리방침
              </h1>
              
              <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-3xl mx-auto">
                주식회사 사피에넷은 이용자의 개인정보를 안전하게 보호하기 위해 최선을 다하고 있습니다.
              </p>

              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm">
                시행일: 2025년 9월 1일
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 개인정보 처리방침 내용 */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <div className="prose prose-lg max-w-none">
                <div className="bg-blue-50 rounded-lg p-6 mb-8 border-l-4 border-blue-500">
                  <p className="text-gray-700 leading-relaxed mb-0">
                    주식회사 사피에넷(이하 &ldquo;회사&rdquo;)은 「개인정보 보호법」 등 관련 법령을 준수하며, 이용자의 개인정보를 안전하게 보호하기 위하여 다음과 같이 처리방침을 수립·공개합니다. 본 방침은 2025년 9월 1일부터 적용됩니다.
                  </p>
                </div>

                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">1. 수집하는 개인정보의 항목 및 방법</h2>
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">회원가입</h3>
                        <p className="text-gray-700">이름, 이메일, 휴대전화번호, 비밀번호(해시), 닉네임, 연령대, (선택) 프로필 이미지</p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">주문/결제</h3>
                        <p className="text-gray-700">주문번호, 수취정보(디지털 상품의 경우 수취 이메일/휴대전화), 결제수단 식별정보(토큰화), 결제승인/취소 기록 — 실제 결제정보는 결제대행사(Nicepay)가 보관</p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">고객지원/상담</h3>
                        <p className="text-gray-700">문의 내용, 첨부파일, 로그 기록</p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">제휴(파트너) 신청</h3>
                        <p className="text-gray-700">상호/담당자/연락처/사업자등록번호 등 제휴 심사 정보</p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">AI 상담(선택)</h3>
                        <p className="text-gray-700">사용자가 입력한 상담 대화·설문 응답(건강 관련 민감정보 입력을 최소화하며, 의료행위가 아님을 고지)</p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">자동수집</h3>
                        <p className="text-gray-700">서비스 이용기록, 접속 IP·기기정보, 쿠키/분석 식별자</p>
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">수집 방법</h3>
                        <p className="text-blue-800">회원가입/주문/상담 양식, 로그 수집, 쿠키/SDK, 제휴 신청 폼 등.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">2. 개인정보의 이용 목적</h2>
                    <p className="text-gray-700 leading-relaxed">
                      회원 식별·관리, 서비스 제공, 주문 처리 및 결제, 포인트·등급 관리, 고객응대, 부정이용 방지, 법령상 의무 이행, 서비스 품질 개선(A/B 테스트·분석)
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">3. 보유 및 이용기간</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      회원탈퇴 또는 목적 달성 후 지체 없이 파기. 다만 관련 법령에 따른 보존:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li>전자상거래 거래기록(5년)</li>
                      <li>대금결제·정산기록(5년)</li>
                      <li>소비자 불만·분쟁처리(3년) 등.</li>
                    </ul>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">4. 제3자 제공</h2>
                    <p className="text-gray-700 leading-relaxed">
                      법령 근거 또는 이용자의 동의가 있는 경우에 한함. (예: 배송/전자쿠폰 발송, 제휴 리워드 정산 등)
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">5. 처리의 위탁</h2>
                    <div className="space-y-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="font-semibold text-gray-900">결제: Nicepay</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="font-semibold text-gray-900">인프라/호스팅: Vercel, Cloudflare</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="font-semibold text-gray-900">데이터베이스: MongoDB Atlas</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="font-semibold text-gray-900">(선택) AI 상담 처리: Google Gemini / n8n 워크플로(대화 처리)</p>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed mt-4">
                      각 수탁자에게 개인정보 보호·기술적/관리적 보호조치를 계약으로 규정합니다.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">6. 국외 이전</h2>
                    <p className="text-gray-700 leading-relaxed">
                      서비스 인프라 특성상 일부 데이터가 국외 서버(Vercel, MongoDB Atlas 등)에 저장·처리될 수 있습니다. 이전국가/일시/보관장소/항목/목적/보유기간은 인프라 설정에 따릅니다.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">7. 쿠키·분석 도구</h2>
                    <p className="text-gray-700 leading-relaxed">
                      서비스 품질 개선을 위해 쿠키 및 유사기술을 사용할 수 있으며, 브라우저 설정으로 거부할 수 있습니다.
                    </p>
                    <p className="text-gray-700 leading-relaxed mt-2">
                      (설정 시) Google Analytics/Meta Pixel/카카오톡 ID를 명시.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">8. 이용자의 권리</h2>
                    <p className="text-gray-700 leading-relaxed">
                      열람·정정·삭제·처리정지 요구, 동의철회 및 회원탈퇴 권리 보장. 대리인 행사 가능.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">9. 안전성 확보조치</h2>
                    <p className="text-gray-700 leading-relaxed">
                      접근권한 최소화, 암호화 저장, 전송구간 보안(HTTPS), 접근기록 보관·점검, 침해사고 대응, 수탁자 관리·감독
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">10. 만 14세 미만 아동</h2>
                    <p className="text-gray-700 leading-relaxed">
                      법정대리인 동의가 없는 경우 가입을 제한합니다.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">11. 고지의 의무</h2>
                    <p className="text-gray-700 leading-relaxed">
                      본 방침은 법령·서비스 변경에 따라 개정될 수 있으며, 개정 시 시행 7일 전 공지합니다.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">12. 시행일</h2>
                    <p className="text-gray-700 leading-relaxed">
                      본 방침은 2025년 9월 1일부터 시행합니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-16 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              더 궁금한 점이 있으신가요?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              개인정보 처리방침에 대한 문의사항이 있으시면 언제든지 연락해 주세요.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-3 text-lg font-semibold" asChild>
                <Link href="/">
                  홈으로 돌아가기
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg font-semibold" asChild>
                <Link href="mailto:suchwawa@sapienet.com">
                  문의하기
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}