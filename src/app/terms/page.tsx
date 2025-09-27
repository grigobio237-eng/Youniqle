import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsPage() {
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
                <FileText className="w-4 h-4 mr-2" />
                서비스 이용약관
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                이용약관
              </h1>
              
              <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-3xl mx-auto">
                주식회사 사피에넷이 제공하는 서비스의 이용과 관련하여 회사와 이용자의 권리·의무 및 책임사항을 규정합니다.
              </p>

              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm">
                시행일: 2025년 9월 1일
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 이용약관 내용 */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <div className="prose prose-lg max-w-none">
                <div className="bg-blue-50 rounded-lg p-6 mb-8 border-l-4 border-blue-500">
                  <p className="text-gray-700 leading-relaxed mb-0">
                    주식회사 사피에넷(이하 &ldquo;회사&rdquo;)이 제공하는 서비스의 이용과 관련하여 회사와 이용자의 권리·의무 및 책임사항을 규정합니다. 본 약관은 2025년 9월 1일부터 적용됩니다.
                  </p>
                </div>

                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">1. 목적 및 정의</h2>
                    <div className="space-y-3">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700"><strong>회사:</strong> 주식회사 사피에넷, 브랜드 유니클(Youniqle)</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700"><strong>회원:</strong> 회사의 약관에 동의하고 계정을 생성한 자</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700"><strong>제휴(파트너)회원:</strong> 별도 계약에 따라 상품 공급·홍보·정산에 참여하는 자</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700"><strong>포인트:</strong> 선불 충전 또는 적립되는 서비스 내 결제수단(현금 아님)</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">2. 약관의 효력 및 변경</h2>
                    <p className="text-gray-700 leading-relaxed">
                      회사는 약관을 개정할 수 있으며, 변경 시 시행 7일 전(불리한 변경은 30일 전) 고지합니다.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">3. 회원가입 및 계정</h2>
                    <p className="text-gray-700 leading-relaxed">
                      정확한 정보 제공 의무, 계정 보안 책임, 부정 사용 금지.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">4. 멤버십 등급 및 포인트</h2>
                    <div className="space-y-3">
                      <p className="text-gray-700 leading-relaxed">
                        적립/사용/소멸: 정책 및 공지에 따름. 현금 환급 불가(법령/환불정책 예외 제외).
                      </p>
                      <p className="text-gray-700 leading-relaxed">
                        선불 충전 포인트는 관련 법령(선불전자지급수단/할부거래 등) 기준을 준수.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">5. 주문·결제·전자쿠폰(디지털 상품) 제공</h2>
                    <p className="text-gray-700 leading-relaxed">
                      결제는 Nicepay를 통해 처리. 디지털 상품(쿠폰/바코드/QR)은 결제 확인 후 등록된 연락처로 발송.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">6. 청약철회 및 환불</h2>
                    <p className="text-gray-700 leading-relaxed">
                      재화의 특성 또는 관련 법령에 따라 환불이 제한될 수 있으며, 전자쿠폰/디지털 콘텐츠는 사용/노출 시 환불이 제한될 수 있습니다. 세부 기준은 환불정책에 따름.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">7. 제휴(파트너) 회원</h2>
                    <p className="text-gray-700 leading-relaxed">
                      표준 계약 및 운영정책 준수, 표시광고/지재권/정산 자료의 진실성 보장, 고객정보 보호의무.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">8. 금지행위</h2>
                    <p className="text-gray-700 leading-relaxed">
                      위법·부정 결제, 시스템 침해, 타인의 권리 침해, 허위 리뷰/리워드 부정수급 등.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">9. 지식재산권</h2>
                    <p className="text-gray-700 leading-relaxed">
                      서비스 및 콘텐츠의 저작권은 회사 또는 정당한 권리자에 귀속. 무단 복제·배포 금지.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">10. 서비스 변경·중단</h2>
                    <p className="text-gray-700 leading-relaxed">
                      기술·운영상 필요에 따른 변경 가능. 중대한 변경 시 사전 고지.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">11. 면책</h2>
                    <p className="text-gray-700 leading-relaxed">
                      천재지변, 불가항력, 이용자 책임 사유, 제3자 플랫폼 장애 등으로 인한 손해는 회사가 책임지지 않습니다. 단, 회사의 고의·중과실은 예외.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">12. 분쟁해결 및 준거법</h2>
                    <p className="text-gray-700 leading-relaxed">
                      분쟁은 고객센터를 통해 협의하며, 대한민국 법을 준거법으로 하고 관할법원은 민사소송법에 따릅니다.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">13. AI 상담 및 비의료 고지</h2>
                    <p className="text-gray-700 leading-relaxed">
                      회사가 제공하는 AI 상담/리포트는 일반적 정보 제공을 위한 것으로, 의학적 진단·치료·처방이 아닙니다. 의료적 판단·시술은 제휴 의료기관의 안내와 전문의 상담에 따릅니다.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">14. 공지 및 연락</h2>
                    <div className="space-y-3">
                      <p className="text-gray-700 leading-relaxed">
                        공지사항 게시 또는 회원 연락처(이메일/문자)로 통지할 수 있습니다.
                      </p>
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <p className="text-blue-800 font-semibold">연락처: 1577-0729</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">15. 시행일</h2>
                    <p className="text-gray-700 leading-relaxed">
                      본 약관은 2025년 9월 1일부터 시행합니다.
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
              이용약관에 대한 문의사항이 있으시면 언제든지 연락해 주세요.
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

