'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PartnerLayout from '@/components/partner/PartnerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Upload, Sparkles } from 'lucide-react';
import ImageManager from '@/components/products/ImageManager';
import ProductDescriptionEditor from '@/components/admin/ProductDescriptionEditor';
import { toast } from 'sonner';
import { PRODUCT_CATEGORIES } from '@/constants/categories';
import Image from 'next/image';

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
  approvalStatus: 'pending' | 'approved' | 'rejected'; // 승인 상태
  rejectionReason?: string; // 거부 사유
  featured: boolean;
  isFunding?: boolean;
  fundingGoal?: number;
  fundingEndDate?: string; // API often returns dates as strings
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
  const [partnerType, setPartnerType] = useState<string>('commerce');
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
    descriptionIsHtml: false,
    images: [] as Array<{
      url: string;
      w?: number;
      h?: number;
      type?: string;
    }>,
    featured: false,
    isFunding: false,
    fundingGoal: '',
    fundingEndDate: '',
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

  const isMedical = partnerType === 'medical';
  const labels = {
    title: isMedical ? '내 상담/서비스 관리' : '내 상품 관리',
    addBtn: isMedical ? '상담/서비스 등록' : '상품 등록',
    editTitle: isMedical ? '상담/서비스 수정' : '상품 수정',
    newTitle: isMedical ? '새 상담/서비스 등록' : '새 상품 등록',
    nameLabel: isMedical ? '상담/서비스명 *' : '상품명 *',
    summaryLabel: isMedical ? '상담/서비스 요약 *' : '상품 요약 *',
    descLabel: isMedical ? '상담/서비스 상세 설명 *' : '상품 상세 설명 *',
    emptyTitle: isMedical ? '등록된 상담/서비스가 없습니다' : '등록된 상품이 없습니다',
    emptyDesc: isMedical ? '첫 번째 상담/서비스를 등록해보세요.' : '첫 번째 상품을 등록해보세요.',
    deleteTitle: isMedical ? '상담/서비스 삭제 확인' : '상품 삭제 확인',
    deleteDesc: isMedical ? '정말로 이 서비스를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.' : '정말로 이 상품을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
    toastAdd: isMedical ? '상담/서비스가 등록되었습니다.' : '상품이 등록되었습니다.',
    toastEdit: isMedical ? '상담/서비스가 수정되었습니다.' : '상품이 수정되었습니다.',
    toastDelete: isMedical ? '상담/서비스가 삭제되었습니다.' : '상품이 삭제되었습니다.',
    toastRegisterFail: isMedical ? '서비스 등록에 실패했습니다.' : '상품 등록에 실패했습니다.',
    fetchError: isMedical ? '조회 중 오류가 발생했습니다.' : '상품 조회 중 오류가 발생했습니다.',
    registerError: isMedical ? '등록 중 오류가 발생했습니다.' : '상품 등록 중 오류가 발생했습니다.',
    deleteError: isMedical ? '삭제 중 오류가 발생했습니다.' : '상품 삭제 중 오류가 발생했습니다.',
    queryPlaceholder: isMedical ? '서비스명을 입력하면 자동 생성됩니다' : '상품명을 입력하면 자동 생성됩니다',
    fundingLabel: isMedical ? '특별 프로젝트(펀딩)로 등록' : '펀딩 프로젝트로 등록',
    fundingDesc: isMedical ? '이 서비스/프로그램을 크라우드 펀딩 형태로 진행합니다.' : '이 상품을 크라우드 펀딩 형태로 진행합니다. 목표 금액과 종료일을 설정해주세요.',
    aiBuilderBtn: isMedical ? 'AI로 서비스 상세페이지 만들기' : 'AI로 상세페이지 만들기',
    aiBuilderDesc: isMedical ? '상담/진료 이미지가 준비되었다면 AI 빌더를 추천합니다!' : '이미지가 준비되었다면 AI 빌더를 추천합니다!'
  };

  // 카테고리 목록 (전체 프로젝트 공통 사용)
  const categories = PRODUCT_CATEGORIES;

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
            <h4 className="text-sm font-medium text-obsidian">신선식품 정보</h4>
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
            <h4 className="text-sm font-medium text-obsidian">의류 정보</h4>
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
            <h4 className="text-sm font-medium text-obsidian">전자제품 정보</h4>
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
    checkPartner();

    // URL 파라미터 확인하여 다이얼로그 열기
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'new') {
      setIsDialogOpen(true);
    }
  }, []);

  const checkPartner = async () => {
    try {
      const response = await fetch('/api/partner/auth/verify');
      if (response.ok) {
        const data = await response.json();
        setPartnerType(data.partner?.partnerType || 'commerce');
      }
    } catch (error) {
      console.error('Partner check failed:', error);
    }
  };

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
      console.error('Fetch error:', error);
      toast.error(labels.fetchError);
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
        isFunding: formData.isFunding,
        fundingGoal: formData.isFunding && formData.fundingGoal ? parseInt(formData.fundingGoal) : undefined,
        fundingEndDate: formData.isFunding && formData.fundingEndDate ? new Date(formData.fundingEndDate) : undefined,
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
        toast.success(editingProduct ? labels.toastEdit : labels.toastAdd);
        setIsDialogOpen(false);
        setEditingProduct(null);
        resetForm();
        fetchProducts();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || labels.toastRegisterFail);
      }
    } catch (error) {
      console.error('Register error:', error);
      toast.error(labels.registerError);
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
      descriptionIsHtml: false,
      images: [],
      featured: false,
      isFunding: false,
      fundingGoal: '',
      fundingEndDate: '',
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
      descriptionIsHtml: (product as any).descriptionIsHtml || false,
      images: product.images || [],
      featured: product.featured,
      isFunding: product.isFunding || false,
      fundingGoal: product.fundingGoal?.toString() || '',
      fundingEndDate: product.fundingEndDate ? new Date(product.fundingEndDate).toISOString().split('T')[0] : '',
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

  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{ open: boolean; productId: string | null }>({ open: false, productId: null });

  const handleDeleteClick = (productId: string) => {
    setDeleteConfirmDialog({ open: true, productId });
  };

  const handleDelete = async () => {
    if (!deleteConfirmDialog.productId) return;

    try {
      const response = await fetch(`/api/partner/products/${deleteConfirmDialog.productId}`, {
        method: 'DELETE',
        credentials: 'include' // 쿠키 포함
      });

      if (response.ok) {
        toast.success(labels.toastDelete);
        fetchProducts();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || '삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(labels.deleteError);
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
        <h1 className="text-3xl font-bold">{labels.title}</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              {labels.addBtn}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? labels.editTitle : labels.newTitle}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">{labels.nameLabel}</Label>
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
                    placeholder={labels.queryPlaceholder}
                    required
                  />
                  <p className="text-xs text-foreground/70 mt-1">
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

              {/* Funding Fields */}
              <div className="flex items-center space-x-2 border p-4 rounded-lg bg-surface my-4">
                <Checkbox
                  id="isFunding"
                  checked={formData.isFunding}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFunding: checked as boolean }))}
                />
                <div className="space-y-1">
                  <Label htmlFor="isFunding" className="font-semibold">{labels.fundingLabel}</Label>
                  <p className="text-sm text-foreground/70">
                    {labels.fundingDesc}
                  </p>
                </div>
              </div>

              {formData.isFunding && (
                <div className="grid grid-cols-2 gap-4 border-l-2 border-primary pl-4 ml-2 mb-4">
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
              )}

              <div>
                <Label htmlFor="summary">{labels.summaryLabel}</Label>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{labels.descLabel}</Label>
                <div className="flex items-center space-x-2 mb-2">
                  <Link href="/partner/ai-builder">
                    <Button type="button" variant="outline" size="sm" className="text-primary border-primary/30 bg-blue-50">
                      <Sparkles className="h-4 w-4 mr-2" />
                      {labels.aiBuilderBtn}
                    </Button>
                  </Link>
                  <p className="text-xs text-foreground/70">{labels.aiBuilderDesc}</p>
                </div>
                <ProductDescriptionEditor
                  value={formData.description}
                  onChange={(val) => setFormData(prev => ({ ...prev, description: val }))}
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

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {products.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-8">
                <Upload className="h-12 w-12 mx-auto text-foreground/70 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{labels.emptyTitle}</h3>
                <p className="text-obsidian mb-4">{labels.emptyDesc}</p>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  {labels.addBtn}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          products.map((product) => (
            <Card key={product._id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square relative bg-gray-100">
                {product.images?.[0] ? (
                  <Image width={800} height={800} style={{ width: '100%', height: '100%', objectFit: 'inherit' }} unoptimized                     src={product.images[0].url}
                    alt={product.name}
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-foreground/70" />
                  </div>
                )}

                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.featured && (
                    <Badge variant="default" className="text-[10px] px-1 py-0 h-5">인기</Badge>
                  )}
                  {product.stock < 10 && (
                    <Badge variant="destructive" className="text-[10px] px-1 py-0 h-5">재고부족</Badge>
                  )}
                  <Badge variant={product.status === 'active' ? 'default' : 'secondary'} className="text-[10px] px-1 py-0 h-5">
                    {product.status === 'active' ? '판매중' : '비활성'}
                  </Badge>
                  {product.isFunding && (
                    <Badge className="bg-orange-500 text-[10px] px-1 py-0 h-5">펀딩</Badge>
                  )}
                  {/* 승인 상태 배지 */}
                  {product.approvalStatus === 'pending' && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 text-[10px] px-1 py-0 h-5">
                      승인 대기
                    </Badge>
                  )}
                  {product.approvalStatus === 'rejected' && (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 text-[10px] px-1 py-0 h-5">
                      거절됨
                    </Badge>
                  )}
                </div>

                <div className="absolute top-1 right-1">
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 bg-white/80 hover:bg-white rounded-full text-obsidian"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 bg-white/80 hover:bg-red-100 rounded-full text-red-600"
                      onClick={() => handleDeleteClick(product._id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <CardContent className="p-3">
                <div className="space-y-2">
                  <div>
                    <h3 className="font-semibold text-sm text-obsidian line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-foreground/70 line-clamp-1 mt-0.5">
                      {product.summary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-bold text-obsidian">
                        ₩{product.price.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-foreground/70">
                    <span>재고: {product.stock}</span>
                    <span className="text-[10px] px-1 bg-gray-100 rounded text-obsidian">
                      {categories.find(c => c.value === product.category)?.label || product.category}
                    </span>
                  </div>

                  {product.approvalStatus === 'rejected' && product.rejectionReason && (
                    <div className="text-xs text-red-600 bg-red-50 p-1.5 rounded border border-red-100 mt-1 line-clamp-2">
                      사유: {product.rejectionReason}
                    </div>
                  )}

                  {product.isFunding && product.fundingGoal && (
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-2">
                      {/* 펀딩 진행률 바 (임시 0% 표시, 실제 데이터 연동 필요 시 추가) */}
                      <div className="bg-orange-500 h-full w-0" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={deleteConfirmDialog.open} onOpenChange={(open) => setDeleteConfirmDialog(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{labels.deleteTitle}</DialogTitle>
            <DialogDescription>
              {labels.deleteDesc}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmDialog({ open: false, productId: null })}>
              취소
            </Button>
            <Button variant="destructive" onClick={() => {
              handleDelete();
              setDeleteConfirmDialog({ open: false, productId: null });
            }}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

