'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { 
  ArrowLeft, 
  Save, 
  Package,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import ImageManager from '@/components/products/ImageManager';

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  stock: number;
  category: string;
  status: 'active' | 'hidden';
  featured: boolean;
  images: Array<{
    url: string;
    w?: number;
    h?: number;
    type?: string;
  }>;
  summary: string;
  description: string;
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

const categories = [
  '신선식품',
  '의류',
  '신발',
  '가방',
  '액세서리',
  '라이프스타일',
  '전자제품'
];

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    price: 0,
    originalPrice: 0,
    stock: 0,
    category: '',
    status: 'active' as 'active' | 'hidden',
    featured: false,
    summary: '',
    description: '',
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
  const [images, setImages] = useState<Array<{
    url: string;
    w?: number;
    h?: number;
    type?: string;
  }>>([]);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data.product);
        
        // 폼 데이터 설정
        setFormData({
          name: data.product.name || '',
          slug: data.product.slug || '',
          price: data.product.price || 0,
          originalPrice: data.product.originalPrice || 0,
          stock: data.product.stock || 0,
          category: data.product.category || '',
          status: data.product.status || 'active',
          featured: data.product.featured || false,
          summary: data.product.summary || '',
          description: data.product.description || '',
          nutritionInfo: data.product.nutritionInfo || {
            calories: '',
            protein: '',
            fat: '',
            carbohydrates: '',
            sodium: '',
          },
          originInfo: data.product.originInfo || {
            origin: '',
            storageMethod: '',
            shelfLife: '',
            packagingMethod: '',
          },
          clothingInfo: data.product.clothingInfo || {
            sizeGuide: '',
            material: '',
            careInstructions: '',
          },
          electronicsInfo: data.product.electronicsInfo || {
            specifications: '',
            includedItems: '',
            warranty: '',
          },
        });
        
        setImages(data.product.images || []);
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast.error('상품 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCategorySpecificChange = (category: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...(prev[category as keyof typeof prev] as any),
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          images,
        }),
      });

      if (response.ok) {
        toast.success('상품이 성공적으로 수정되었습니다.');
        router.push('/admin/products');
      } else {
        const error = await response.json();
        toast.error(error.message || '상품 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to save product:', error);
      toast.error('상품 수정 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const renderCategorySpecificFields = () => {
    switch (formData.category) {
      case '신선식품':
        return (
          <Card>
            <CardHeader>
              <CardTitle>신선식품 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </CardContent>
          </Card>
        );

      case '의류':
        return (
          <Card>
            <CardHeader>
              <CardTitle>의류 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
        );

      case '전자제품':
        return (
          <Card>
            <CardHeader>
              <CardTitle>전자제품 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">상품 수정</h1>
            <p className="text-gray-600">상품 정보를 수정하고 있습니다...</p>
          </div>
        </div>
        
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">상품 수정</h1>
            <p className="text-gray-600">상품을 찾을 수 없습니다.</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">상품을 찾을 수 없습니다</h3>
            <p className="text-gray-600 mb-4">요청하신 상품이 존재하지 않거나 삭제되었습니다.</p>
            <Button onClick={() => router.push('/admin/products')}>
              상품 목록으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">상품 수정</h1>
            <p className="text-gray-600">{product.name}</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? '저장 중...' : '저장'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 기본 정보 */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">상품명 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="상품명을 입력하세요"
                  />
                </div>
                <div>
                  <Label htmlFor="slug">URL 슬러그 *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="product-url-slug"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">판매가격 *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="originalPrice">원가 (할인가 표시용)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => handleInputChange('originalPrice', Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="stock">재고 *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => handleInputChange('stock', Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category">카테고리 *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="summary">상품 요약 *</Label>
                <Input
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => handleInputChange('summary', e.target.value)}
                  placeholder="상품에 대한 간단한 요약"
                />
              </div>

              <div>
                <Label htmlFor="description">상품 설명 *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="상품에 대한 자세한 설명"
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>

          {/* 카테고리별 특화 정보 */}
          {renderCategorySpecificFields()}
        </div>

        {/* 사이드바 */}
        <div className="space-y-6">
          {/* 이미지 관리 */}
          <ImageManager
            images={images}
            onImagesChange={setImages}
            maxImages={10}
          />

          {/* 상태 설정 */}
          <Card>
            <CardHeader>
              <CardTitle>상태 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="status">상품 상태</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">활성</SelectItem>
                    <SelectItem value="hidden">숨김</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="featured">인기 상품</Label>
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => handleInputChange('featured', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
