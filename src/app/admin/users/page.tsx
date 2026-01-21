'use client';

import { useState, useEffect, useCallback } from 'react';
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
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Shield,
  Crown,
  Star,
  TrendingUp,
  XCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'member' | 'partner' | 'admin' | 'user';
  grade?: 'cedar' | 'rooter' | 'bloomer' | 'glower' | 'ecosoul';
  points: number;
  provider: 'local' | 'google' | 'kakao' | 'naver';
  emailVerified: boolean;
  marketingConsent: boolean;
  addresses: any[];
  wishlist: any[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  totalOrders: number;
  totalSpent: number;
}

const gradeColors = {
  cedar: 'bg-gray-100 text-gray-800',
  rooter: 'bg-green-100 text-green-800',
  bloomer: 'bg-blue-100 text-blue-800',
  glower: 'bg-purple-100 text-purple-800',
  ecosoul: 'bg-yellow-100 text-yellow-800'
};

const gradeIcons = {
  cedar: Shield,
  rooter: Star,
  bloomer: TrendingUp,
  glower: Crown,
  ecosoul: Crown
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  // User detail modal
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [pointAdjustAmount, setPointAdjustAmount] = useState(0);
  const [adjustingPoints, setAdjustingPoints] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [searchQuery, roleFilter, gradeFilter, sortBy]);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (gradeFilter !== 'all') params.append('grade', gradeFilter);
      params.append('sort', sortBy);

      const response = await fetch(`/api/admin/users?${params}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: action === 'delete' ? 'DELETE' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: action !== 'delete' ? JSON.stringify({ action }) : undefined,
      });

      if (response.ok) {
        fetchUsers(); // 새로고침
      }
    } catch (error) {
      console.error('User action failed:', error);
    }
  };

  const handleViewDetail = (user: User) => {
    setSelectedUser(user);
    setPointAdjustAmount(0);
    setShowDetailModal(true);
  };

  const handleAdjustPoints = async (type: 'add' | 'subtract') => {
    if (!selectedUser || pointAdjustAmount <= 0) return;
    setAdjustingPoints(true);
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: type === 'add' ? 'grantPoints' : 'deductPoints',
          amount: pointAdjustAmount
        }),
      });
      if (response.ok) {
        alert(`포인트가 ${type === 'add' ? '지급' : '차감'}되었습니다.`);
        fetchUsers();
        // Update locally
        setSelectedUser(prev => prev ? {
          ...prev,
          points: type === 'add' ? prev.points + pointAdjustAmount : prev.points - pointAdjustAmount
        } : null);
        setPointAdjustAmount(0);
      } else {
        alert('포인트 조정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to adjust points:', error);
      alert('포인트 조정 중 오류가 발생했습니다.');
    } finally {
      setAdjustingPoints(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesGrade = gradeFilter === 'all' || (user.grade || 'cedar') === gradeFilter;

    return matchesSearch && matchesRole && matchesGrade;
  });

  const getGradeDisplay = (grade: string) => {
    const GradeIcon = gradeIcons[grade as keyof typeof gradeIcons] || Shield; // 기본값으로 Shield 사용
    const colorClass = gradeColors[grade as keyof typeof gradeColors] || 'bg-gray-100 text-gray-800'; // 기본값으로 gray 사용

    return (
      <Badge className={`${colorClass} flex items-center space-x-1`}>
        <GradeIcon className="h-3 w-3" />
        <span>{(grade || 'UNKNOWN').toUpperCase()}</span>
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">회원 관리</h1>
            <p className="text-text-secondary mt-1">
              사용자 정보 및 활동 모니터링
            </p>
          </div>
        </div>

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
    <>
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">회원 관리</h1>
            <p className="text-text-secondary mt-1">
              총 {users.length}명의 회원을 관리하고 있습니다
            </p>
          </div>
          <Button>
            <Users className="h-4 w-4 mr-2" />
            새 회원 초대
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">총 회원 수</p>
                  <p className="text-2xl font-bold text-text-primary">{users.length}</p>
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
                  <p className="text-sm font-medium text-text-secondary">활성 회원</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {users.filter(u => u.lastLoginAt && new Date(u.lastLoginAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">파트너 회원</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {users.filter(u => u.role === 'partner').length}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <Shield className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">총 포인트</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {users.reduce((sum, u) => sum + u.points, 0).toLocaleString()}P
                  </p>
                </div>
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <Star className="h-6 w-6" />
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
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="이름 또는 이메일로 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </form>

              {/* Role Filter */}
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="역할" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 역할</SelectItem>
                  <SelectItem value="member">일반 회원</SelectItem>
                  <SelectItem value="partner">파트너</SelectItem>
                  <SelectItem value="admin">관리자</SelectItem>
                </SelectContent>
              </Select>

              {/* Grade Filter */}
              <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="등급" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 등급</SelectItem>
                  <SelectItem value="cedar">CEDAR</SelectItem>
                  <SelectItem value="rooter">ROOTER</SelectItem>
                  <SelectItem value="bloomer">BLOOMER</SelectItem>
                  <SelectItem value="glower">GLOWER</SelectItem>
                  <SelectItem value="ecosoul">ECOSOUL</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="정렬" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">최신순</SelectItem>
                  <SelectItem value="oldest">오래된순</SelectItem>
                  <SelectItem value="points">포인트순</SelectItem>
                  <SelectItem value="name">이름순</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>회원 목록</CardTitle>
            <CardDescription>
              {filteredUsers.length}명의 회원이 표시됩니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium text-text-primary">{user.name}</h3>
                        {getGradeDisplay(user.grade || 'cedar')}
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role === 'admin' ? '관리자' :
                            user.role === 'partner' ? '파트너' : '회원'}
                        </Badge>
                        {user.emailVerified && (
                          <Badge variant="outline" className="text-green-600">
                            인증완료
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 mt-2 text-sm text-text-secondary">
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span>{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 mt-2 text-sm">
                        <span className="text-primary font-medium">
                          {user.points.toLocaleString()}P
                        </span>
                        <span className="text-text-secondary">
                          주문 {user.totalOrders}회
                        </span>
                        <span className="text-text-secondary">
                          총 구매 ₩{user.totalSpent.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleViewDetail(user)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleUserAction(user.id, 'suspend')}>
                          계정 정지
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUserAction(user.id, 'promote')}>
                          등급 상승
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUserAction(user.id, 'delete')}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b p-6">
              <div>
                <CardTitle className="text-2xl font-bold">{selectedUser.name}</CardTitle>
                <CardDescription>{selectedUser.email}</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowDetailModal(false)}>
                <XCircle className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* 기본 정보 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">역할</p>
                  <p className="font-medium">{selectedUser.role === 'admin' ? '관리자' : selectedUser.role === 'partner' ? '파트너' : '회원'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">등급</p>
                  <p className="font-medium">{(selectedUser.grade || 'CEDAR').toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">가입일</p>
                  <p className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString('ko-KR')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">마지막 로그인</p>
                  <p className="font-medium">{selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleString('ko-KR') : '없음'}</p>
                </div>
                {selectedUser.phone && (
                  <div>
                    <p className="text-sm text-gray-500">전화번호</p>
                    <p className="font-medium">{selectedUser.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">인증상태</p>
                  <Badge variant={selectedUser.emailVerified ? 'default' : 'secondary'}>{selectedUser.emailVerified ? '인증완료' : '미인증'}</Badge>
                </div>
              </div>

              {/* 활동 통계 */}
              <div className="border-t pt-4">
                <h4 className="font-bold mb-3">활동 통계</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{selectedUser.points.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">보유 포인트</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{selectedUser.totalOrders}</p>
                    <p className="text-xs text-gray-500">총 주문</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">₩{selectedUser.totalSpent.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">총 구매액</p>
                  </div>
                </div>
              </div>

              {/* 포인트 조정 */}
              <div className="border-t pt-4">
                <h4 className="font-bold mb-3">포인트 조정</h4>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    placeholder="조정할 포인트"
                    value={pointAdjustAmount || ''}
                    onChange={(e) => setPointAdjustAmount(Number(e.target.value))}
                    className="w-32"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 border-green-200 hover:bg-green-50"
                    onClick={() => handleAdjustPoints('add')}
                    disabled={adjustingPoints || pointAdjustAmount <= 0}
                  >
                    지급
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => handleAdjustPoints('subtract')}
                    disabled={adjustingPoints || pointAdjustAmount <= 0}
                  >
                    차감
                  </Button>
                </div>
              </div>

              {/* 닫기 버튼 */}
              <div className="flex justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setShowDetailModal(false)}>닫기</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}















