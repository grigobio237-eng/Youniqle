'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  MoreVertical,
  Mail,
  Phone,
  Building,
  Calendar,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Partner {
  id: string;
  name: string;
  email: string;
  phone?: string;
  partnerStatus: 'pending' | 'approved' | 'rejected' | 'suspended';
  partnerApplication?: {
    partnerType: string;
    businessName: string;
    businessNumber: string;
    businessAddress: string;
    businessPhone: string;
    businessDescription: string;
    bankAccount: string;
    bankName: string;
    accountHolder: string;
    businessRegistrationImage?: string;
    bankStatementImage?: string;
    appliedAt: string;
    approvedAt?: string;
    rejectedAt?: string;
    rejectedReason?: string;
  };
  partnerSettings?: {
    commissionRate: number;
    businessHours?: Record<string, { open: string; close: string; isOpen: boolean }>;
    autoReplyMessage?: string;
    autoReplyEnabled?: boolean;
    shopLogo?: string;
    shopBanner?: string;
  };
  partnerStats?: {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    totalCommission: number;
  };
  createdAt: string;
  updatedAt: string;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  suspended: 'bg-gray-100 text-obsidian'
};

const statusLabels = {
  pending: '검토 대기',
  approved: '승인됨',
  rejected: '거부됨',
  suspended: '정지됨'
};

const partnerTypeLabels: { [key: string]: string } = {
  shopper: '쇼퍼',
  business: '사업장',
  coach: '코치',
  artist: '작가'
};

