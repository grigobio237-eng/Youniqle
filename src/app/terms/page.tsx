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
                시행일: [2026.00.00]
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
                    주식회사 사피에넷(이하 &ldquo;회사&rdquo;)이 운영하는 유니클(Youniqle) 서비스의 이용과 관련하여 회사와 이용자의 권리·의무 및 책임사항을 규정합니다. 본 약관은 [2026.00.00]부터 적용됩니다.
                  </p>
                </div>

                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">제1조 목적</h2>
                    <p className="text-gray-700 leading-relaxed">
                      이 약관은 주식회사 사피에넷(이하 “회사”)이 운영하는 유니클(Youniqle) 서비스의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 정함을 목적으로 합니다.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">제2조 정의</h2>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-700 leading-relaxed">
                      <li>“서비스”란 회사가 웹사이트, 모바일 웹, 앱 기타 온라인 수단을 통하여 제공하는 멤버십, 디지털 리포트, 웰니스 정보 콘텐츠, 제휴 정보 안내, 예약 요청 전달, 고객지원, 포인트 및 부가 서비스를 말합니다.</li>
                      <li>“회원”이란 본 약관에 동의하고 회사와 서비스 이용계약을 체결한 자를 말합니다.</li>
                      <li>“제휴기관”이란 회사와 별도의 계약 또는 운영 기준에 따라 회원에게 정보 제공, 예약 접수, 상담 연결 또는 자체 서비스를 제공하는 기관을 말합니다.</li>
                      <li>“디지털 리포트”란 회원이 입력하거나 업로드한 정보 또는 설문 응답 등을 바탕으로 회사가 제공하는 비의료적 성격의 정보성 결과물 또는 콘텐츠를 말합니다.</li>
                      <li>“PASS”란 회사가 별도로 정한 기간, 혜택 범위, 사용 조건에 따라 회원에게 제공하는 유료 멤버십 또는 이용권을 말합니다.</li>
                      <li>“포인트”란 회사가 서비스 내에서 정한 기준에 따라 적립 또는 부여하는 내부 이용 단위를 말하며, 현금 또는 법정통화가 아닙니다.</li>
                      <li>“예약 요청 전달”이란 회원의 요청에 따라 회사가 회원의 연락처 또는 요청 내용을 제휴기관에 전달하여 제휴기관이 회원에게 직접 연락하거나 일정을 조율할 수 있도록 돕는 절차를 말합니다.</li>
                    </ol>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">제3조 약관의 게시 및 개정</h2>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-700 leading-relaxed">
                      <li>회사는 본 약관의 내용을 회원이 쉽게 확인할 수 있도록 서비스 초기 화면 또는 연결화면에 게시합니다.</li>
                      <li>회사는 관련 법령을 위반하지 않는 범위에서 본 약관을 개정할 수 있습니다.</li>
                      <li>회사가 약관을 개정하는 경우 적용일자 및 개정사유를 명시하여 적용일 7일 전부터 공지합니다. 다만, 회원에게 불리한 변경은 30일 이상의 사전 유예기간을 둡니다.</li>
                      <li>회원이 개정약관 시행일까지 명시적으로 거부의사를 표시하지 아니하고 서비스를 계속 이용한 경우 개정약관에 동의한 것으로 봅니다. 다만, 법령상 별도 동의가 필요한 사항은 해당 절차를 따릅니다.</li>
                    </ol>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">제4조 이용계약의 성립</h2>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-700 leading-relaxed">
                      <li>이용계약은 회원이 본 약관에 동의하고 회사가 정한 가입절차를 완료한 후 회사가 이를 승낙함으로써 성립합니다.</li>
                      <li>회사는 다음 각 호의 경우 가입 신청을 거절하거나 사후에 이용계약을 해지할 수 있습니다.
                        <ol className="list-[lower-alpha] pl-5 mt-2 space-y-1">
                          <li>타인의 정보를 도용한 경우</li>
                          <li>허위 정보를 기재한 경우</li>
                          <li>관련 법령 또는 본 약관을 위반한 경우</li>
                          <li>서비스의 정상 운영을 현저히 방해할 우려가 있는 경우</li>
                        </ol>
                      </li>
                      <li>회사는 서비스 제공을 위해 필요한 범위에서 본인확인 또는 추가 정보 제출을 요청할 수 있습니다.</li>
                    </ol>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">제5조 계정의 관리</h2>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-700 leading-relaxed">
                      <li>회원은 계정 정보의 정확성과 최신성을 유지하여야 합니다.</li>
                      <li>회원은 자신의 계정과 비밀번호를 직접 관리하여야 하며, 이를 제3자에게 양도, 대여 또는 공유하여서는 안 됩니다.</li>
                      <li>계정의 도용 또는 보안 침해를 인지한 경우 회원은 즉시 회사에 통지하여야 합니다.</li>
                    </ol>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">제6조 서비스의 내용 및 범위</h2>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-700 leading-relaxed">
                      <li>회사는 다음 각 호의 서비스를 제공할 수 있습니다.
                        <ol className="list-[lower-alpha] pl-5 mt-2 space-y-1">
                          <li>멤버십, PASS 및 디지털 상품 판매</li>
                          <li>일반적 웰니스 정보, 생활 관리 정보, 디지털 리포트 제공</li>
                          <li>회원 요청에 따른 제휴기관 정보 제공 및 예약 요청 전달</li>
                          <li>결제, 포인트, 고객센터, 이벤트, 공지, 콘텐츠 제공</li>
                        </ol>
                      </li>
                      <li>회사가 제공하는 정보, 리포트, 안내, 상담 지원은 일반적 정보 제공을 위한 것이며, 의료행위, 의학적 진단, 처방, 치료 지시 또는 의료광고에 해당하지 않습니다.</li>
                      <li>회원과 제휴기관 사이의 진료, 상담, 시술, 검사, 처방, 비용 산정, 계약 체결 및 이행은 해당 제휴기관의 책임과 판단에 따라 독립적으로 이루어집니다.</li>
                      <li>회사는 회원의 요청에 따라 정보 전달 또는 예약 요청 전달을 지원할 수 있으나, 특정 의료기관과 회원 사이의 진료계약 또는 치료위임계약의 당사자가 아닙니다.</li>
                      <li>회사는 제휴기관의 의료행위, 상담 결과, 치료 효과, 부작용, 의료비, 진료 적합성 또는 회원과 제휴기관 사이의 분쟁에 관하여 보증하지 않습니다.</li>
                    </ol>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">제7조 결제 및 전자적 제공</h2>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-700 leading-relaxed">
                      <li>회원은 서비스 내에서 회사가 정한 방식으로 상품 또는 서비스를 구매할 수 있습니다.</li>
                      <li>결제는 회사가 지정한 전자결제대행사 또는 결제수단 제공자를 통하여 처리됩니다.</li>
                      <li>디지털 리포트, 이용권, 쿠폰, QR, 코드 기타 전자적 형태의 상품은 결제 또는 승인 완료 후 회원 계정, 이메일, 문자, 앱 알림 등 회사가 정한 방법으로 제공될 수 있습니다.</li>
                      <li>회사는 상품별 특성에 따라 사용기한, 제공방식, 사용조건, 제한사항을 별도로 고지할 수 있습니다.</li>
                    </ol>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">제8조 청약철회, 해지 및 환불</h2>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-700 leading-relaxed">
                      <li>회원의 청약철회 및 환불은 관련 법령과 회사가 상품별로 사전에 고지한 환불정책에 따릅니다.</li>
                      <li>디지털 상품, 디지털 리포트, 즉시 발급 이용권, 사용 개시형 서비스의 경우 관련 법령이 허용하는 범위에서 청약철회가 제한될 수 있으며, 회사는 그러한 제한사유를 결제 전 명확히 고지합니다.</li>
                      <li>PASS 상품의 환불, 중도해지, 공제 항목 및 계산 방식은 별도의 “PASS 결제·환불 특약” 또는 상품 상세페이지에 따릅니다.</li>
                      <li>회사는 회원이 실제 이용한 서비스, 이미 제공된 맞춤형 디지털 결과물, 발송 완료된 실물 상품, 사용 완료된 혜택에 대하여 사전 고지된 기준에 따라 공제할 수 있습니다.</li>
                      <li>회사는 환불 제한 또는 공제의 근거가 되는 이용내역, 제공내역, 발송내역, 열람내역, 사용기록을 보관·제시할 수 있습니다.</li>
                    </ol>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">제9조 포인트</h2>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-700 leading-relaxed">
                      <li>포인트는 회사가 정한 정책에 따라 적립, 부여, 소멸 또는 회수될 수 있습니다.</li>
                      <li>포인트는 회사가 명시적으로 허용한 범위를 제외하고 현금으로 환급되지 않으며, 제3자에게 양도할 수 없습니다.</li>
                      <li>회사는 부정 적립, 부정 사용, 시스템 오류, 환불 발생 등 정당한 사유가 있는 경우 포인트를 정정 또는 회수할 수 있습니다.</li>
                      <li>포인트의 세부 기준은 별도 포인트 정책 또는 서비스 화면에 따릅니다.</li>
                    </ol>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">제10조 금지행위</h2>
                    <p className="text-gray-700 leading-relaxed mb-2">회원은 다음 각 호의 행위를 하여서는 안 됩니다.</p>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-700 leading-relaxed">
                      <li>허위 정보 입력, 타인 정보 도용</li>
                      <li>법령, 공서양속 또는 본 약관 위반 행위</li>
                      <li>회사 또는 제3자의 시스템, 정보, 콘텐츠를 침해하는 행위</li>
                      <li>제휴기관에 대한 허위 예약, 악성 민원, 반복 취소 등 업무 방해 행위</li>
                      <li>회사의 사전 승인 없이 서비스 또는 데이터를 영리 목적으로 복제, 유통, 전송하는 행위</li>
                      <li>허위 후기, 대가성 후기 은폐, 제3자 권리 침해 행위</li>
                      <li>부정 결제, 결제 취소 남용, 환불 악용 행위</li>
                    </ol>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">제11조 회원의 의무</h2>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-700 leading-relaxed">
                      <li>회원은 서비스 신청, 예약 요청, 설문 응답, 문서 업로드 시 사실에 부합하는 정보를 제공하여야 합니다.</li>
                      <li>회원은 자신의 건강, 의료, 재정 또는 법률적 판단을 필요로 하는 사항에 관하여 필요한 경우 직접 전문가의 상담을 받아야 합니다.</li>
                      <li>회원은 주민등록번호 전체, 타인의 의료기록, 제3자의 민감한 개인정보 등 과도한 정보를 임의로 업로드하여서는 안 됩니다.</li>
                    </ol>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">제12조 회사의 의무</h2>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-700 leading-relaxed">
                      <li>회사는 관련 법령과 본 약관에 따라 지속적이고 안정적으로 서비스를 제공하기 위해 노력합니다.</li>
                      <li>회사는 개인정보 보호와 정보보안을 위하여 합리적인 기술적·관리적 조치를 취합니다.</li>
                      <li>회사는 회원의 문의, 불만, 피해구제 요청을 접수하고 합리적으로 처리합니다.</li>
                    </ol>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">제13조 서비스 변경 및 중단</h2>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-700 leading-relaxed">
                      <li>회사는 운영상, 기술상, 정책상 필요에 따라 서비스의 전부 또는 일부를 변경할 수 있습니다.</li>
                      <li>회사는 시스템 점검, 장애, 제휴 종료, 법령 변경, 서비스 개편 등 필요한 경우 서비스의 일부를 제한하거나 중단할 수 있습니다.</li>
                      <li>회사는 중대한 변경 또는 장기 중단이 예정된 경우 사전에 공지합니다. 다만, 긴급한 장애 등 불가피한 경우 사후 공지할 수 있습니다.</li>
                    </ol>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">제14조 지식재산권</h2>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-700 leading-relaxed">
                      <li>서비스에 포함된 상표, 로고, 디자인, 문구, 콘텐츠, 소프트웨어, 리포트 형식 등에 대한 권리는 회사 또는 정당한 권리자에게 귀속됩니다.</li>
                      <li>회원은 회사의 사전 서면 동의 없이 이를 복제, 배포, 수정, 2차적 저작물 작성, 상업적 이용을 할 수 없습니다.</li>
                    </ol>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">제15조 면책</h2>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-700 leading-relaxed">
                      <li>회사는 회원과 제휴기관 사이에 직접 체결되는 진료, 시술, 상담, 검사, 처방, 비용, 분쟁 및 그 결과에 관하여 책임을 지지 않습니다. 다만, 회사의 고의 또는 중대한 과실이 있는 경우는 제외합니다.</li>
                      <li>회사는 천재지변, 시스템 장애, 통신망 장애, 외부 결제기관 장애, 불가항력 사유로 인한 서비스 장애에 관하여 책임을 지지 않습니다. 다만, 회사의 고의 또는 중대한 과실이 있는 경우는 제외합니다.</li>
                      <li>회사는 회원이 입력한 정보의 부정확성, 누락, 허위성으로 인하여 발생한 손해에 관하여 책임을 지지 않습니다.</li>
                    </ol>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">제16조 계약 해지 및 이용 제한</h2>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-700 leading-relaxed">
                      <li>회원은 언제든지 탈퇴를 요청할 수 있습니다. 다만, 결제, 환불, 분쟁, 법정 보관의무가 있는 경우 그 범위 내에서 처리가 유예될 수 있습니다.</li>
                      <li>회사는 회원이 본 약관 또는 관련 법령을 위반하는 경우 서비스 이용을 제한하거나 계약을 해지할 수 있습니다.</li>
                    </ol>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">제17조 분쟁 해결 및 관할</h2>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-700 leading-relaxed">
                      <li>회사와 회원은 분쟁 발생 시 상호 성실히 협의하여 해결하도록 노력합니다.</li>
                      <li>본 약관과 관련한 분쟁에는 대한민국 법령을 적용합니다.</li>
                      <li>소송이 제기되는 경우 민사소송법상 관할법원을 제1심 전속관할법원으로 합니다.</li>
                    </ol>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">제18조 비의료 고지</h2>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-700 leading-relaxed">
                      <li>회사는 의료기관이 아니며, 의료행위를 수행하지 않습니다.</li>
                      <li>회사가 제공하는 리포트, 안내, 콘텐츠, 상담지원은 건강 및 생활관리에 관한 일반적 정보 제공을 목적으로 하며, 의료적 판단을 대체하지 않습니다.</li>
                      <li>의료적 진단, 치료, 처방, 시술 여부 및 적합성은 반드시 의료기관 및 의료전문인력과 직접 상담하여 결정하여야 합니다.</li>
                    </ol>
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

