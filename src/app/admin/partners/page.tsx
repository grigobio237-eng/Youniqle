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
    businessName: string;
    businessNumber: string;
    businessAddress: string;
    businessPhone: string;
    businessDescription: string;
    bankAccount: string;
    bankName: string;
    accountHolder: string;
    appliedAt: string;
    approvedAt?: string;
    rejectedAt?: string;
    rejectedReason?: string;
  };
  partnerSettings?: {
    commissionRate: number;
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
  suspended: 'bg-gray-100 text-gray-800'
};

const statusLabels = {
  pending: '검토 대기',
  approved: '승인됨',
  rejected: '거부됨',
  suspended: '정지됨'
};

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
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
                <p className="text-2xl font-bold text-purple-600">
                  ₩{totalCommission.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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
                    {partner.partnerApplication?.businessName && (
                      <Badge variant="outline">
                        {partner.partnerApplication.businessName}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-text-secondary">{partner.email}</span>
                    </div>
                    {partner.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-text-secondary">{partner.phone}</span>
                      </div>
                    )}
                    {partner.partnerApplication?.businessNumber && (
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-text-secondary">
                          {partner.partnerApplication.businessNumber}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
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
                        <span className="font-medium text-blue-600">
                          {partner.partnerSettings?.commissionRate || 10}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <Button variant="ghost" size="sm">
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
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">
              파트너가 없습니다
            </h3>
            <p className="text-text-secondary">
              검색 조건에 맞는 파트너를 찾을 수 없습니다.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
