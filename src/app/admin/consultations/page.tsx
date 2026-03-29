'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Loader2, Search, FileText, ChevronRight, UserCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminConsultationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const res = await fetch('/api/consultation?mode=admin');
      if (res.ok) {
        const data = await res.json();
        setConsultations(data.consultations || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = consultations.filter(c => 
    c.user?.name?.includes(searchTerm) || 
    c.user?.email?.includes(searchTerm) ||
    c.navigator?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">사전 문진 관리</h1>
          <p className="text-text-secondary mt-1">고객의 회복 설계 리포트를 한 눈에 확인하고 관리합니다.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <CardTitle>접수된 문진표 ({filtered.length}건)</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <Input
                placeholder="이름, 이메일, 추천인 코드 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 border-border"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-4">
              <FileText className="h-12 w-12 text-muted-foreground opacity-20" />
              <div>
                <p className="text-lg font-medium text-text-primary">접수된 문진표가 없습니다</p>
                <p className="text-sm text-text-secondary">새로운 문진표가 작성되면 이곳에 표시됩니다.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>접수일</TableHead>
                    <TableHead>고객 정보</TableHead>
                    <TableHead>회복 형태</TableHead>
                    <TableHead>추천인(네비게이터)</TableHead>
                    <TableHead>주요 요청</TableHead>
                    <TableHead className="text-right">리포트 열람</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((item) => (
                    <TableRow key={item._id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/event/consultation/report/${item._id}`)}>
                      <TableCell className="font-medium">
                        {new Date(item.createdAt).toLocaleDateString('ko-KR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {item.user?.image ? (
                            <img src={item.user.image} alt="" className="w-8 h-8 rounded-full" />
                          ) : (
                            <UserCircle className="w-8 h-8 text-muted-foreground opacity-50" />
                          )}
                          <div>
                            <p className="font-bold text-text-primary">{item.user?.name || '익명'}</p>
                            <p className="text-xs text-text-secondary">{item.user?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 whitespace-nowrap">
                          {item.anxiety?.classifiedType || '맞춤 회복형'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.navigator ? (
                          <span className="text-sm font-medium">{item.navigator}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {item.expectation?.importantEvent?.hasEvent && (
                            <Badge variant="secondary" className="text-[10px] whitespace-nowrap">일정 있음</Badge>
                          )}
                          {item.anxiety?.points?.includes('프라이버시') && (
                            <Badge variant="secondary" className="text-[10px] whitespace-nowrap">VIP 프라이버시</Badge>
                          )}
                          {item.investment?.focusServices?.needsDedicatedManager && (
                            <Badge variant="secondary" className="text-[10px] whitespace-nowrap">전담 마크</Badge>
                          )}
                        </div>
                        {(!item.expectation?.importantEvent?.hasEvent && !item.anxiety?.points?.includes('프라이버시') && !item.investment?.focusServices?.needsDedicatedManager) && (
                           <span className="text-xs text-muted-foreground">특이사항 없음</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                         <div className="flex justify-end">
                            <Button variant="ghost" size="sm" className="w-8 h-8 p-0" title="리포트 보기">
                              <ChevronRight className="w-5 h-5 text-text-secondary" />
                            </Button>
                         </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
