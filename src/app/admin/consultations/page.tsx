'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  Search, 
  FileText, 
  ChevronRight, 
  UserCircle, 
  Zap, 
  ClipboardList, 
  MessageSquare, 
  AlertTriangle,
  Clock,
  CheckCircle2,
  BellRing
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';
import { AnimatePresence, motion } from 'framer-motion';

export default function AdminConsultationsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [omakaseRequests, setOmakaseRequests] = useState<any[]>([]);
  const [navigatorConsults, setNavigatorConsults] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedConsult, setSelectedConsult] = useState<any>(null);
  const [adminAnswer, setAdminAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [consultationRes, omakaseRes, navigatorRes] = await Promise.all([
        fetch('/api/consultation?mode=admin'),
        fetch('/api/admin/concierge/requests'),
        fetch('/api/consultation/navigator?mode=admin')
      ]);

      if (consultationRes.ok) {
        const data = await consultationRes.json();
        setConsultations(data.consultations || []);
      }

      if (omakaseRes.ok) {
        const data = await omakaseRes.json();
        setOmakaseRequests(data || []);
      }

      if (navigatorRes.ok) {
        const data = await navigatorRes.json();
        setNavigatorConsults(data.consultations || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNudge = async (id: string) => {
    try {
      const res = await fetch('/api/consultation/navigator', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'nudge' })
      });
      if (res.ok) {
        addToast({ title: '성공', description: '네비게이터에게 독촉 알림을 보냈습니다.', variant: 'success' });
        fetchAllData();
      }
    } catch (err) {
      addToast({ title: '오류', description: '독촉 전송 실패', variant: 'error' });
    }
  };

  const handleAdminAnswer = async () => {
    if (!adminAnswer.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/consultation/navigator', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: selectedConsult._id, 
          action: 'answer', 
          answer: `[관리자 직접 답변] ${adminAnswer.trim()}`
        })
      });
      if (res.ok) {
        addToast({ title: '성공', description: '상태가 업데이트되었습니다.', variant: 'success' });
        setSelectedConsult(null);
        setAdminAnswer('');
        fetchAllData();
      }
    } catch (err) {
      addToast({ title: '오류', description: '업데이트 실패', variant: 'error' });
    } finally {
      setSubmitting(false);
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

  const filteredNavConsults = navigatorConsults.filter(c => 
    c.userName?.includes(searchTerm) || 
    c.userEmail?.includes(searchTerm) ||
    c.navigatorId?.includes(searchTerm) ||
    c.ticketId?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-text-primary">상담 및 회복 관리</h1>
          <p className="text-text-secondary mt-1">사전 문진, 심층 설계, 네비게이터 상담 티켓을 통합 모니터링합니다.</p>
        </div>
      </div>

      <Tabs defaultValue="nav-consult" className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <TabsList className="bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="nav-consult" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <MessageSquare className="w-4 h-4 mr-2 text-indigo-500" />
              네비게이터 상담 ({filteredNavConsults.length})
            </TabsTrigger>
            <TabsTrigger value="consultation" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <ClipboardList className="w-4 h-4 mr-2 text-blue-500" />
              일반 사전 문진 ({filteredConsultations.length})
            </TabsTrigger>
            <TabsTrigger value="omakase" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Zap className="w-4 h-4 mr-2 text-amber-500" />
              심층 회복 설계 ({filteredOmakase.length})
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="이름, 이메일, 티켓 번호..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-11 border-slate-200 rounded-xl focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* --- [Tab 0: 네비게이터 상담 관리] --- */}
        <TabsContent value="nav-consult">
          <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden rounded-2xl">
            <CardContent className="p-0">
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredNavConsults.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <MessageSquare className="h-12 w-12 text-slate-200" />
                  <p className="text-lg font-bold text-slate-400">접수된 상담 티켓이 없습니다</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow>
                        <TableHead>티켓 ID</TableHead>
                        <TableHead>고객 정보</TableHead>
                        <TableHead>네비게이터</TableHead>
                        <TableHead>상담 내용</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead className="text-right">액션</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredNavConsults.map((item) => (
                        <TableRow key={item._id} className="cursor-default group hover:bg-slate-50/80 transition-colors">
                          <TableCell className="text-xs font-black text-slate-400 uppercase">{item.ticketId}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-bold text-slate-900">{item.userName}</p>
                              <p className="text-xs text-slate-500">{item.userEmail}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-bold text-indigo-600 bg-indigo-50 border-indigo-100 italic">
                              {item.navigatorId}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            <p className="text-sm text-slate-600 line-clamp-1 italic">"{item.question}"</p>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Badge variant={item.status === 'pending' ? 'destructive' : 'secondary'} className="w-fit">
                                {item.status === 'pending' ? '미응대' : item.status}
                              </Badge>
                              {item.nudgeCount > 0 && (
                                <span className="text-[10px] text-rose-500 font-bold flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" /> 독촉 {item.nudgeCount}회
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                             <Button 
                               variant="ghost" 
                               size="sm" 
                               onClick={() => handleNudge(item._id)}
                               className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                               title="네비게이터 독촉"
                             >
                               <BellRing className="w-4 h-4" />
                             </Button>
                             <Button 
                               variant="ghost" 
                               size="sm" 
                               onClick={() => setSelectedConsult(item)}
                               className="text-indigo-600 hover:bg-indigo-50"
                               title="상세 및 개입"
                             >
                               <ChevronRight className="w-5 h-5" />
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
                  <p className="text-lg font-bold text-slate-400">접수된 문진표가 없습니다</p>
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
                  <p className="text-lg font-bold text-slate-400">아직 심층 설계 요청이 없습니다</p>
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
                        <TableHead>상태</TableHead>
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

      {/* Admin Intervention Modal */}
      <AnimatePresence>
        {selectedConsult && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-8 overflow-y-auto space-y-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900">상담 티켓 상세 모니터링</h3>
                  <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">{selectedConsult.ticketId}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl">
                   <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase">고객</p>
                     <p className="font-bold">{selectedConsult.userName}</p>
                   </div>
                   <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase">담당 네비게이터</p>
                     <p className="font-bold text-indigo-600">{selectedConsult.navigatorId}</p>
                   </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">상담 내용</p>
                  <div className="p-5 bg-mist/30 rounded-2xl text-slate-700 text-sm leading-relaxed italic">
                    "{selectedConsult.question}"
                  </div>
                </div>

                {selectedConsult.answer && (
                  <div className="space-y-2">
                    <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">네비게이터 답변</p>
                    <div className="p-5 bg-indigo-50/30 rounded-2xl text-indigo-900 text-sm leading-relaxed border border-indigo-100">
                      {selectedConsult.answer}
                    </div>
                  </div>
                )}

                {selectedConsult.status === 'pending' && (
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <p className="text-sm font-black text-slate-700">관리자 직접 답변 및 개입</p>
                    </div>
                    <textarea 
                      value={adminAnswer}
                      onChange={(e) => setAdminAnswer(e.target.value)}
                      placeholder="네비게이터가 바쁘거나 응대가 늦을 경우 대신 답변할 수 있습니다."
                      className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                    />
                  </div>
                )}
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
                <Button variant="ghost" className="flex-1 rounded-xl font-bold" onClick={() => setSelectedConsult(null)}>닫기</Button>
                {selectedConsult.status === 'pending' && (
                  <Button 
                    className="flex-[2] rounded-xl font-black bg-obsidian text-white" 
                    onClick={handleAdminAnswer}
                    disabled={submitting || !adminAnswer.trim()}
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                    관리자 답변 등록
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
