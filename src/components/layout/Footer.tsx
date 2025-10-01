import Link from 'next/link';
import CharacterImage from '@/components/ui/CharacterImage';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="relative h-10 w-10">
                <CharacterImage
                  src="/character/youniqle-1.png"
                  alt="Youniqle 로고"
                  fill
                  className="object-contain"
                  sizes="40px"
                />
              </div>
              <span className="text-xl font-bold">Youniqle</span>
            </div>
            <p className="text-gray-400 text-sm">
              고품질 상품을 합리적인 가격으로 제공하는 온라인 쇼핑몰입니다.
            </p>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">고객센터</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-gray-400">전화: </span>
                <a href="tel:1577-0729" className="hover:text-primary transition-colors">
                  1577-0729
                </a>
              </li>
              <li>
                <span className="text-gray-400">이메일: </span>
                <a href="mailto:suchwawa@sapienet.com" className="hover:text-primary transition-colors">
                  suchwawa@sapienet.com
                </a>
              </li>
              <li className="text-gray-400">운영시간: 평일 09:00 - 18:00</li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">빠른 링크</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="text-gray-400 hover:text-primary transition-colors">
                  상품 보기
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-gray-400 hover:text-primary transition-colors">
                  주문 내역
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-primary transition-colors">
                  자주 묻는 질문
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-primary transition-colors">
                  문의하기
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">회사 정보</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>상호: 주식회사 사피에넷</li>
              <li>대표: 장범진</li>
              <li>사업자등록번호: 838-88-02527</li>
              <li>통신판매업신고: 제 2024-서울강동-1687 호</li>
              <li>주소: 서울특별시 강동구 고덕비즈밸리로 26</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 Youniqle. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-400 hover:text-primary transition-colors text-sm">
              개인정보처리방침
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-primary transition-colors text-sm">
              이용약관
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

