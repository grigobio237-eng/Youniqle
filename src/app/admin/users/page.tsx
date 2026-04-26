'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  Zap,
  Sparkles,
  XCircle,
  Brain,
  Activity
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
  role: 'member' | 'partner' | 'admin' | 'superadmin' | 'user';
  grade?: 'cedar' | 'rooter' | 'bloomer' | 'glower' | 'ecosoul';
  tier?: 'RESET' | 'REBORN' | 'RESTART'; // 접근 권한 등급
  isNavigator?: boolean; // 영업사원(네비게이터) 지정 여부
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
  recoveryStats?: {
    lastScore: number;
    lastDiagnosisDate?: string;
    diagnosisCount: number;
    latestActivityType: string;
    lastActivityDate?: string;
    scannerCount: number;
  };
  passInfo?: {
    type: 'NONE' | 'START' | 'SIGNATURE' | 'BLACK';
    status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
    endDate?: string;
  };
}

const gradeColors = {
  cedar: 'bg-gray-100 text-gray-800',
  rooter: 'bg-green-100 text-green-800',
  bloomer: 'bg-blue-100 text-blue-800',
  glower: 'bg-purple-100 text-purple-800',
  ecosoul: 'bg-yellow-100 text-yellow-800',
  essence: 'bg-emerald-100 text-emerald-800',
  balance: 'bg-violet-100 text-violet-800',
  miracle: 'bg-amber-100 text-amber-800'
};

