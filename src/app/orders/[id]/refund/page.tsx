'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import CharacterImage from '@/components/ui/CharacterImage';
import GoogleAddressSearch from '@/components/ui/GoogleAddressSearch';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowLeft, 
  RotateCcw, 
  Upload, 
  X, 
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  Package,
  Search
} from 'lucide-react';

interface OrderItem {
  _id: string;
  productId: {
    _id: string;
    name: string;
    images: string[];
    price: number;
  };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  paymentStatus: string;
  shippingAddress: any;
  createdAt: string;
  couponDiscount?: number;
  usedPoints?: number;
}

const refundReasons = [
  { value: 'change_of_mind', label: '단순 변심', requiresImage: false },
  { value: 'defective_product', label: '상품 불량', requiresImage: true },
  { value: 'wrong_product', label: '오배송', requiresImage: true },
  { value: 'size_mismatch', label: '사이즈 불일치', requiresImage: false },
  { value: 'different_from_image', label: '상품 상이', requiresImage: true },
  { value: 'delivery_delay', label: '배송 지연', requiresImage: false },
  { value: 'other', label: '기타', requiresImage: false },
];

export default function RefundRequestPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 환불 신청 정보
  const [refundType, setRefundType] = useState<'refund' | 'exchange'>('refund');
  const [refundReason, setRefundReason] = useState('');
  const [refundDetails, setRefundDetails] = useState('');
  const [refundMethod, setRefundMethod] = useState<'card' | 'account'>('card');
  const [bankAccount, setBankAccount] = useState({
    bank: '',
    accountNumber: '',
    accountHolder: ''
  });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // 환불할 상품 선택 (개별 선택 가능)
  const [selectedItems, setSelectedItems] = useState<Map<string, number>>(new Map());
  
  // 수거지 주소
  const [pickupAddress, setPickupAddress] = useState({
    zipCode: '',
    address1: '',
    address2: '',
    phone: '',
  });
  
  // 교환 정보 (교환 선택 시)
  const [exchangeInfo, setExchangeInfo] = useState({
    newProductId: '',
    newSize: '',
    newColor: '',
    additionalPayment: 0,
  });
  
  // 교환할 상품 검색
  const [exchangeProductSearch, setExchangeProductSearch] = useState('');
  const [exchangeProducts, setExchangeProducts] = useState<any[]>([]);
  const [searchingExchangeProducts, setSearchingExchangeProducts] = useState(false);

  useEffect(() => {
    if (session?.user && orderId) {
      fetchOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, orderId]);

  // 주문 정보 로드 시 기본 주소 설정 및 전체 상품 선택
  useEffect(() => {
    if (order) {
      // 기본 수거지 주소를 배송지로 설정
      if (order.shippingAddress) {
        setPickupAddress({
          zipCode: order.shippingAddress.zipCode || order.shippingAddress.zip || '',
          address1: order.shippingAddress.address1 || order.shippingAddress.addr1 || '',
          address2: order.shippingAddress.address2 || order.shippingAddress.addr2 || '',
          phone: order.shippingAddress.phone || '',
        });
      }

      // 기본적으로 모든 상품 선택
      const initialSelection = new Map<string, number>();
      order.items.forEach((item) => {
        initialSelection.set(item.productId._id, item.quantity);
      });
      setSelectedItems(initialSelection);
    }
  }, [order]);

  const fetchOrder = async () => {
    if (!orderId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data.order || data);
      } else {
        alert('주문 정보를 불러올 수 없습니다.');
        router.push('/orders');
      }
    } catch (error) {
      console.error('주문 조회 오류:', error);
      alert('주문 정보를 불러오는 중 오류가 발생했습니다.');
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          return data.url;
        }
        return null;
      });

      const urls = await Promise.all(uploadPromises);
      const validUrls = urls.filter(url => url !== null) as string[];
      setUploadedImages(prev => [...prev, ...validUrls]);
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // 환불할 상품 선택/해제
  const handleItemSelection = (productId: string, maxQuantity: number) => {
    const newSelection = new Map(selectedItems);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.set(productId, maxQuantity);
    }
    setSelectedItems(newSelection);
  };

  // 환불 수량 변경
  const handleQuantityChange = (productId: string, change: number, maxQuantity: number) => {
    const currentQuantity = selectedItems.get(productId) || 0;
    const newQuantity = Math.max(1, Math.min(maxQuantity, currentQuantity + change));
    const newSelection = new Map(selectedItems);
    newSelection.set(productId, newQuantity);
    setSelectedItems(newSelection);
  };

  // 환불 금액 계산
  const calculateRefundAmount = () => {
    if (!order) return { total: 0, shippingFee: 0, final: 0 };

    let totalAmount = 0;
    selectedItems.forEach((quantity, productId) => {
      const item = order.items.find(i => i.productId._id === productId);
      if (item) {
        totalAmount += item.price * quantity;
      }
    });

    const selectedReason = refundReasons.find(r => r.value === refundReason);
    const refundShippingFee = selectedReason?.value === 'change_of_mind' ? 5000 : 0;
    const finalAmount = Math.max(0, totalAmount - refundShippingFee);

    return {
      total: totalAmount,
      shippingFee: refundShippingFee,
      final: finalAmount,
    };
  };

  const handleSubmitRefund = async () => {
    // 선택된 상품이 없는 경우
    if (selectedItems.size === 0) {
      alert('환불할 상품을 선택해주세요.');
      return;
    }

    if (!refundReason) {
      alert('환불 사유를 선택해주세요.');
      return;
    }

    if (!refundDetails.trim()) {
      alert('상세 사유를 입력해주세요.');
      return;
    }

    const selectedReason = refundReasons.find(r => r.value === refundReason);
    if (selectedReason?.requiresImage && uploadedImages.length === 0) {
      alert('이 환불 사유는 증빙 이미지가 필요합니다.');
      return;
    }

    // 수거지 주소 검증
    if (!pickupAddress.zipCode || !pickupAddress.address1 || !pickupAddress.phone) {
      alert('수거지 주소를 모두 입력해주세요.');
      return;
    }

    if (refundMethod === 'account') {
      if (!bankAccount.bank || !bankAccount.accountNumber || !bankAccount.accountHolder) {
        alert('환불 계좌 정보를 모두 입력해주세요.');
        return;
      }
    }

    // 교환인 경우 추가 검증
    if (refundType === 'exchange') {
      // 교환 정보는 선택사항이지만, 필요한 경우 검증 로직 추가 가능
    }

    if (!confirm(`${refundType === 'refund' ? '환불' : '교환'} 신청을 진행하시겠습니까?`)) return;

    setSubmitting(true);
    try {
      // 선택된 상품만 환불 처리
      const refundItems = Array.from(selectedItems.entries()).map(([productId, quantity]) => ({
        productId,
        quantity,
      }));

      const response = await fetch('/api/refunds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order?._id,
          type: refundType,
          items: refundItems,
          reason: refundReason,
          reasonDetail: refundDetails,
          refundMethod: refundMethod === 'card' ? 'credit_card' : 'bank_transfer',
          bankAccount: refundMethod === 'account' ? {
            bankName: bankAccount.bank,
            accountNumber: bankAccount.accountNumber,
            accountHolder: bankAccount.accountHolder,
          } : undefined,
          images: uploadedImages,
          pickupAddress: {
            zipCode: pickupAddress.zipCode,
            address1: pickupAddress.address1,
            address2: pickupAddress.address2,
            phone: pickupAddress.phone,
          },
          exchangeInfo: refundType === 'exchange' ? exchangeInfo : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(data.message || '환불 신청이 완료되었습니다. 검토 후 처리됩니다.');
        router.push('/me/refunds');
      } else {
        const errorMsg = data.error?.message || data.error || '환불 신청에 실패했습니다.';
        alert(errorMsg);
      }
    } catch (error) {
      console.error('환불 신청 오류:', error);
      alert('환불 신청 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">주문을 찾을 수 없습니다</h2>
            <Button asChild className="mt-4">
              <Link href="/orders">주문 내역으로 돌아가기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 환불 불가능한 주문 체크
  if (order.status !== 'delivered' || order.paymentStatus !== 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">환불 신청 불가</h2>
            <p className="text-gray-600 mb-6">
              배송 완료된 주문만 환불 신청이 가능합니다.
            </p>
            <Button asChild>
              <Link href="/orders">주문 내역으로 돌아가기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedReasonObj = refundReasons.find(r => r.value === refundReason);
  const refundCalculation = calculateRefundAmount();
  const selectedItemsCount = selectedItems.size;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 헤더 */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              주문 내역으로 돌아가기
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">환불/교환 신청</h1>
          <p className="text-gray-600 mt-2">주문번호: {order.orderNumber}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 주문 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 환불/교환 선택 */}
            <Card>
              <CardHeader>
                <CardTitle>환불/교환 선택</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={refundType} onValueChange={(value: any) => setRefundType(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="refund" id="refund" />
                    <Label htmlFor="refund">환불</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="exchange" id="exchange" />
                    <Label htmlFor="exchange">교환</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* 환불할 상품 선택 */}
            <Card>
              <CardHeader>
                <CardTitle>환불할 상품 선택 *</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  환불/교환할 상품을 선택해주세요
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.items.map((item) => {
                  const isSelected = selectedItems.has(item.productId._id);
                  const selectedQuantity = selectedItems.get(item.productId._id) || 0;
                  
                  return (
                    <div
                      key={item.productId._id}
                      className={`p-4 border-2 rounded-lg ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleItemSelection(item.productId._id, item.quantity)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              {item.productId.images && item.productId.images.length > 0 ? (
                                <Image
                                  src={item.productId.images[0]}
                                  alt={item.productId.name}
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <Package className="h-8 w-8 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{item.productId.name}</p>
                              <p className="text-sm text-gray-600">
                                {item.price.toLocaleString()}원 × {item.quantity}개
                              </p>
                              <p className="text-sm font-semibold text-gray-900 mt-1">
                                총 {(item.price * item.quantity).toLocaleString()}원
                              </p>
                            </div>
                          </div>
                          
                          {isSelected && (
                            <div className="mt-3 flex items-center space-x-2">
                              <Label className="text-sm">환불 수량:</Label>
                              <div className="flex items-center space-x-2 border rounded-lg">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleQuantityChange(item.productId._id, -1, item.quantity)}
                                  disabled={selectedQuantity <= 1}
                                  className="h-8 w-8"
                                >
                                  -
                                </Button>
                                <span className="w-8 text-center">{selectedQuantity}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleQuantityChange(item.productId._id, 1, item.quantity)}
                                  disabled={selectedQuantity >= item.quantity}
                                  className="h-8 w-8"
                                >
                                  +
                                </Button>
                              </div>
                              <span className="text-sm text-gray-600">
                                / {item.quantity}개
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* 환불 사유 */}
            <Card>
              <CardHeader>
                <CardTitle>환불 사유 *</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={refundReason} onValueChange={setRefundReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="환불 사유를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {refundReasons.map((reason) => (
                      <SelectItem key={reason.value} value={reason.value}>
                        {reason.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div>
                  <Label htmlFor="details">상세 사유 *</Label>
                  <Textarea
                    id="details"
                    value={refundDetails}
                    onChange={(e) => setRefundDetails(e.target.value)}
                    placeholder="환불 사유를 상세히 입력해주세요"
                    rows={4}
                    className="mt-2"
                  />
                </div>

                {selectedReasonObj?.requiresImage && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-semibold text-yellow-800">
                        증빙 이미지 필요
                      </span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      이 환불 사유는 증빙 이미지가 필요합니다. 상품 사진을 업로드해주세요.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 증빙 이미지 */}
            <Card>
              <CardHeader>
                <CardTitle>증빙 이미지 (선택사항)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                      <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        클릭하여 이미지를 업로드하세요
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        최대 5장, JPG/PNG 형식
                      </p>
                    </div>
                  </Label>
                  <input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage || uploadedImages.length >= 5}
                  />
                </div>

                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {uploadedImages.map((url, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={url}
                          alt={`증빙 이미지 ${index + 1}`}
                          width={200}
                          height={200}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 수거지 주소 */}
            <Card>
              <CardHeader>
                <CardTitle>수거지 주소 *</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  반품 상품을 수거할 주소를 입력해주세요
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>주소 *</Label>
                  <div className="mb-3 mt-2">
                    <GoogleAddressSearch
                      onAddressSelect={(address) => {
                        setPickupAddress(prev => ({
                          ...prev,
                          zipCode: address.zonecode,
                          address1: address.address,
                        }));
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={pickupAddress.zipCode}
                        onChange={(e) => setPickupAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                        placeholder="우편번호"
                        className="w-32"
                      />
                      <Input
                        value={pickupAddress.address1}
                        onChange={(e) => setPickupAddress(prev => ({ ...prev, address1: e.target.value }))}
                        placeholder="도로명주소"
                        className="flex-1"
                      />
                    </div>
                    <Input
                      value={pickupAddress.address2}
                      onChange={(e) => setPickupAddress(prev => ({ ...prev, address2: e.target.value }))}
                      placeholder="상세주소"
                    />
                    <Input
                      value={pickupAddress.phone}
                      onChange={(e) => setPickupAddress(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="연락처 (010-1234-5678)"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 환불 방법 */}
            <Card>
              <CardHeader>
                <CardTitle>환불 방법 *</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={refundMethod} onValueChange={(value: any) => setRefundMethod(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card">원결제 수단으로 환불 (카드결제 시)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="account" id="account" />
                    <Label htmlFor="account">계좌이체 환불</Label>
                  </div>
                </RadioGroup>

                {refundMethod === 'account' && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <Label htmlFor="bank">은행 *</Label>
                      <Input
                        id="bank"
                        value={bankAccount.bank}
                        onChange={(e) => setBankAccount(prev => ({ ...prev, bank: e.target.value }))}
                        placeholder="은행명"
                      />
                    </div>
                    <div>
                      <Label htmlFor="accountNumber">계좌번호 *</Label>
                      <Input
                        id="accountNumber"
                        value={bankAccount.accountNumber}
                        onChange={(e) => setBankAccount(prev => ({ ...prev, accountNumber: e.target.value }))}
                        placeholder="계좌번호"
                      />
                    </div>
                    <div>
                      <Label htmlFor="accountHolder">예금주 *</Label>
                      <Input
                        id="accountHolder"
                        value={bankAccount.accountHolder}
                        onChange={(e) => setBankAccount(prev => ({ ...prev, accountHolder: e.target.value }))}
                        placeholder="예금주명"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 환불 금액 요약 */}
            {selectedItemsCount > 0 && (
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-900">환불 예상 금액</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>선택 상품 금액</span>
                    <span>{refundCalculation.total.toLocaleString()}원</span>
                  </div>
                  {refundCalculation.shippingFee > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>반품 배송비</span>
                      <span>-{refundCalculation.shippingFee.toLocaleString()}원</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold text-green-700 pt-2 border-t border-green-300">
                    <span>최종 환불 금액</span>
                    <span>{refundCalculation.final.toLocaleString()}원</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 주의사항 */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">환불 안내</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-blue-800 space-y-2">
                <p>• 단순 변심의 경우 반품 배송비 5,000원이 차감됩니다</p>
                <p>• 상품 불량, 오배송의 경우 무료 반품입니다</p>
                <p>• 환불 처리는 영업일 기준 3-5일 소요됩니다</p>
                <p>• 환불 신청 후 취소가 불가능하니 신중히 선택해주세요</p>
                <p>• 수거된 상품 검수 후 환불이 진행됩니다</p>
              </CardContent>
            </Card>

            {/* 제출 버튼 */}
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                onClick={handleSubmitRefund}
                disabled={submitting || selectedItemsCount === 0}
                className="flex-1"
              >
                {submitting 
                  ? '신청 중...' 
                  : `${refundType === 'refund' ? '환불' : '교환'} 신청`}
              </Button>
            </div>
          </div>

          {/* 주문 요약 */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>주문 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">주문번호</p>
                  <p className="font-medium">{order.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">주문일</p>
                  <p className="font-medium">
                    {new Date(order.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>

                <hr />

                <div>
                  <p className="text-sm font-semibold mb-2">주문 상품 ({order.items.length}개)</p>
                  <div className="space-y-3">
                    {order.items.map((item, index) => {
                      const isSelected = selectedItems.has(item.productId._id);
                      const selectedQuantity = selectedItems.get(item.productId._id) || 0;
                      
                      return (
                        <div 
                          key={index} 
                          className={`flex items-center space-x-3 p-2 rounded ${
                            isSelected ? 'bg-blue-50 border border-blue-200' : ''
                          }`}
                        >
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            {item.productId.images && item.productId.images.length > 0 ? (
                              <Image
                                src={item.productId.images[0]}
                                alt={item.productId.name}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <Package className="h-8 w-8 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.productId.name}</p>
                            <p className="text-xs text-gray-600">
                              {item.quantity}개 × {item.price.toLocaleString()}원
                            </p>
                            {isSelected && (
                              <p className="text-xs text-blue-600 font-semibold mt-1">
                                환불 {selectedQuantity}개 선택
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <hr />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>상품 금액</span>
                    <span>{order.totalAmount.toLocaleString()}원</span>
                  </div>
                  {order.couponDiscount && order.couponDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>쿠폰 할인</span>
                      <span>-{order.couponDiscount.toLocaleString()}원</span>
                    </div>
                  )}
                  {order.usedPoints && order.usedPoints > 0 && (
                    <div className="flex justify-between text-sm text-yellow-600">
                      <span>포인트 사용</span>
                      <span>-{order.usedPoints.toLocaleString()}P</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold pt-2 border-t">
                    <span>총 결제금액</span>
                    <span>{order.totalAmount.toLocaleString()}원</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