const partnerTypeColors: { [key: string]: string } = {
  shopper: 'bg-blue-50 text-primary border-primary/30',
  business: 'bg-purple-50 text-secondary border-purple-200',
  coach: 'bg-orange-50 text-orange-700 border-orange-200',
  artist: 'bg-pink-50 text-pink-700 border-pink-200'
};

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editCommissionRate, setEditCommissionRate] = useState<number>(10);
  const [savingCommission, setSavingCommission] = useState(false);

  useEffect(() => {
    fetchPartners();
  }, [searchQuery, statusFilter]);

  const fetchPartners = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/admin/partners?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPartners(data.partners);
      }
    } catch (error) {
      console.error('Failed to fetch partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePartnerAction = async (partnerId: string, action: string, data?: any) => {
    try {
      const response = await fetch(`/api/admin/partners/${partnerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, data }),
      });

      if (response.ok) {
        fetchPartners(); // 새로고침
        // 페이지 새로고침으로 알림 업데이트
        setTimeout(() => window.location.reload(), 500);
      }
    } catch (error) {
      console.error('Partner action failed:', error);
    }
  };

  const handleSaveCommissionRate = async () => {
    if (!selectedPartner) return;
    setSavingCommission(true);
    try {
      const response = await fetch(`/api/admin/partners/${selectedPartner.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateCommissionRate', data: { commissionRate: editCommissionRate } }),
      });
      if (response.ok) {
        alert('수수료율이 저장되었습니다.');
        fetchPartners();
        // Update selectedPartner locally
        setSelectedPartner(prev => prev ? {
          ...prev,
          partnerSettings: { ...prev.partnerSettings, commissionRate: editCommissionRate }
        } : null);
      } else {
        alert('수수료율 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to save commission rate:', error);
      alert('수수료율 저장 중 오류가 발생했습니다.');
    } finally {
      setSavingCommission(false);
    }
  };

  const filteredPartners = partners.filter(partner => {
    const matchesSearch =
      partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.partnerApplication?.businessName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || partner.partnerStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = partners.filter(p => p.partnerStatus === 'pending').length;
  const approvedCount = partners.filter(p => p.partnerStatus === 'approved').length;
  const totalRevenue = partners.reduce((sum, p) => sum + (p.partnerStats?.totalRevenue || 0), 0);
  const totalCommission = partners.reduce((sum, p) => sum + (p.partnerStats?.totalCommission || 0), 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">파트너 관리</h1>
          <p className="text-text-secondary mt-1">
            파트너 신청 및 승인 관리
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">총 파트너</p>
                <p className="text-2xl font-bold text-text-primary">{partners.length}</p>
              </div>
              <div className="p-3 rounded-full bg-primary-container text-primary">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">승인 대기</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">총 매출</p>
                <p className="text-2xl font-bold text-green-600">
                  ₩{totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">총 수수료</p>
                <p className="text-2xl font-bold text-secondary">
                  ₩{totalCommission.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-full bg-secondary-container text-secondary">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <form className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/70 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="이름, 이메일, 상호명으로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 상태</SelectItem>
                <SelectItem value="pending">검토 대기</SelectItem>
                <SelectItem value="approved">승인됨</SelectItem>
                <SelectItem value="rejected">거부됨</SelectItem>
                <SelectItem value="suspended">정지됨</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Partners List */}
      <div className="space-y-4">
        {filteredPartners.map((partner) => (
          <Card key={partner.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <h3 className="text-lg font-semibold text-text-primary">{partner.name}</h3>
                    <Badge className={`${statusColors[partner.partnerStatus]} flex items-center space-x-1`}>
                      {partner.partnerStatus === 'pending' && <Calendar className="h-3 w-3" />}
                      {partner.partnerStatus === 'approved' && <CheckCircle className="h-3 w-3" />}
                      {partner.partnerStatus === 'rejected' && <XCircle className="h-3 w-3" />}
                      <span>{statusLabels[partner.partnerStatus]}</span>
                    </Badge>
                    {partner.partnerApplication?.partnerType && (
                      <Badge variant="outline" className={`${partnerTypeColors[partner.partnerApplication.partnerType]}`}>
                        {partnerTypeLabels[partner.partnerApplication.partnerType] || partner.partnerApplication.partnerType}
                      </Badge>
                    )}
                    {partner.partnerApplication?.businessName && (
                      <Badge variant="outline">
                        {partner.partnerApplication.businessName}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-foreground/70" />
                      <span className="text-sm text-text-secondary">{partner.email}</span>
                    </div>
                    {partner.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-foreground/70" />
                        <span className="text-sm text-text-secondary">{partner.phone}</span>
                      </div>
                    )}
                    {partner.partnerApplication?.businessNumber && (
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-foreground/70" />
                        <span className="text-sm text-text-secondary">
                          {partner.partnerApplication.businessNumber}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-foreground/70" />
                      <span className="text-sm text-text-secondary">
                        신청: {new Date(partner.partnerApplication?.appliedAt || partner.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {partner.partnerApplication?.businessDescription && (
                    <p className="text-sm text-text-secondary mb-4 line-clamp-2">
                      {partner.partnerApplication.businessDescription}
                    </p>
                  )}

                  {/* Stats */}
                  {partner.partnerStats && partner.partnerStatus === 'approved' && (
                    <div className="flex items-center space-x-6 text-sm">
                      <div>
                        <span className="text-text-secondary">상품: </span>
                        <span className="font-medium">{partner.partnerStats.totalProducts}개</span>
                      </div>
                      <div>
                        <span className="text-text-secondary">주문: </span>
                        <span className="font-medium">{partner.partnerStats.totalOrders}건</span>
                      </div>
                      <div>
                        <span className="text-text-secondary">매출: </span>
                        <span className="font-medium text-green-600">
                          ₩{partner.partnerStats.totalRevenue.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-text-secondary">수수료율: </span>
                        <span className="font-medium text-primary">
                          {partner.partnerSettings?.commissionRate || 10}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedPartner(partner);
                      setShowDetailModal(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {partner.partnerStatus === 'pending' && (
                        <>
                          <DropdownMenuItem
                            onClick={() => handlePartnerAction(partner.id, 'approve')}
                            className="text-green-600"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            승인
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              const reason = prompt('거부 사유를 입력하세요:');
                              if (reason) {
                                handlePartnerAction(partner.id, 'reject', { reason });
                              }
                            }}
                            className="text-red-600"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            거부
                          </DropdownMenuItem>
                        </>
                      )}
                      {partner.partnerStatus === 'approved' && (
                        <DropdownMenuItem
                          onClick={() => handlePartnerAction(partner.id, 'suspend')}
                          className="text-orange-600"
                        >
                          정지
                        </DropdownMenuItem>
                      )}
                      {partner.partnerStatus === 'suspended' && (
                        <DropdownMenuItem
                          onClick={() => handlePartnerAction(partner.id, 'approve')}
                          className="text-green-600"
                        >
                          재승인
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPartners.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-foreground/70 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">
              파트너가 없습니다
            </h3>
            <p className="text-text-secondary">
              검색 조건에 맞는 파트너를 찾을 수 없습니다.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Partner Detail Modal */}
      {showDetailModal && selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b p-6">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  {selectedPartner.name} 상세 정보
                  <Badge className={partnerTypeColors[selectedPartner.partnerApplication?.partnerType || '']}>
                    {partnerTypeLabels[selectedPartner.partnerApplication?.partnerType || ''] || '미지정'}
                  </Badge>
                </CardTitle>
                <CardDescription>{selectedPartner.email}</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowDetailModal(false)}>
                <XCircle className="h-6 w-6" />
              </Button>
            </CardHeader>
            <CardContent className="p-8 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* 기본 정보 */}
                <div className="space-y-6">
                  <h4 className="text-lg font-bold border-b pb-2">기본 및 활동 정보</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-slate font-bold">상호명/활동명:</span>
                      <span className="font-medium text-obsidian">{selectedPartner.partnerApplication?.businessName}</span>
                    </div>
                    {selectedPartner.partnerApplication?.businessNumber && (
                      <div className="flex justify-between">
                        <span className="text-slate font-bold">사업자 번호:</span>
                        <span className="font-medium text-obsidian">{selectedPartner.partnerApplication.businessNumber}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate font-bold">연락처:</span>
                      <span className="font-medium text-obsidian">{selectedPartner.partnerApplication?.businessPhone || selectedPartner.phone}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate font-bold block">주소:</span>
                      <span className="text-sm text-obsidian leading-relaxed">{selectedPartner.partnerApplication?.businessAddress}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate font-bold block">소개글:</span>
                      <p className="text-sm text-obsidian bg-mist/30 p-4 rounded-xl leading-relaxed whitespace-pre-wrap">
                        {selectedPartner.partnerApplication?.businessDescription}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 정산 정보 */}
                <div className="space-y-6">
                  <h4 className="text-lg font-bold border-b pb-2">정산 계좌 정보</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-slate font-bold">은행명:</span>
                      <span className="font-medium text-obsidian">{selectedPartner.partnerApplication?.bankName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate font-bold">예금주:</span>
                      <span className="font-medium text-obsidian">{selectedPartner.partnerApplication?.accountHolder}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate font-bold">계좌번호:</span>
                      <span className="font-medium text-obsidian">{selectedPartner.partnerApplication?.bankAccount}</span>
                    </div>
                    {/* 수수료율 수정 */}
                    {selectedPartner.partnerStatus === 'approved' && (
                      <div className="pt-4 border-t">
                        <label className="text-slate font-bold block mb-2">수수료율 (%)</label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={editCommissionRate}
                            onChange={(e) => setEditCommissionRate(Number(e.target.value))}
                            className="w-24"
                          />
                          <Button
                            size="sm"
                            onClick={handleSaveCommissionRate}
                            disabled={savingCommission}
                          >
                            {savingCommission ? '저장 중...' : '저장'}
                          </Button>
                        </div>
                        <p className="text-xs text-foreground/70 mt-1">현재 수수료율: {selectedPartner.partnerSettings?.commissionRate || 10}%</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 운영/브랜딩 정보 (승인된 파트너만) */}
              {selectedPartner.partnerStatus === 'approved' && selectedPartner.partnerSettings && (
                <div className="space-y-6">
                  <h4 className="text-lg font-bold border-b pb-2">운영 및 브랜딩 정보</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 상점 로고 */}
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-slate">상점 로고</p>
                      {selectedPartner.partnerSettings.shopLogo ? (
                        <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-line bg-mist">
                          <Image width={800} height={800} style={{ width: '100%', height: '100%', objectFit: 'inherit' }} unoptimized src={selectedPartner.partnerSettings.shopLogo} alt="상점 로고" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-foreground/70 text-xs">미설정</div>
                      )}
                    </div>
                    {/* 상점 배너 */}
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-slate">상점 배너</p>
                      {selectedPartner.partnerSettings.shopBanner ? (
                        <div className="w-full h-24 rounded-xl overflow-hidden border-2 border-line bg-mist">
                          <Image width={800} height={800} style={{ width: '100%', height: '100%', objectFit: 'inherit' }} unoptimized src={selectedPartner.partnerSettings.shopBanner} alt="상점 배너" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-full h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-foreground/70 text-xs">미설정</div>
                      )}
                    </div>
                  </div>
                  {/* 자동 응답 */}
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-slate">자동 응답 설정</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={selectedPartner.partnerSettings.autoReplyEnabled ? 'default' : 'secondary'}>
                        {selectedPartner.partnerSettings.autoReplyEnabled ? '활성화' : '비활성화'}
                      </Badge>
                    </div>
                    {selectedPartner.partnerSettings.autoReplyMessage && (
                      <p className="text-sm text-obsidian bg-mist/30 p-3 rounded-xl">{selectedPartner.partnerSettings.autoReplyMessage}</p>
                    )}
                  </div>
                  {/* 영업시간 */}
                  {selectedPartner.partnerSettings.businessHours && (
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-slate">영업시간</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        {Object.entries(selectedPartner.partnerSettings.businessHours).map(([day, hours]) => (
                          <div key={day} className={`p-2 rounded-lg ${hours.isOpen ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-foreground/70'}`}>
                            <span className="font-bold">{day === 'monday' ? '월' : day === 'tuesday' ? '화' : day === 'wednesday' ? '수' : day === 'thursday' ? '목' : day === 'friday' ? '금' : day === 'saturday' ? '토' : '일'}</span>
                            {hours.isOpen ? `: ${hours.open}-${hours.close}` : ': 휴무'}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 증빙 서류 */}
              {selectedPartner.partnerApplication?.partnerType !== 'shopper' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-bold border-b pb-2">제출 증빙 서류</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <p className="text-sm font-bold text-slate">
                        {selectedPartner.partnerApplication?.partnerType === 'business' ? '사업자등록증' :
                          selectedPartner.partnerApplication?.partnerType === 'coach' ? '자격증 사본' : '포트폴리오/작품증빙'}
                      </p>
                      {selectedPartner.partnerApplication?.businessRegistrationImage ? (
                        <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-line bg-mist group">
                          <Image width={800} height={800} style={{ width: '100%', height: '100%', objectFit: 'inherit' }} unoptimized                             src={selectedPartner.partnerApplication.businessRegistrationImage}
                            alt="증빙서류"
                            className="w-full h-full object-contain"
                          />
                          <a
                            href={selectedPartner.partnerApplication.businessRegistrationImage}
                            target="_blank"
                            rel="noreferrer"
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold transition-opacity"
                          >
                            크게 보기
                          </a>
                        </div>
                      ) : (
                        <div className="aspect-video rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center text-foreground/70 text-sm">
                          제출된 서류 없음
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm font-bold text-slate">통장 사본</p>
                      {selectedPartner.partnerApplication?.bankStatementImage ? (
                        <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-line bg-mist group">
                          <Image width={800} height={800} style={{ width: '100%', height: '100%', objectFit: 'inherit' }} unoptimized                             src={selectedPartner.partnerApplication.bankStatementImage}
                            alt="통장사본"
                            className="w-full h-full object-contain"
                          />
                          <a
                            href={selectedPartner.partnerApplication.bankStatementImage}
                            target="_blank"
                            rel="noreferrer"
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold transition-opacity"
                          >
                            크게 보기
                          </a>
                        </div>
                      ) : (
                        <div className="aspect-video rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center text-foreground/70 text-sm">
                          제출된 서류 없음
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 하단 작업 버튼 */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                {selectedPartner.partnerStatus === 'pending' && (
                  <>
                    <Button
                      onClick={() => {
                        const reason = prompt('거부 사유를 입력하세요:');
                        if (reason) {
                          handlePartnerAction(selectedPartner.id, 'reject', { reason });
                          setShowDetailModal(false);
                        }
                      }}
                      className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 h-12 px-8 font-black rounded-xl"
                    >
                      승인 거부
                    </Button>
                    <Button
                      onClick={() => {
                        if (confirm('이 파트너 신청을 승인하시겠습니까?')) {
                          handlePartnerAction(selectedPartner.id, 'approve');
                          setShowDetailModal(false);
                        }
                      }}
                      className="bg-green-600 text-white hover:bg-green-700 h-12 px-10 font-black rounded-xl"
                    >
                      최종 승인
                    </Button>
                  </>
                )}
                <Button variant="outline" onClick={() => setShowDetailModal(false)} className="h-12 px-8 rounded-xl font-bold">
                  닫기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
