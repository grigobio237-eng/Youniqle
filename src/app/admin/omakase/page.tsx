'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Eye, Mail, CheckCircle, Clock, XCircle, Filter } from 'lucide-react';

interface OmakaseApplication {
    id: string;
    userName: string;
    email: string;
    painPoint: string;
    goal: string;
    budget: string;
    selectedPlan: string;
    status: 'pending' | 'reviewing' | 'approved' | 'rejected';
    createdAt: string;
}

function OmakaseManagementContent() {
    const [applications, setApplications] = useState<OmakaseApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        // Mock data - replace with API call
        const mockData: OmakaseApplication[] = [
            {
                id: '1',
                userName: '김**',
                email: 'kim***@gmail.com',
                painPoint: '만성피로',
                goal: '알람 없이 일어나고 싶어요',
                budget: '50만원',
                selectedPlan: 'Plan B: 집중 균형',
                status: 'pending',
                createdAt: '2024-12-15T10:30:00'
            },
            {
                id: '2',
                userName: '박**',
                email: 'park***@naver.com',
                painPoint: '통증/붓기',
                goal: '다리 부종 해결',
                budget: '100만원+',
                selectedPlan: 'Plan C: 완전한 재설계',
                status: 'reviewing',
                createdAt: '2024-12-14T14:20:00'
            },
            {
                id: '3',
                userName: '이**',
                email: 'lee***@daum.net',
                painPoint: '멘탈/수면',
                goal: '숙면하고 싶어요',
                budget: '30만원',
                selectedPlan: 'Plan A: 기초 회복',
                status: 'approved',
                createdAt: '2024-12-13T09:15:00'
            }
        ];
        setApplications(mockData);
        setLoading(false);
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="w-3 h-3" />대기</Badge>;
            case 'reviewing':
                return <Badge variant="default" className="flex items-center gap-1 bg-blue-500"><Eye className="w-3 h-3" />검토중</Badge>;
            case 'approved':
                return <Badge variant="default" className="flex items-center gap-1 bg-green-500"><CheckCircle className="w-3 h-3" />승인</Badge>;
            case 'rejected':
                return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="w-3 h-3" />거절</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const filteredApps = filter === 'all'
        ? applications
        : applications.filter(app => app.status === filter);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">오마카세 신청 관리</h1>
                    <p className="text-gray-500 mt-1">비밀 회복 오마카세 신청서를 검토하고 관리합니다.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>전체</Button>
                    <Button variant={filter === 'pending' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('pending')}>대기</Button>
                    <Button variant={filter === 'reviewing' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('reviewing')}>검토중</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-gray-500">전체 신청</p>
                        <p className="text-3xl font-bold">{applications.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-gray-500">대기중</p>
                        <p className="text-3xl font-bold text-orange-500">{applications.filter(a => a.status === 'pending').length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-gray-500">검토중</p>
                        <p className="text-3xl font-bold text-blue-500">{applications.filter(a => a.status === 'reviewing').length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-gray-500">승인됨</p>
                        <p className="text-3xl font-bold text-green-500">{applications.filter(a => a.status === 'approved').length}</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>신청서 목록</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>신청자</TableHead>
                                <TableHead>주요 고민</TableHead>
                                <TableHead>선택 플랜</TableHead>
                                <TableHead>예산</TableHead>
                                <TableHead>상태</TableHead>
                                <TableHead>신청일</TableHead>
                                <TableHead>액션</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredApps.map((app) => (
                                <TableRow key={app.id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{app.userName}</p>
                                            <p className="text-xs text-gray-400">{app.email}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>{app.painPoint}</TableCell>
                                    <TableCell><span className="font-medium text-primary">{app.selectedPlan}</span></TableCell>
                                    <TableCell>{app.budget}</TableCell>
                                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                                    <TableCell>{new Date(app.createdAt).toLocaleDateString('ko-KR')}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline"><Eye className="w-4 h-4" /></Button>
                                            <Button size="sm" variant="outline"><Mail className="w-4 h-4" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

export default function AdminOmakasePage() {
    return (
        <AdminLayout>
            <OmakaseManagementContent />
        </AdminLayout>
    );
}
