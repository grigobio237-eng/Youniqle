'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Users, Mail, Phone, Calendar, Copy, MapPin, Activity, HeartPulse, ShoppingBag, SwitchCamera, Sparkles, Shield, Star, TrendingUp, Crown, Zap, BarChart3, Building, Network } from 'lucide-react';
import ReferralNetwork from '@/components/shared/ReferralNetwork';

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const userId = resolvedParams.id;

  const [user, setUser] = useState<any>(null);
  const [behaviors, setBehaviors] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [behaviorSkip, setBehaviorSkip] = useState(0);
  const [behaviorHasMore, setBehaviorHasMore] = useState(true);
  const [loadingBehaviors, setLoadingBehaviors] = useState(false);

  // 운영 필드 폼
  const [opForm, setOpForm] = useState({
    role: '',
    grade: '',
    tier: '',
  });
  
  const [pointAdjustAmount, setPointAdjustAmount] = useState(0);

  useEffect(() => {
    fetchUserDetail();
    fetchBehaviors(0);
  }, [userId]);

  const fetchUserDetail = async () => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setOpForm({
          role: data.role || 'member',
          grade: data.grade || 'cedar',
          tier: data.tier || 'RESET',
        });
        if (data.shops) setShops(data.shops);
      }
    } catch (e) {
      console.error('Failed to fetch user:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchBehaviors = async (skip: number) => {
    if (loadingBehaviors) return;
    setLoadingBehaviors(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/behavior?limit=10&skip=${skip}`);
      if (res.ok) {
        const data = await res.json();
        if (skip === 0) setBehaviors(data.data);
        else setBehaviors(prev => [...prev, ...data.data]);
        
        setBehaviorSkip(data.pagination.skip + data.pagination.limit);
        setBehaviorHasMore(data.pagination.hasMore);
      }
    } catch (e) {
      console.error('Failed to fetch behaviors:', e);
    } finally {
      setLoadingBehaviors(false);
    }
  };

  const handleUpdateOperations = async () => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          data: opForm
        }),
      });

      if (response.ok) {
        alert('회원 운영 정보가 업데이트되었습니다.');
        fetchUserDetail();
      } else {
        alert('업데이트 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Failed to update operations:', error);
      alert('오류가 발생했습니다.');
    }
  };

  const handleToggleNavigator = async () => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggleNavigator' }),
      });
      if (response.ok) {
        fetchUserDetail();
        alert('네비게이터 권한이 변경되었습니다.');
      }
    } catch (error) {
       console.error('Failed to toggle navigator:', error);
    }
  };

  const handleAdjustPoints = async (type: 'add' | 'subtract') => {
    if (pointAdjustAmount <= 0) return;
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: type === 'add' ? 'grantPoints' : 'deductPoints',
          amount: pointAdjustAmount
        }),
      });
      if (response.ok) {
        alert(`포인트가 ${type === 'add' ? '지급' : '차감'}되었습니다.`);
        fetchUserDetail();
        setPointAdjustAmount(0);
      }
    } catch (error) {
       console.error('Failed to adjust points:', error);
    }
  };

  const handleGrantPass = async (passType: string) => {
    if (!confirm(`${passType} 패스를 해당 회원에게 지급하시겠습니까?`)) return;
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'grantPass',
          data: { passType }
        }),
      });
      if (response.ok) {
        alert(`${passType} 패스가 성공적으로 지급되었습니다.`);
        fetchUserDetail();
      } else {
        const err = await response.json();
        alert(err.error || '패스 지급에 실패했습니다.');
      }
    } catch (error) {
       console.error('Failed to grant pass:', error);
       alert('오류가 발생했습니다.');
    }
  };

  if (loading) return <div className="p-8 text-center">데이터를 불러오는 중입니다...</div>;
  if (!user) return <div className="p-8 text-center text-red-500">유저 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push('/admin/users')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          목록으로
        </Button>
        <h1 className="text-3xl font-bold">회원 상세 모니터링</h1>
      </div>

      {/* Header Summary */}
      <Card className="bg-gradient-to-r from-gray-50 to-white">
        <CardContent className="p-6 flex flex-wrap gap-6 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
               <Users className="h-8 w-8 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold flex items-center gap-2">
                {user.name}
                {user.role === 'admin' && <Badge variant="default">관리자</Badge>}
                {user.role === 'superadmin' && <Badge className="bg-red-600 text-white">최고 관리자</Badge>}
              </div>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
             {user.isNavigator && (
              <Badge className="bg-amber-500 text-white hover:bg-amber-600 px-3 py-1 flex items-center gap-1 text-xs">
                <Sparkles className="h-3 w-3" /> 네비게이터 요원
              </Badge>
            )}
             <Badge variant="outline" className={`px-3 py-1 ${user.emailVerified ? 'text-green-600 border-green-200' : 'text-gray-400'}`}>
               {user.emailVerified ? 'Email 인증됨' : 'Email 미인증'}
             </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Operation & Points */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-lg flex items-center gap-2">
                 <Shield className="h-5 w-5 text-gray-400" />
                 운영 권한 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500">역할 (Role)</label>
                <Select value={opForm.role} onValueChange={(val) => setOpForm(p => ({ ...p, role: val }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">일반 회원</SelectItem>
                    <SelectItem value="partner">파트너</SelectItem>
                    <SelectItem value="admin">관리자</SelectItem>
                    <SelectItem value="superadmin">최고 관리자</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500">회원 등급 (Grade)</label>
                <Select value={opForm.grade} onValueChange={(val) => setOpForm(p => ({ ...p, grade: val }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cedar">CEDAR</SelectItem>
                    <SelectItem value="rooter">ROOTER</SelectItem>
                    <SelectItem value="bloomer">BLOOMER</SelectItem>
                    <SelectItem value="glower">GLOWER</SelectItem>
                    <SelectItem value="ecosoul">ECOSOUL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500">접근 등급 (Tier)</label>
                <Select value={opForm.tier} onValueChange={(val) => setOpForm(p => ({ ...p, tier: val }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RESET">RESET</SelectItem>
                    <SelectItem value="REBORN">REBORN</SelectItem>
                    <SelectItem value="RESTART">RESTART</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleUpdateOperations}>권한 저장</Button>
              <div className="pt-4 border-t">
                <Button variant={user.isNavigator ? "destructive" : "outline"} className="w-full" onClick={handleToggleNavigator}>
                  {user.isNavigator ? '네비게이터 권한 해제' : '네비게이터 승격'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-lg flex items-center gap-2">
                 <Zap className="h-5 w-5 text-amber-500" />
                 패스 및 멤버십 관리
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-3">
                <div className="text-xs font-bold text-gray-500">현재 보유 패스: 
                  <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-700">
                    {user.passInfo?.type || 'NONE'}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Button 
                    variant={user.passInfo?.type === 'START' ? 'default' : 'outline'} 
                    size="sm" 
                    className="w-full justify-start h-9"
                    onClick={() => handleGrantPass('START')}
                  >
                    <Badge className="bg-blue-600 mr-2">REBORN</Badge>
                    START PASS 지급
                  </Button>
                  <Button 
                    variant={user.passInfo?.type === 'SIGNATURE' ? 'default' : 'outline'} 
                    size="sm" 
                    className="w-full justify-start h-9"
                    onClick={() => handleGrantPass('SIGNATURE')}
                  >
                    <Badge className="bg-chapter-accent text-white mr-2">RESTART</Badge>
                    SIGNATURE PASS 지급
                  </Button>
                  <Button 
                    variant={user.passInfo?.type === 'BLACK' ? 'default' : 'outline'} 
                    size="sm" 
                    className="w-full justify-start h-9"
                    onClick={() => handleGrantPass('BLACK')}
                  >
                    <Badge className="bg-obsidian text-chapter-accent border border-chapter-accent/30 mr-2">RESTART</Badge>
                    BLACK PASS 지급
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
             <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-lg flex items-center gap-2">
                 <Star className="h-5 w-5 text-gray-400" />
                 포인트 관리 (잔여: {user.points?.toLocaleString() || 0}P)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="금액"
                    value={pointAdjustAmount || ''}
                    onChange={(e) => setPointAdjustAmount(Number(e.target.value))}
                  />
                  <Button size="sm" variant="outline" className="text-green-600" onClick={() => handleAdjustPoints('add')}>지급</Button>
                  <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleAdjustPoints('subtract')}>차감</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Information & Monitoring Tabs */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="bg-gray-50 pb-3">
              <CardTitle className="text-sm font-bold text-gray-600">개인 정보 (Read-Only)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-b">
                 <div className="p-4 flex items-center gap-3">
                   <Phone className="h-5 w-5 text-gray-400" />
                   <div>
                     <p className="text-xs text-gray-500">연락처</p>
                     <p className="font-medium">{user.phone || '미등록'}</p>
                   </div>
                 </div>
                 <div className="p-4 flex items-center gap-3">
                   <Calendar className="h-5 w-5 text-gray-400" />
                   <div>
                     <p className="text-xs text-gray-500">가입일</p>
                     <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                   </div>
                 </div>
               </div>
               
               {/* 배송지 목록 */}
               <div className="p-4 bg-gray-50/50">
                 <h4 className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-1"><MapPin className="h-4 w-4" /> 등록된 배송지 목록 ({user.addresses?.length || 0}/5)</h4>
                 <div className="space-y-3">
                    {user.addresses && user.addresses.length > 0 ? (
                      user.addresses.map((addr: any, idx: number) => (
                        <div key={idx} className="bg-white border rounded-lg p-3 text-sm flex justify-between items-center">
                           <div>
                             <div className="font-bold flex items-center gap-2">
                               {addr.label}
                               {addr.isDefault && <Badge variant="secondary" className="text-[10px]">기본</Badge>}
                             </div>
                             <p className="text-gray-600 mt-1">{addr.recipient} ({addr.phone})</p>
                             <p className="text-gray-500 text-xs mt-0.5">[{addr.zip}] {addr.addr1} {addr.addr2}</p>
                           </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">등록된 배송지가 없습니다.</p>
                    )}
                 </div>
               </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="behaviors" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-12 bg-transparent p-0">
              <TabsTrigger value="behaviors" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                활동 타임라인
              </TabsTrigger>
              <TabsTrigger value="diagnosis" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                진단 내역
              </TabsTrigger>
              <TabsTrigger value="orders" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                구매 및 포인트 이력
              </TabsTrigger>
              {user.isNavigator && (
                <TabsTrigger value="shops" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-amber-600 font-bold">
                  네비게이터 관리 업소
                </TabsTrigger>
              )}
              <TabsTrigger value="referral" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                조직도
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="behaviors" className="mt-4">
              <Card>
                <CardContent className="p-0">
                   <div className="divide-y relative">
                      {behaviors.length > 0 ? (
                        behaviors.map((beh: any, idx: number) => (
                          <div key={idx} className="p-4 flex gap-4 hover:bg-gray-50 transition-colors">
                              <div className="mt-1">
                                {beh.eventType === 'view' ? <SwitchCamera className="h-4 w-4 text-gray-400" /> :
                                 beh.eventType === 'click' ? <Activity className="h-4 w-4 text-blue-400" /> :
                                 <ShoppingBag className="h-4 w-4 text-green-400" />}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <p className="text-sm font-bold capitalize">{beh.eventType.replace(/_/g, ' ')}</p>
                                  <p className="text-xs text-gray-400">{new Date(beh.timestamp).toLocaleString()}</p>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 truncate" title={beh.context?.pageUrl}>
                                  Action at: {beh.context?.pageUrl}
                                </p>
                                {beh.itemData?.name && <p className="text-xs font-semibold mt-1 bg-gray-100 inline-block px-2 py-0.5 rounded">Target: {beh.itemData.name}</p>}
                              </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-gray-500">활동 기록이 없습니다.</div>
                      )}
                   </div>
                   {behaviorHasMore && (
                     <div className="p-4 border-t text-center">
                       <Button variant="outline" onClick={() => fetchBehaviors(behaviorSkip)} disabled={loadingBehaviors}>
                         {loadingBehaviors ? '불러오는 중...' : '활동 로그 더보기'}
                       </Button>
                     </div>
                   )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="diagnosis" className="mt-4">
              <Card>
                <CardContent className="p-0 divide-y">
                   {user.diagnosisHistories && user.diagnosisHistories.length > 0 ? (
                     user.diagnosisHistories.map((diag: any, idx: number) => (
                       <div key={idx} className="p-4 flex gap-4">
                         <HeartPulse className="h-6 w-6 text-red-400 mt-1" />
                         <div className="flex-1">
                           <div className="flex justify-between">
                             <p className="font-bold">{diag.resultTitle}</p>
                             <p className="text-xs text-gray-400">{new Date(diag.createdAt).toLocaleDateString()}</p>
                           </div>
                           <p className="text-sm text-gray-600 mt-1">Total Score: <span className="font-bold text-primary">{Math.round(diag.totalScore)}</span></p>
                         </div>
                       </div>
                     ))
                   ) : (
                     <div className="p-8 text-center text-gray-500">진단 이력이 없습니다.</div>
                   )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders" className="mt-4">
              <Card>
                <CardContent className="p-0 divide-y">
                   {user.pointHistories && user.pointHistories.length > 0 ? (
                     user.pointHistories.map((tx: any, idx: number) => (
                       <div key={idx} className="p-4 flex justify-between items-center hover:bg-gray-50">
                         <div>
                            <p className="text-sm font-bold">{tx.description}</p>
                            <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleString()}</p>
                         </div>
                         <div className="text-right">
                           <p className={`text-sm font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                             {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} P
                           </p>
                           <p className="text-xs text-gray-500">잔액: {tx.balance?.toLocaleString() || 0} P</p>
                         </div>
                       </div>
                     ))
                   ) : (
                     <div className="p-8 text-center text-gray-500">포인트 거래 내역이 없습니다.</div>
                   )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="shops" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shops.length > 0 ? (
                  shops.map((shop: any, idx: number) => (
                    <Card key={idx} className="overflow-hidden border-amber-100 hover:shadow-md transition-shadow">
                      <div className="bg-amber-50 px-4 py-3 border-b border-amber-100 flex justify-between items-center">
                        <Badge className="bg-white text-amber-600 border-amber-200">Shop ID: {shop.shopCode}</Badge>
                        <Badge variant={shop.isActive ? "default" : "secondary"}>{shop.isActive ? '운영중' : '중지'}</Badge>
                      </div>
                      <CardContent className="p-5 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-lg font-black text-obsidian">{shop.name}</h4>
                            <p className="text-sm text-slate/60">{shop.category || '업종 미지정'}</p>
                          </div>
                          {shop.stats && (
                            <div className="text-right">
                              <p className="text-[10px] text-slate/40 font-bold uppercase tracking-wider">Recent Activity</p>
                              <p className="text-xs font-bold text-slate/60">
                                {shop.stats.lastActivity ? new Date(shop.stats.lastActivity).toLocaleDateString() : '활동 없음'}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {shop.stats && (
                          <div className="grid grid-cols-2 gap-2 py-2">
                            <div className="bg-slate/5 rounded-lg p-2 text-center border border-slate/5">
                              <p className="text-[10px] text-slate/40 font-bold">총 리포트</p>
                              <p className="text-sm font-black text-obsidian">{shop.stats.totalReports}건</p>
                            </div>
                            <div className="bg-primary/5 rounded-lg p-2 text-center border border-primary/10">
                              <p className="text-[10px] text-primary/60 font-bold">분석 완료</p>
                              <p className="text-sm font-black text-primary">{shop.stats.analyzedReports}건</p>
                            </div>
                          </div>
                        )}
                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            className="flex-1 rounded-xl h-10 text-xs font-bold"
                            onClick={() => router.push(`/navigator/shops/${shop.id}`)}
                          >
                            <BarChart3 className="w-3.5 h-3.5 mr-1.5" /> 분석 리포트 확인
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="col-span-full border-dashed border-2 py-10 bg-transparent">
                    <div className="text-center space-y-2">
                       <Building className="w-10 h-10 text-slate/20 mx-auto" />
                       <p className="text-slate/40 font-bold">등록된 업소가 없습니다.</p>
                    </div>
                  </Card>
                )}
              </div>
            </TabsContent>
            <TabsContent value="referral" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <ReferralNetwork userId={userId} mode="tree" />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

        </div>
      </div>
    </div>
  );
}