const gradeIcons = {
  cedar: Shield,
  rooter: Star,
  bloomer: TrendingUp,
  glower: Crown,
  ecosoul: Crown,
  essence: Zap,
  balance: Star,
  miracle: Sparkles
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  // User detail modal
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [pointAdjustAmount, setPointAdjustAmount] = useState(0);
  const [adjustingPoints, setAdjustingPoints] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [searchQuery, roleFilter, gradeFilter, tierFilter, sortBy]);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (gradeFilter !== 'all') params.append('grade', gradeFilter);
      if (tierFilter !== 'all') params.append('tier', tierFilter);
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
    router.push(`/admin/users/${user.id}`);
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

    const matchesRole = roleFilter === 'all' || 
      (roleFilter === 'navigator' ? user.isNavigator : user.role === roleFilter);
    const matchesGrade = gradeFilter === 'all' || (user.grade || 'cedar') === gradeFilter;
    const matchesTier = tierFilter === 'all' || (user.tier || 'RESET') === tierFilter;

    return matchesSearch && matchesRole && matchesGrade && matchesTier;
  });

  const getGradeDisplay = (grade: string) => {
    const GradeIcon = gradeIcons[grade as keyof typeof gradeIcons] || Shield; // 기본값으로 Shield 사용
    const colorClass = gradeColors[grade as keyof typeof gradeColors] || 'bg-gray-100 text-gray-800'; // 기본값으로 gray 사용

    return (
      <Badge className={`${colorClass} flex items-center gap-1 shadow-sm uppercase tracking-tighter text-[10px]`}>
        <GradeIcon className="w-3 h-3" />
        {grade}
      </Badge>
    );
  };

  const getPassBadge = (passInfo?: User['passInfo']) => {
    if (!passInfo || passInfo.type === 'NONE') return null;
    
    const colors = {
      START: 'bg-blue-600 text-white',
      SIGNATURE: 'bg-chapter-accent text-white font-black',
      BLACK: 'bg-obsidian text-chapter-accent border border-chapter-accent/50 group-hover:bg-black'
    };
    
    return (
      <Badge className={`${colors[passInfo.type as keyof typeof colors] || 'bg-gray-500'} flex items-center gap-1 shadow-sm uppercase tracking-tighter text-[10px]`}>
        <Zap className="h-3 w-3" />
        {passInfo.type} PASS
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">회원 관리</h1>
            <p className="text-sm text-text-secondary mt-1">
              총 {users.length}명의 회원을 관리하고 있습니다
            </p>
          </div>
          <Button className="w-full sm:w-auto">
            <Users className="h-4 w-4 mr-2" />
            새 회원 초대
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          <Card className="shadow-sm">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] md:text-sm font-medium text-text-secondary">총 회원</p>
                  <p className="text-lg md:text-2xl font-bold text-text-primary">{users.length}</p>
                </div>
                <div className="p-1.5 md:p-3 rounded-full bg-blue-100 text-blue-600 hidden xs:block">
                  <Users className="h-4 w-4 md:h-6 md:h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] md:text-sm font-medium text-text-secondary">활성 회원</p>
                  <p className="text-lg md:text-2xl font-bold text-text-primary">
                    {users.filter(u => u.lastLoginAt && new Date(u.lastLoginAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
                  </p>
                </div>
                <div className="p-1.5 md:p-3 rounded-full bg-green-100 text-green-600 hidden xs:block">
                  <TrendingUp className="h-4 w-4 md:h-6 md:h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] md:text-sm font-medium text-text-secondary">파트너</p>
                  <p className="text-lg md:text-2xl font-bold text-text-primary">
                    {users.filter(u => u.role === 'partner').length}
                  </p>
                </div>
                <div className="p-1.5 md:p-3 rounded-full bg-purple-100 text-purple-600 hidden xs:block">
                  <Shield className="h-4 w-4 md:h-6 md:h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] md:text-sm font-medium text-text-secondary">총 포인트</p>
                  <p className="text-lg md:text-2xl font-bold text-text-primary">
                    {users.reduce((sum, u) => sum + u.points, 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-1.5 md:p-3 rounded-full bg-yellow-100 text-yellow-600 hidden xs:block">
                  <Star className="h-4 w-4 md:h-6 md:h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="shadow-sm">
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="sm:col-span-2 lg:col-span-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="이름/이메일 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-10"
                  />
                </div>
              </form>

              {/* Role Filter */}
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="역할" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 역할</SelectItem>
                  <SelectItem value="member">일반 회원</SelectItem>
                  <SelectItem value="partner">파트너</SelectItem>
                  <SelectItem value="admin">관리자</SelectItem>
                  <SelectItem value="superadmin">최고 관리자</SelectItem>
                  <SelectItem value="navigator">네비게이터 요원</SelectItem>
                </SelectContent>
              </Select>

              {/* Grade Filter */}
              <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger className="w-full h-10">
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

              {/* Tier Filter */}
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="접근 권한" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 권한</SelectItem>
                  <SelectItem value="RESET">RESET</SelectItem>
                  <SelectItem value="REBORN">REBORN</SelectItem>
                  <SelectItem value="RESTART">RESTART</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="정렬" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">최신순</SelectItem>
                  <SelectItem value="oldest">오래된순</SelectItem>
                  <SelectItem value="points">포인트순</SelectItem>
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
                <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors gap-4 shadow-sm bg-white">
                  <div className="flex items-start sm:items-center space-x-3 md:space-x-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <Users className="h-5 w-5 md:h-6 md:h-6 text-primary" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                        <h3 className="font-bold text-text-primary text-sm md:text-base truncate max-w-[120px] sm:max-w-none">{user.name}</h3>
                        <div className="flex flex-wrap gap-1">
                          {getGradeDisplay(user.grade || 'cedar')}
                          <Badge className={`text-[9px] px-1.5 py-0 h-4 ${user.tier === 'RESTART' ? 'bg-purple-100 text-purple-800' :
                            user.tier === 'REBORN' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                            {user.tier || 'RESET'}
                          </Badge>
                          {user.role === 'admin' && (
                            <Badge variant="default" className="text-[9px] px-1.5 py-0 h-4">관리자</Badge>
                          )}
                          {user.role === 'superadmin' && (
                            <Badge className="bg-red-600 text-white text-[9px] px-1.5 py-0 h-4">최고 관리자</Badge>
                          )}
                          {user.isNavigator && (
                            <Badge className="bg-amber-500 text-white border-none text-[9px] px-1.5 py-0 h-4 flex items-center gap-0.5">
                              <Sparkles className="h-2 w-2" />
                              <span>NAV</span>
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-x-3 gap-y-1 mt-1.5 text-[11px] md:text-sm text-text-secondary">
                        <div className="flex items-center space-x-1 truncate max-w-[200px]">
                          <Mail className="h-3 w-3 shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          {user.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="h-3 w-3 shrink-0" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3 shrink-0" />
                            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 md:gap-4 mt-3 pt-3 border-t border-gray-50">
                        {/* Recovery Score Badge */}
                        <div className="flex items-center gap-2">
                          <div className={`px-2 py-1 rounded-lg font-black text-xs flex items-center gap-1.5 ${
                            (user.recoveryStats?.lastScore || 0) >= 80 ? 'bg-green-100 text-green-700' :
                            (user.recoveryStats?.lastScore || 0) >= 50 ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            <Brain className="w-3.5 h-3.5" />
                            <span>{user.recoveryStats?.lastScore || 0}점</span>
                          </div>
                          <span className="text-[10px] text-text-secondary font-medium">최근 진단</span>
                        </div>

                        {/* Recent Activity Badge */}
                        <div className="flex items-center gap-2">
                          <div className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5" />
                            <span>{user.recoveryStats?.latestActivityType || '없음'}</span>
                          </div>
                          <span className="text-[10px] text-text-secondary font-medium">최근 활동</span>
                        </div>

                        {/* Order & Spend Info (Compact) */}
                        <div className="flex items-center gap-4 text-[11px] md:text-xs">
                          <div className="flex flex-col">
                            <span className="text-text-secondary text-[9px] uppercase font-bold">보유 포인트</span>
                            <span className="text-primary font-black">{user.points.toLocaleString()}P</span>
                          </div>
                          <div className="flex flex-col border-l pl-4">
                            <span className="text-text-secondary text-[9px] uppercase font-bold">누적 결제</span>
                            <span className="text-text-primary font-black">₩{user.totalSpent.toLocaleString()}</span>
                          </div>
                          <div className="flex flex-col border-l pl-4">
                            <span className="text-text-secondary text-[9px] uppercase font-bold">이용 횟수</span>
                            <span className="text-text-primary font-black">진단 {user.recoveryStats?.diagnosisCount || 0} / 스캔 {user.recoveryStats?.scannerCount || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-1 border-t pt-3 sm:border-0 sm:pt-0">
                    <Button variant="outline" size="sm" onClick={() => handleViewDetail(user)} className="h-8 px-2 flex-1 sm:flex-none">
                      <Eye className="h-4 w-4 mr-1 sm:mr-0" />
                      <span className="sm:hidden text-xs">상세</span>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 px-2">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleUserAction(user.id, 'suspend')}>
                          계정 정지
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUserAction(user.id, 'promote')}>
                          회원 등급 상승
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUserAction(user.id, 'promoteTier')}>
                          접근 등급 상승 (REBORN/RESTART)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUserAction(user.id, 'toggleNavigator')}>
                          {user.isNavigator ? '네비게이터 권한 해제' : '네비게이터 승인 (영업사원)'}
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

    </>
  );
}















