'use client';

import { useState, useEffect } from 'react';
import PartnerLayout from '@/components/partner/PartnerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Upload } from 'lucide-react';
import ImageManager from '@/components/products/ImageManager';
import { toast } from 'sonner';

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  stock: number;
  category: string;
  summary: string;
  description: string;
  images: Array<{
    url: string;
    w?: number;
    h?: number;
    type?: string;
  }>;
  status: string;
  featured: boolean;
  createdAt: string;
  // 카테고리별 특화 정보
  nutritionInfo?: {
    calories?: string;
    protein?: string;
    fat?: string;
    carbohydrates?: string;
    sodium?: string;
  };
  originInfo?: {
    origin?: string;
    storageMethod?: string;
    shelfLife?: string;
    packagingMethod?: string;
  };
  clothingInfo?: {
    sizeGuide?: string;
    material?: string;
    careInstructions?: string;
  };
  electronicsInfo?: {
    specifications?: string;
    includedItems?: string;
    warranty?: string;
  };
}


function PartnerProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    price: '',
    originalPrice: '',
    stock: '',
    category: '',
    summary: '',
    description: '',
    images: [] as Array<{
      url: string;
      w?: number;
      h?: number;
      type?: string;
    }>,
    featured: false,
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

  // 카테고리 목록
  const categories = [
    { value: 'fresh-food', label: '신선식품' },
    { value: 'clothing', label: '의류' },
    { value: 'shoes', label: '신발' },
    { value: 'bags', label: '가방' },
    { value: 'accessories', label: '액세서리' },
    { value: 'lifestyle', label: '라이프스타일' },
    { value: 'electronics', label: '전자제품' }
  ];

  // 카테고리별 특화 정보 입력 핸들러
  const handleCategorySpecificChange = (category: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...(prev[category as keyof typeof prev] as any),
        [field]: value
      }
    }));
  };

  // 카테고리별 고도화 입력 필드
  const getCategorySpecificFields = (category: string) => {
    switch (category) {
      case 'fresh-food':
        return (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">신선식품 정보</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="calories">칼로리</Label>
                <Input
                  id="calories"
                  value={formData.nutritionInfo.calories}
                  onChange={(e) => handleCategorySpecificChange('nutritionInfo', 'calories', e.target.value)}
                  placeholder="예: 약 250kcal/100g"
                />
              </div>
              <div>
                <Label htmlFor="protein">단백질</Label>
                <Input
                  id="protein"
                  value={formData.nutritionInfo.protein}
                  onChange={(e) => handleCategorySpecificChange('nutritionInfo', 'protein', e.target.value)}
                  placeholder="예: 25g"
                />
              </div>
              <div>
                <Label htmlFor="fat">지방</Label>
                <Input
                  id="fat"
                  value={formData.nutritionInfo.fat}
                  onChange={(e) => handleCategorySpecificChange('nutritionInfo', 'fat', e.target.value)}
                  placeholder="예: 15g"
                />
              </div>
              <div>
                <Label htmlFor="carbohydrates">탄수화물</Label>
                <Input
                  id="carbohydrates"
                  value={formData.nutritionInfo.carbohydrates}
                  onChange={(e) => handleCategorySpecificChange('nutritionInfo', 'carbohydrates', e.target.value)}
                  placeholder="예: 0g"
                />
              </div>
              <div>
                <Label htmlFor="sodium">나트륨</Label>
                <Input
                  id="sodium"
                  value={formData.nutritionInfo.sodium}
                  onChange={(e) => handleCategorySpecificChange('nutritionInfo', 'sodium', e.target.value)}
                  placeholder="예: 60mg"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="origin">원산지</Label>
                <Input
                  id="origin"
                  value={formData.originInfo.origin}
                  onChange={(e) => handleCategorySpecificChange('originInfo', 'origin', e.target.value)}
                  placeholder="예: 한국 (전라북도)"
                />
              </div>
              <div>
                <Label htmlFor="storageMethod">보관법</Label>
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

  useEffect(() => {
    fetchProducts();
    
    // URL 파라미터 확인하여 다이얼로그 열기
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'new') {
      setIsDialogOpen(true);
    }
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/partner/products', {
        credentials: 'include' // 쿠키 포함
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('상품 조회 오류:', error);
      toast.error('상품 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // 상품 데이터 준비
      const productData = {
        ...formData,
        price: parseFloat(formData.price.replace(/[^0-9]/g, '')), // 천단위 구분기호 제거
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice.replace(/[^0-9]/g, '')) : undefined,
        stock: parseInt(formData.stock),
        // 카테고리별 특화 정보 (빈 값이 아닌 경우만 저장)
        nutritionInfo: formData.nutritionInfo && Object.values(formData.nutritionInfo).some(v => v) ? formData.nutritionInfo : undefined,
        originInfo: formData.originInfo && Object.values(formData.originInfo).some(v => v) ? formData.originInfo : undefined,
        clothingInfo: formData.clothingInfo && Object.values(formData.clothingInfo).some(v => v) ? formData.clothingInfo : undefined,
        electronicsInfo: formData.electronicsInfo && Object.values(formData.electronicsInfo).some(v => v) ? formData.electronicsInfo : undefined,
      };

      const url = editingProduct ? `/api/partner/products/${editingProduct._id}` : '/api/partner/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 쿠키 포함
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        toast.success(editingProduct ? '상품이 수정되었습니다.' : '상품이 등록되었습니다.');
        setIsDialogOpen(false);
        setEditingProduct(null);
        resetForm();
        fetchProducts();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || '상품 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('상품 등록 오류:', error);
      toast.error('상품 등록 중 오류가 발생했습니다.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      price: '',
      originalPrice: '',
      stock: '',
      category: '',
      summary: '',
      description: '',
      images: [],
      featured: false,
      // 카테고리별 특화 정보 초기화
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
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      stock: product.stock.toString(),
      category: product.category,
      summary: product.summary,
      description: product.description,
      images: product.images || [],
      featured: product.featured,
      // 카테고리별 특화 정보 로드
      nutritionInfo: {
        calories: product.nutritionInfo?.calories || '',
        protein: product.nutritionInfo?.protein || '',
        fat: product.nutritionInfo?.fat || '',
        carbohydrates: product.nutritionInfo?.carbohydrates || '',
        sodium: product.nutritionInfo?.sodium || '',
      },
      originInfo: {
        origin: product.originInfo?.origin || '',
        storageMethod: product.originInfo?.storageMethod || '',
        shelfLife: product.originInfo?.shelfLife || '',
        packagingMethod: product.originInfo?.packagingMethod || '',
      },
      clothingInfo: {
        sizeGuide: product.clothingInfo?.sizeGuide || '',
        material: product.clothingInfo?.material || '',
        careInstructions: product.clothingInfo?.careInstructions || '',
      },
      electronicsInfo: {
        specifications: product.electronicsInfo?.specifications || '',
        includedItems: product.electronicsInfo?.includedItems || '',
        warranty: product.electronicsInfo?.warranty || '',
      },
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('정말로 이 상품을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/partner/products/${productId}`, {
        method: 'DELETE',
        credentials: 'include' // 쿠키 포함
      });

      if (response.ok) {
        toast.success('상품이 삭제되었습니다.');
        fetchProducts();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || '상품 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('상품 삭제 오류:', error);
      toast.error('상품 삭제 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">내 상품 관리</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              상품 등록
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? '상품 수정' : '새 상품 등록'}
              </DialogTitle>
            </DialogHeader>
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
                <Label htmlFor="description">상품 설명 *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  required
                />
              </div>

              <ImageManager
                images={formData.images}
                onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
                maxImages={10}
              />

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  취소
                </Button>
                <Button type="submit">
                  {editingProduct ? '수정' : '등록'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {products.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">등록된 상품이 없습니다</h3>
              <p className="text-gray-600 mb-4">첫 번째 상품을 등록해보세요.</p>
            </CardContent>
          </Card>
        ) : (
          products.map((product) => (
            <Card key={product._id}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {product.images.length > 0 && (
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{product.name}</h3>
                        <p className="text-gray-600 text-sm">{product.summary}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="font-semibold text-lg">₩{product.price.toLocaleString()}</span>
                          {product.originalPrice && (
                            <span className="text-gray-500 line-through">
                              ₩{product.originalPrice.toLocaleString()}
                            </span>
                          )}
                          <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                            {product.status === 'active' ? '판매중' : '비활성'}
                          </Badge>
                          {product.featured && <Badge variant="outline">추천</Badge>}
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>재고: {product.stock}개</span>
                          <span>카테고리: {product.category}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          수정
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(product._id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          삭제
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export default function PartnerProductsPage() {
  return (
    <PartnerLayout>
      <PartnerProductsContent />
    </PartnerLayout>
  );
}

