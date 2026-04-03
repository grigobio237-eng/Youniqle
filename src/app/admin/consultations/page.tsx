'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search, FileText, ChevronRight, UserCircle, Zap, ClipboardList } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminConsultationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [omakaseRequests, setOmakaseRequests] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [consultationRes, omakaseRes] = await Promise.all([
        fetch('/api/consultation?mode=admin'),
        fetch('/api/admin/concierge/requests')
      ]);

      if (consultationRes.ok) {
        const data = await consultationRes.json();
        setConsultations(data.consultations || []);
      }

      if (omakaseRes.ok) {
        const data = await omakaseRes.json();
        setOmakaseRequests(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredConsultations = consultations.filter(c => 
    c.user?.name?.includes(searchTerm) || 
    c.user?.email?.includes(searchTerm) ||
    c.navigator?.includes(searchTerm)
  );

  const filteredOmakase = omakaseRequests.filter(r => 
    r.userName?.includes(searchTerm) || 
    r.userEmail?.includes(searchTerm) ||
    r.painPoint?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-text-primary">회복 설계 관리</h1>
          <p className="text-text-secondary mt-1">고객의 사전 문진표와 심층 회복 설계 요청을 통합 관리합니다.</p>
        </div>
      </div>

      <Tabs defaultValue="consultation" className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <TabsList className="bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="consultation" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <ClipboardList className="w-4 h-4 mr-2 text-indigo-500" />
              일반 사전 문진 ({filteredConsultations.length})
            </TabsTrigger>
            <TabsTrigger value="omakase" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Zap className="w-4 h-4 mr-2 text-amber-500" />
              심층 회복 설계 요청 ({filteredOmakase.length})
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="이름, 이메일, 키워드 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-11 border-slate-200 rounded-xl focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* --- [Tab 1: 일반 사전 문진] --- */}
        <TabsContent value="consultation">
          <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden rounded-2xl">
            <CardContent className="p-0">
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredConsultations.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <FileText className="h-12 w-12 text-slate-200" />
                  <div>
                    <p className="text-lg font-bold text-slate-400">접수된 문진표가 없습니다</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/50 font-bold">
                      <TableRow>
                        <TableHead>접수일</TableHead>
                        <TableHead>고객 정보</TableHead>
                        <TableHead>회복 형태</TableHead>
                        <TableHead>추천인</TableHead>
                        <TableHead>주요 요청</TableHead>
                        <TableHead className="text-right">리포트</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredConsultations.map((item) => (
                        <TableRow key={item._id} className="cursor-pointer hover:bg-slate-50/80 transition-colors" onClick={() => router.push(`/event/consultation/report/${item._id}`)}>
                          <TableCell className="font-medium text-slate-600">
                            {new Date(item.createdAt).toLocaleDateString('ko-KR')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <UserCircle className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{item.user?.name || '익명'}</p>
                                <p className="text-xs text-slate-500">{item.user?.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-white border-slate-200 text-slate-700 whitespace-nowrap">
                              {item.anxiety?.classifiedType || '맞춤 회복형'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm font-medium text-slate-600">
                            {item.navigator || '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {item.expectation?.importantEvent?.hasEvent && (
                                <Badge variant="secondary" className="text-[10px] bg-amber-50 text-amber-700">일정 있음</Badge>
                              )}
                              {item.anxiety?.points?.includes('프라이버시') && (
                                <Badge variant="secondary" className="text-[10px] bg-rose-50 text-rose-700">VIP 프라이버시</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                             <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                               <ChevronRight className="w-5 h-5 text-slate-400" />
                             </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- [Tab 2: 심층 회복 설계 요청] --- */}
        <TabsContent value="omakase">
          <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden rounded-2xl">
            <CardContent className="p-0">
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredOmakase.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <Zap className="h-12 w-12 text-slate-200" />
                  <div>
                    <p className="text-lg font-bold text-slate-400">아직 심층 설계 요청이 없습니다</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow>
                        <TableHead>요청일</TableHead>
                        <TableHead>고객 정보</TableHead>
                        <TableHead>핵심 고민 (Pain Point)</TableHead>
                        <TableHead>회복 목표</TableHead>
                        <TableHead>예산 범위</TableHead>
                        <TableHead>상세</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOmakase.map((item) => (
                        <TableRow key={item._id} className="hover:bg-slate-50/80 transition-colors">
                          <TableCell className="font-medium text-slate-600">
                            {new Date(item.createdAt).toLocaleDateString('ko-KR')}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-bold text-slate-900">{item.userName || '익명'}</p>
                              <p className="text-xs text-slate-500">{item.userEmail}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs text-xs line-clamp-2 text-slate-700">
                              {item.painPoint}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700">
                              {item.goal}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-bold text-emerald-600">
                            {item.budget}
                          </TableCell>
                          <TableCell>
                             <Badge variant={item.status === 'pending' ? 'destructive' : 'secondary'}>
                               {item.status === 'pending' ? '승인 대기' : item.status}
                             </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
