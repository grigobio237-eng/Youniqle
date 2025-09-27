'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Leaf, 
  MapPin, 
  Calendar, 
  Thermometer, 
  Shirt, 
  Ruler, 
  Palette,
  Cpu,
  Battery,
  Weight,
  Package,
  Info
} from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
}

interface CategorySpecificInfoProps {
  product: Product;
}

export default function CategorySpecificInfo({ product }: CategorySpecificInfoProps) {
  const renderFreshFoodInfo = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 영양성분 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Leaf className="h-5 w-5 mr-2 text-green-600" />
            영양성분 정보
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>칼로리</span>
              <span className="font-medium">약 250kcal/100g</span>
            </div>
            <div className="flex justify-between">
              <span>단백질</span>
              <span className="font-medium">25g</span>
            </div>
            <div className="flex justify-between">
              <span>지방</span>
              <span className="font-medium">15g</span>
            </div>
            <div className="flex justify-between">
              <span>탄수화물</span>
              <span className="font-medium">0g</span>
            </div>
            <div className="flex justify-between">
              <span>나트륨</span>
              <span className="font-medium">60mg</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 원산지 및 보관법 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <MapPin className="h-5 w-5 mr-2 text-blue-600" />
            원산지 및 보관법
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium text-gray-700">원산지:</span>
              <span className="ml-2">한국 (전라북도)</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">보관법:</span>
              <span className="ml-2">냉장 보관 (0-4°C)</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">유통기한:</span>
              <span className="ml-2">포장일로부터 7일</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">포장방법:</span>
              <span className="ml-2">진공포장</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderClothingInfo = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 사이즈 가이드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Ruler className="h-5 w-5 mr-2 text-purple-600" />
            사이즈 가이드
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-sm">
              <p className="font-medium text-gray-700 mb-2">표준 사이즈 (cm)</p>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-medium">S</div>
                  <div>85-90</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">M</div>
                  <div>90-95</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">L</div>
                  <div>95-100</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">XL</div>
                  <div>100-105</div>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-xs text-yellow-800">
                <Info className="h-3 w-3 inline mr-1" />
                사이즈는 측정 방법에 따라 차이가 있을 수 있습니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 소재 및 관리 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Shirt className="h-5 w-5 mr-2 text-blue-600" />
            소재 및 관리
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium text-gray-700">소재:</span>
              <span className="ml-2">100% 면</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">세탁법:</span>
              <span className="ml-2">세탁기 사용 가능 (30°C 이하)</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">표백:</span>
              <span className="ml-2">금지</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">다림질:</span>
              <span className="ml-2">중온 (150°C 이하)</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">드라이클리닝:</span>
              <span className="ml-2">가능</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderElectronicsInfo = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 기술 사양 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Cpu className="h-5 w-5 mr-2 text-blue-600" />
            기술 사양
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>프로세서</span>
              <span className="font-medium">Apple A16 Bionic</span>
            </div>
            <div className="flex justify-between">
              <span>메모리</span>
              <span className="font-medium">8GB RAM</span>
            </div>
            <div className="flex justify-between">
              <span>저장공간</span>
              <span className="font-medium">256GB</span>
            </div>
            <div className="flex justify-between">
              <span>디스플레이</span>
              <span className="font-medium">6.1인치 Super Retina XDR</span>
            </div>
            <div className="flex justify-between">
              <span>카메라</span>
              <span className="font-medium">48MP 메인 + 12MP 울트라와이드</span>
            </div>
            <div className="flex justify-between">
              <span>배터리</span>
              <span className="font-medium">최대 29시간 비디오 재생</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 포함 사항 및 보증 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Package className="h-5 w-5 mr-2 text-green-600" />
            포함 사항 및 보증
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium text-gray-700">포함 사항:</span>
              <ul className="mt-1 ml-4 list-disc space-y-1">
                <li>기기 본체</li>
                <li>USB-C to Lightning 케이블</li>
                <li>20W USB-C 전원 어댑터</li>
                <li>사용 설명서</li>
              </ul>
            </div>
            <div>
              <span className="font-medium text-gray-700">제조사 보증:</span>
              <span className="ml-2">1년</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">A/S 센터:</span>
              <span className="ml-2">전국 애플 공식 서비스센터</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDefaultInfo = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Info className="h-5 w-5 mr-2 text-blue-600" />
          상품 정보
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          <div>
            <span className="font-medium text-gray-700">카테고리:</span>
            <Badge variant="outline" className="ml-2">
              {product.category}
            </Badge>
          </div>
          <div>
            <span className="font-medium text-gray-700">재고:</span>
            <span className="ml-2">{product.stock}개</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">상품 설명:</span>
            <p className="mt-1 text-gray-600">{product.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const getCategorySpecificInfo = () => {
    switch (product.category.toLowerCase()) {
      case 'fresh-food':
      case '신선식품':
        return renderFreshFoodInfo();
      case 'apparel':
      case '의류':
      case 'clothing':
        return renderClothingInfo();
      case 'electronics':
      case '전자제품':
      case '전자기기':
        return renderElectronicsInfo();
      default:
        return renderDefaultInfo();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          상품 상세 정보
        </h2>
        <p className="text-gray-600">
          {product.name}에 대한 자세한 정보를 확인하세요
        </p>
      </div>
      
      {getCategorySpecificInfo()}
    </div>
  );
}
