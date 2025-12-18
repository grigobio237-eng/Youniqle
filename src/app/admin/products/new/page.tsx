'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, X } from 'lucide-react';
import Link from 'next/link';
import ImageManager from '@/components/products/ImageManager';
import ProductDescriptionEditor from '@/components/admin/ProductDescriptionEditor';
import { toast } from 'sonner';
import { PRODUCT_CATEGORIES } from '@/constants/categories';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    summary: '',
    description: '',
    descriptionIsHtml: false,
    price: '',
    originalPrice: '',
    stock: '',
    category: '',
    status: 'active',
    featured: false,
    isFunding: false,
    fundingGoal: '',
    fundingEndDate: '',
    images: [] as Array<{
      url: string;
      w?: number;
      h?: number;
      type?: string;
    }>,
    // 카테고리별 특화 정보
    nutritionInfo: {
      calories: '',
      protein: '',
      fat: '',
      carbohydrates: '',
      sodium: '',
    },
    originInfo: {
      origin: '',
      storageMethod: '',
      shelfLife: '',
      packagingMethod: '',
    },
    clothingInfo: {
      sizeGuide: '',
      material: '',
      careInstructions: '',
    },
    electronicsInfo: {
      specifications: '',
      includedItems: '',
      warranty: '',
    },
  });

  // 카테고리 목록 (전체 프로젝트 공통 사용)
  const categories = PRODUCT_CATEGORIES;

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCategorySpecificChange = (category: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev] as any,
        [field]: value
      }
    }));
  };

  // 카테고리별 특화 필드 렌더링
  const getCategorySpecificFields = (category: string) => {
    switch (category) {
      case 'fresh-food':
        return (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">영양 정보</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="calories">칼로리 (100g당)</Label>
                <Input
                  id="calories"
                  value={formData.nutritionInfo.calories}
                  onChange={(e) => handleCategorySpecificChange('nutritionInfo', 'calories', e.target.value)}
                  placeholder="예: 250kcal"
                />
              </div>
              <div>
                <Label htmlFor="protein">단백질</Label>
                <Input
                  id="protein"
                  value={formData.nutritionInfo.protein}
                  onChange={(e) => handleCategorySpecificChange('nutritionInfo', 'protein', e.target.value)}
                  placeholder="예: 15g"
                />
              </div>
              <div>
                <Label htmlFor="fat">지방</Label>
                <Input
                  id="fat"
                  value={formData.nutritionInfo.fat}
                  onChange={(e) => handleCategorySpecificChange('nutritionInfo', 'fat', e.target.value)}
                  placeholder="예: 8g"
                />
              </div>
              <div>
                <Label htmlFor="carbohydrates">탄수화물</Label>
                <Input
                  id="carbohydrates"
                  value={formData.nutritionInfo.carbohydrates}
                  onChange={(e) => handleCategorySpecificChange('nutritionInfo', 'carbohydrates', e.target.value)}
                  placeholder="예: 30g"
                />
              </div>
              <div>
                <Label htmlFor="sodium">나트륨</Label>
                <Input
                  id="sodium"
                  value={formData.nutritionInfo.sodium}
                  onChange={(e) => handleCategorySpecificChange('nutritionInfo', 'sodium', e.target.value)}
                  placeholder="예: 500mg"
                />
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">원산지 정보</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="origin">원산지</Label>
                  <Input
                    id="origin"
                    value={formData.originInfo.origin}
                    onChange={(e) => handleCategorySpecificChange('originInfo', 'origin', e.target.value)}
                    placeholder="예: 국내산"
                  />
                </div>
                <div>
                  <Label htmlFor="storageMethod">보관방법</Label>
                  <Input
                    id="storageMethod"
                    value={formData.originInfo.storageMethod}
                    onChange={(e) => handleCategorySpecificChange('originInfo', 'storageMethod', e.target.value)}
                    placeholder="예: 냉장 보관 (0-4°C)"
                  />
                </div>
                <div>
                  <Label htmlFor="shelfLife">유통기한</Label>
                  <Input
                    id="shelfLife"
                    value={formData.originInfo.shelfLife}
                    onChange={(e) => handleCategorySpecificChange('originInfo', 'shelfLife', e.target.value)}
                    placeholder="예: 포장일로부터 7일"
                  />
                </div>
                <div>
                  <Label htmlFor="packagingMethod">포장방법</Label>
                  <Input
                    id="packagingMethod"
                    value={formData.originInfo.packagingMethod}
                    onChange={(e) => handleCategorySpecificChange('originInfo', 'packagingMethod', e.target.value)}
                    placeholder="예: 진공포장"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 'clothing':
        return (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">의류 정보</h4>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="sizeGuide">사이즈 가이드</Label>
                <Textarea
                  id="sizeGuide"
                  value={formData.clothingInfo.sizeGuide}
                  onChange={(e) => handleCategorySpecificChange('clothingInfo', 'sizeGuide', e.target.value)}
                  placeholder="예: S: 85-90cm, M: 90-95cm, L: 95-100cm, XL: 100-105cm"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="material">소재</Label>
                <Input
                  id="material"
                  value={formData.clothingInfo.material}
                  onChange={(e) => handleCategorySpecificChange('clothingInfo', 'material', e.target.value)}
                  placeholder="예: 100% 면"
                />
              </div>
              <div>
                <Label htmlFor="careInstructions">관리 방법</Label>
                <Textarea
                  id="careInstructions"
                  value={formData.clothingInfo.careInstructions}
                  onChange={(e) => handleCategorySpecificChange('clothingInfo', 'careInstructions', e.target.value)}
                  placeholder="예: 세탁기 사용 가능 (30°C 이하), 표백 금지, 중온 다림질 (150°C 이하), 드라이클리닝 가능"
                  rows={3}
                />
              </div>
            </div>
          </div>
        );
      case 'electronics':
        return (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">전자제품 정보</h4>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="specifications">기술 사양</Label>
                <Textarea
                  id="specifications"
                  value={formData.electronicsInfo.specifications}
                  onChange={(e) => handleCategorySpecificChange('electronicsInfo', 'specifications', e.target.value)}
                  placeholder="예: 프로세서: Apple A16 Bionic, 메모리: 8GB RAM, 저장공간: 256GB, 디스플레이: 6.1인치 Super Retina XDR"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="includedItems">포함 사항</Label>
                <Textarea
                  id="includedItems"
                  value={formData.electronicsInfo.includedItems}
                  onChange={(e) => handleCategorySpecificChange('electronicsInfo', 'includedItems', e.target.value)}
                  placeholder="예: 기기 본체, USB-C to Lightning 케이블, 20W USB-C 전원 어댑터, 사용 설명서"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="warranty">보증 정보</Label>
                <Textarea
                  id="warranty"
                  value={formData.electronicsInfo.warranty}
                  onChange={(e) => handleCategorySpecificChange('electronicsInfo', 'warranty', e.target.value)}
                  placeholder="예: 제조사 보증: 1년, A/S 센터: 전국 애플 공식 서비스센터"
                  rows={2}
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // 천단위 구분기호 추가 함수
  const formatNumber = (value: string): string => {
    const num = value.replace(/[^0-9]/g, '');
    return num ? parseInt(num).toLocaleString() : '';
  };

  // 할인율 계산 함수
  const calculateDiscountRate = (price: string, originalPrice: string): number => {
    const p = parseInt(price.replace(/[^0-9]/g, '') || '0');
    const op = parseInt(originalPrice.replace(/[^0-9]/g, '') || '0');
    if (op > p && op > 0) {
      return Math.round(((op - p) / op) * 100);
    }
    return 0;
  };

  // 슬러그 자동 생성 함수 (한글 지원)
  const generateSlug = (name: string): string => {
    // 한글을 로마자로 변환하는 간단한 매핑
    const koreanToRoman: { [key: string]: string } = {
      '가': 'ga', '나': 'na', '다': 'da', '라': 'ra', '마': 'ma', '바': 'ba', '사': 'sa', '아': 'a', '자': 'ja', '차': 'cha', '카': 'ka', '타': 'ta', '파': 'pa', '하': 'ha',
      '거': 'geo', '너': 'neo', '더': 'deo', '러': 'reo', '머': 'meo', '버': 'beo', '서': 'seo', '어': 'eo', '저': 'jeo', '처': 'cheo', '커': 'keo', '터': 'teo', '퍼': 'peo', '허': 'heo',
      '고': 'go', '노': 'no', '도': 'do', '로': 'ro', '모': 'mo', '보': 'bo', '소': 'so', '오': 'o', '조': 'jo', '초': 'cho', '코': 'ko', '토': 'to', '포': 'po', '호': 'ho',
      '구': 'gu', '누': 'nu', '두': 'du', '루': 'ru', '무': 'mu', '부': 'bu', '수': 'su', '우': 'u', '주': 'ju', '추': 'chu', '쿠': 'ku', '투': 'tu', '푸': 'pu', '후': 'hu',
      '그': 'geu', '느': 'neu', '드': 'deu', '르': 'reu', '므': 'meu', '브': 'beu', '스': 'seu', '으': 'eu', '즈': 'jeu', '츠': 'cheu', '크': 'keu', '트': 'teu', '프': 'peu', '흐': 'heu',
      '기': 'gi', '니': 'ni', '디': 'di', '리': 'ri', '미': 'mi', '비': 'bi', '시': 'si', '이': 'i', '지': 'ji', '치': 'chi', '키': 'ki', '티': 'ti', '피': 'pi', '히': 'hi',
      '테': 'te', '상': 'sang', '품': 'pum', '신': 'sin', '선': 'seon', '한': 'han'
    };

    return name
      .split('')
      .map(char => {
        // 한글인 경우 매핑 테이블에서 찾기
        if (/[가-힣]/.test(char)) {
          return koreanToRoman[char] || char;
        }
        return char;
      })
      .join('')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // 특수문자 제거
      .replace(/\s+/g, '-')         // 공백을 하이픈으로
      .replace(/-+/g, '-')          // 연속 하이픈 제거
      .replace(/^-|-$/g, '')        // 앞뒤 하이픈 제거
      .trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 상품 데이터 준비
      const productData = {
        ...formData,
        price: parseFloat(formData.price.replace(/[^0-9]/g, '')), // 천단위 구분기호 제거
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice.replace(/[^0-9]/g, '')) : undefined,
        stock: parseInt(formData.stock),
        isFunding: formData.isFunding,
        fundingGoal: formData.isFunding && formData.fundingGoal ? parseInt(formData.fundingGoal) : undefined,
        fundingEndDate: formData.isFunding && formData.fundingEndDate ? new Date(formData.fundingEndDate) : undefined,
        // 카테고리별 특화 정보 (빈 값이 아닌 경우만 저장)
        nutritionInfo: formData.nutritionInfo && Object.values(formData.nutritionInfo).some(v => v) ? formData.nutritionInfo : undefined,
        originInfo: formData.originInfo && Object.values(formData.originInfo).some(v => v) ? formData.originInfo : undefined,
        clothingInfo: formData.clothingInfo && Object.values(formData.clothingInfo).some(v => v) ? formData.clothingInfo : undefined,
        electronicsInfo: formData.electronicsInfo && Object.values(formData.electronicsInfo).some(v => v) ? formData.electronicsInfo : undefined,
        descriptionIsHtml: formData.descriptionIsHtml,
      };

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        toast.success('상품이 성공적으로 등록되었습니다.');
        router.push('/admin/products');
      } else {
        const errorData = await response.json();
        setError(errorData.error || '상품 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('상품 생성 오류:', error);
      setError('상품 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              뒤로 가기
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">새 상품 등록</h1>
            <p className="text-gray-600">새로운 상품을 등록합니다</p>
          </div>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">상품명 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => {
                const name = e.target.value;
                const slug = generateSlug(name);
                setFormData(prev => ({ ...prev, name, slug }));
              }}
              required
            />
          </div>
          <div>
            <Label htmlFor="slug">슬러그 *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="상품명을 입력하면 자동 생성됩니다"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              URL에 사용되는 식별자입니다. 필요시 수정 가능합니다.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="price">가격 *</Label>
            <Input
              id="price"
              value={formatNumber(formData.price)}
              onChange={(e) => {
                const formatted = formatNumber(e.target.value);
                setFormData(prev => ({ ...prev, price: formatted }));
              }}
              placeholder="0"
              required
            />
          </div>
          <div>
            <Label htmlFor="originalPrice">원가</Label>
            <Input
              id="originalPrice"
              value={formatNumber(formData.originalPrice)}
              onChange={(e) => {
                const formatted = formatNumber(e.target.value);
                setFormData(prev => ({ ...prev, originalPrice: formatted }));
              }}
              placeholder="0"
            />
            {calculateDiscountRate(formData.price, formData.originalPrice) > 0 && (
              <p className="text-sm text-red-600 mt-1 font-semibold">
                {calculateDiscountRate(formData.price, formData.originalPrice)}% 할인
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="stock">재고 *</Label>
            <Input
              id="stock"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
              required
            />
          </div>
        </div>

        {/* Funding Fields */}
        <div className="flex items-center space-x-2 border p-4 rounded-lg bg-gray-50">
          <Checkbox
            id="isFunding"
            checked={formData.isFunding}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFunding: checked as boolean }))}
          />
          <div className="space-y-1">
            <Label htmlFor="isFunding" className="font-semibold">펀딩 프로젝트로 등록</Label>
            <p className="text-sm text-gray-500">
              이 상품을 크라우드 펀딩 형태로 진행합니다. 목표 금액과 종료일을 설정해주세요.
            </p>
          </div>
        </div>

        {
          formData.isFunding && (
            <div className="grid grid-cols-2 gap-4 border-l-2 border-primary pl-4 ml-2">
              <div>
                <Label htmlFor="fundingGoal">목표 금액</Label>
                <Input
                  id="fundingGoal"
                  type="number"
                  value={formData.fundingGoal}
                  onChange={(e) => setFormData(prev => ({ ...prev, fundingGoal: e.target.value }))}
                  placeholder="예: 1000000"
                />
              </div>
              <div>
                <Label htmlFor="fundingEndDate">펀딩 종료일</Label>
                <Input
                  id="fundingEndDate"
                  type="date"
                  value={formData.fundingEndDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, fundingEndDate: e.target.value }))}
                />
              </div>
            </div>
          )
        }

        <div>
          <Label htmlFor="category">카테고리 *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="카테고리를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 카테고리별 고도화 입력 필드 */}
        {formData.category && getCategorySpecificFields(formData.category)}

        <div>
          <Label htmlFor="summary">상품 요약 *</Label>
          <Textarea
            id="summary"
            value={formData.summary}
            onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
            required
          />
        </div>

        <div>
          <ProductDescriptionEditor
            value={formData.description}
            onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
            isHtml={formData.descriptionIsHtml}
            onIsHtmlChange={(isHtml) => setFormData(prev => ({ ...prev, descriptionIsHtml: isHtml }))}
            productContext={{
              name: formData.name,
              category: formData.category,
              price: formData.price,
              images: formData.images
            }}
          />
        </div>

        <ImageManager
          images={formData.images}
          onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
          maxImages={10}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/products">취소</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                등록 중...
              </>
            ) : (
              '등록'
            )}
          </Button>
        </div>
      </form >
    </div >
  );
}
