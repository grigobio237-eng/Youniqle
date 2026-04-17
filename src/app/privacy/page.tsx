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
                시행일: [2026.00.00]
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
                    주식회사 사피에넷(이하 &ldquo;회사&rdquo;)은 유니클 서비스 제공을 위하여 개인정보를 처리하며, 관련 법령에 따라 정보주체의 개인정보를 보호하고 권리구제를 보장합니다. 본 방침은 [2026.00.00]부터 적용됩니다.
                  </p>
                </div>

                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">1. 처리하는 개인정보 항목 및 처리 목적</h2>
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">1) 회원가입 및 계정관리</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                          <li>처리항목: 이름, 휴대전화번호, 이메일, 비밀번호, 닉네임, 연령대</li>
                          <li>처리목적: 회원 식별, 계정 생성, 본인확인, 고객응대, 부정이용 방지, 공지사항 전달</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">2) 상품 주문 및 결제</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                          <li>처리항목: 주문번호, 구매내역, 수령인 정보, 연락처, 결제수단 식별정보, 환불 처리 정보</li>
                          <li>처리목적: 주문 처리, 결제, 환불, 영수증 및 거래내역 관리, 민원 대응</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">3) 디지털 리포트 및 설문 서비스</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                          <li>처리항목: 설문 응답, 상담 입력 내용, 업로드 자료, 이용 이력</li>
                          <li>처리목적: 디지털 리포트 생성, 맞춤형 정보 제공, 서비스 품질 개선, 고객지원</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">4) 예약 요청 전달 및 제휴기관 연결</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                          <li>처리항목: 이름, 연락처, 희망 일정, 문의 내용, 요청한 서비스 유형</li>
                          <li>처리목적: 회원의 요청에 따른 제휴기관 정보 전달 또는 예약 요청 전달</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">5) 고객센터 및 분쟁 처리</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                          <li>처리항목: 문의 내용, 답변 내용, 통화기록(해당 시), 첨부자료</li>
                          <li>처리목적: 민원 처리, 서비스 개선, 분쟁 대응</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">6) 서비스 이용 과정에서 자동 생성되는 정보</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                          <li>처리항목: 접속 로그, IP 주소, 쿠키, 기기정보, 브라우저 정보, 이용기록</li>
                          <li>처리목적: 보안, 이상행위 탐지, 통계분석, 서비스 최적화</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">2. 개인정보 처리의 법적 근거</h2>
                    <p className="text-gray-700 leading-relaxed mb-2">회사는 다음 각 호 중 하나 이상에 해당하는 경우 개인정보를 처리합니다.</p>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-700 leading-relaxed">
                      <li>정보주체의 동의가 있는 경우</li>
                      <li>서비스 이용계약의 체결 및 이행을 위하여 필요한 경우</li>
                      <li>법령상 의무 이행이 필요한 경우</li>
                      <li>정당한 이익이 인정되는 범위에서 필요한 경우</li>
                    </ol>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">3. 민감정보의 처리</h2>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-700 leading-relaxed">
                      <li>회사는 건강 관련 설문, 과거 병력, 생활습관, 검사자료 등 민감정보를 처리하는 경우 관련 법령에 따라 일반 개인정보와 분리된 별도 동의를 받습니다.</li>
                      <li>민감정보는 디지털 리포트 제공, 회원 요청에 따른 맞춤형 정보 제공, 고객 응대 등 별도 동의서에 명시된 범위에서만 처리합니다.</li>
                      <li>회사는 민감정보 입력 또는 업로드 단계에서 주민등록번호 전체, 불필요한 타인의 개인정보 등 과도한 정보 제공을 제한하거나 마스킹을 요구할 수 있습니다.</li>
                      <li>회사는 필요 최소한의 범위 내에서 민감정보를 처리하며, 처리 목적이 달성되면 지체 없이 파기합니다.</li>
                    </ol>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">4. 개인정보의 보유 및 이용기간</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">회사는 원칙적으로 개인정보 처리 목적이 달성되면 지체 없이 파기합니다. 다만 다음과 같이 보관할 수 있습니다.</p>
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">1) 회원 계정 정보</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                          <li>보유기간: 회원 탈퇴 시까지</li>
                          <li>단, 관계 법령에 따른 보관이 필요한 경우 해당 기간까지 보관</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">2) 주문, 결제, 계약, 환불 기록</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                          <li>보유기간: 관련 법령에서 정한 기간</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">3) 고객 문의 및 분쟁 대응 기록</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                          <li>보유기간: 문의 처리 완료 후 3년 또는 분쟁 종료 시까지</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">4) 건강 설문, 디지털 리포트 생성 자료, 업로드 자료</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                          <li>보유기간: 별도 동의서에 정한 기간 또는 목적 달성 시까지</li>
                          <li>단, 회원이 장기 보관에 별도 동의한 경우 그 기간까지 보관</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">5) 예약 요청 전달 기록</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                          <li>보유기간: 전달 완료 후 6개월 또는 분쟁 종료 시까지</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">5. 개인정보의 제3자 제공</h2>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-700 leading-relaxed">
                      <li>회사는 원칙적으로 정보주체의 개인정보를 외부에 제공하지 않습니다.</li>
                      <li>다만, 회원이 특정 제휴기관에 대한 예약 요청 전달 또는 서비스 연결을 요청한 경우, 회사는 별도의 제3자 제공 동의를 받은 후 해당 제휴기관에 필요한 최소한의 정보를 제공합니다.</li>
                      <li>회사는 제3자 제공 시 제공받는 자, 제공 목적, 제공 항목, 보유기간을 고지합니다.</li>
                      <li>제3자 제공 내역은 회원이 요청하는 경우 관련 법령 범위에서 확인할 수 있도록 합니다.</li>
                    </ol>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">6. 개인정보 처리의 위탁</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">회사는 원활한 서비스 제공을 위하여 다음과 같이 개인정보 처리 업무를 위탁할 수 있습니다.</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-gray-700 border-collapse border border-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="border border-gray-200 p-3 font-semibold">수탁업체</th>
                            <th className="border border-gray-200 p-3 font-semibold">위탁업무</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr><td className="border border-gray-200 p-3">[PG사명]</td><td className="border border-gray-200 p-3">결제 처리</td></tr>
                          <tr><td className="border border-gray-200 p-3">[클라우드사명]</td><td className="border border-gray-200 p-3">서버 및 인프라 운영</td></tr>
                          <tr><td className="border border-gray-200 p-3">[문자/알림 발송사]</td><td className="border border-gray-200 p-3">알림톡, 문자, 이메일 발송</td></tr>
                          <tr><td className="border border-gray-200 p-3">[고객상담 솔루션사]</td><td className="border border-gray-200 p-3">고객 문의 접수 및 관리</td></tr>
                          <tr><td className="border border-gray-200 p-3">[AI/자동화 솔루션사]</td><td className="border border-gray-200 p-3">회원이 요청한 디지털 리포트 생성 지원, 자동화 처리</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">7. 개인정보의 국외 이전 또는 국외 처리</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">회사는 서비스 제공을 위하여 국외에 소재한 클라우드, 보안, AI, 자동화 인프라를 사용할 수 있습니다. 회사는 관련 법령에 따라 개인정보 처리방침 또는 별도 고지를 통해 이전받는 자, 국가, 이전 항목, 목적, 방법, 보유기간 등을 공개합니다. (www.pipc.go.kr)</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-gray-700 border-collapse border border-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="border border-gray-200 p-2 font-semibold">이전받는 자/수탁자</th>
                            <th className="border border-gray-200 p-2 font-semibold">국가</th>
                            <th className="border border-gray-200 p-2 font-semibold">이전 항목</th>
                            <th className="border border-gray-200 p-2 font-semibold">이전 목적</th>
                            <th className="border border-gray-200 p-2 font-semibold">이전 일시·방법</th>
                            <th className="border border-gray-200 p-2 font-semibold">보유·이용기간</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-gray-200 p-2">Vercel</td><td className="border border-gray-200 p-2">[국가 기재]</td><td className="border border-gray-200 p-2">계정정보, 접속정보 등 서비스 운영상 필요한 정보</td><td className="border border-gray-200 p-2">웹서비스 제공 및 인프라 운영</td><td className="border border-gray-200 p-2">서비스 이용 시 네트워크 전송</td><td className="border border-gray-200 p-2">위탁계약 종료 또는 목적 달성 시까지</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-200 p-2">Cloudflare</td><td className="border border-gray-200 p-2">[국가 기재]</td><td className="border border-gray-200 p-2">접속정보, 보안 처리 정보</td><td className="border border-gray-200 p-2">CDN, 보안, 트래픽 보호</td><td className="border border-gray-200 p-2">서비스 이용 시 네트워크 전송</td><td className="border border-gray-200 p-2">목적 달성 시까지</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-200 p-2">MongoDB Atlas</td><td className="border border-gray-200 p-2">[국가 기재]</td><td className="border border-gray-200 p-2">회원정보, 주문정보, 서비스 이용정보</td><td className="border border-gray-200 p-2">데이터베이스 운영 및 저장</td><td className="border border-gray-200 p-2">서비스 이용 시 네트워크 전송</td><td className="border border-gray-200 p-2">목적 달성 시까지</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-200 p-2">Google Gemini</td><td className="border border-gray-200 p-2">[국가 기재]</td><td className="border border-gray-200 p-2">회원이 입력한 설문·문답 중 리포트 생성에 필요한 범위</td><td className="border border-gray-200 p-2">AI 기반 리포트 생성 지원</td><td className="border border-gray-200 p-2">회원 요청 시 전송</td><td className="border border-gray-200 p-2">목적 달성 시까지 또는 계약 종료 시까지</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-200 p-2">n8n 또는 기타 자동화 도구</td><td className="border border-gray-200 p-2">[국가 기재]</td><td className="border border-gray-200 p-2">자동화 처리에 필요한 범위의 정보</td><td className="border border-gray-200 p-2">워크플로 자동화</td><td className="border border-gray-200 p-2">서비스 이용 시 전송</td><td className="border border-gray-200 p-2">목적 달성 시까지</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">8. 개인정보의 파기 절차 및 방법</h2>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-700 leading-relaxed">
                      <li>회사는 개인정보 보유기간 경과, 처리 목적 달성 등 파기사유가 발생한 경우 지체 없이 파기합니다.</li>
                      <li>전자적 파일 형태의 개인정보는 복구 또는 재생이 어려운 기술적 방법으로 삭제합니다.</li>
                      <li>종이 문서에 기록된 개인정보는 분쇄 또는 소각합니다.</li>
                    </ol>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">9. 정보주체의 권리와 행사 방법</h2>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-700 leading-relaxed">
                      <li>정보주체는 회사에 대하여 자신의 개인정보에 대한 열람, 정정, 삭제, 처리정지, 동의철회 등을 요구할 수 있습니다.</li>
                      <li>민감정보 처리에 대한 동의는 언제든지 철회할 수 있습니다. 다만 철회 이전의 적법한 처리에는 영향을 미치지 않습니다.</li>
                      <li>권리 행사는 고객센터 또는 개인정보 보호책임자에게 서면, 이메일 또는 서비스 내 기능을 통해 요청할 수 있습니다.</li>
                    </ol>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">10. 개인정보의 안전성 확보조치</h2>
                    <p className="text-gray-700 leading-relaxed mb-2">회사는 개인정보 보호를 위하여 다음과 같은 조치를 취합니다.</p>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-700 leading-relaxed">
                      <li>접근권한의 최소화 및 관리</li>
                      <li>비밀번호 등 중요 정보의 암호화</li>
                      <li>접속기록 보관 및 점검</li>
                      <li>보안프로그램 운영</li>
                      <li>전송구간 보안 적용</li>
                      <li>내부관리계획 수립 및 교육</li>
                    </ol>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">11. 쿠키 및 유사기술의 사용</h2>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-700 leading-relaxed">
                      <li>회사는 서비스 편의성, 로그인 유지, 이용분석, 보안 등을 위하여 쿠키를 사용할 수 있습니다.</li>
                      <li>이용자는 브라우저 설정을 통해 쿠키 저장을 거부하거나 삭제할 수 있습니다.</li>
                      <li>쿠키 저장을 거부하는 경우 일부 서비스 이용이 제한될 수 있습니다.</li>
                    </ol>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">12. 광고성 정보 전송</h2>
                    <p className="text-gray-700 leading-relaxed">회사는 전자적 전송매체를 이용한 광고성 정보 전송 시 관련 법령에 따라 회원의 별도 사전 동의를 받습니다.</p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">13. 개인정보 보호책임자 및 고충처리</h2>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700 leading-relaxed">
                      <li>개인정보 보호책임자: [성명/직위]</li>
                      <li>연락처: [전화번호]</li>
                      <li>이메일: [이메일]</li>
                      <li>고객센터: [운영시간 및 연락처]</li>
                    </ul>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">14. 권익침해 구제 방법</h2>
                    <p className="text-gray-700 leading-relaxed mb-2">정보주체는 개인정보 침해와 관련하여 아래 기관에 문의할 수 있습니다.</p>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700 leading-relaxed">
                      <li>개인정보침해신고센터</li>
                      <li>개인정보 분쟁조정위원회</li>
                      <li>대검찰청</li>
                      <li>경찰청</li>
                    </ul>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">15. 처리방침의 변경</h2>
                    <p className="text-gray-700 leading-relaxed">
                      본 처리방침은 [시행일]부터 적용됩니다. 회사는 내용 변경 시 적용일자 및 변경사유를 사전에 공지합니다.
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