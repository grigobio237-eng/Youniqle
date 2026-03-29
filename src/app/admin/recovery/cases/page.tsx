"use client";

import React, { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Phone, Calendar, MoreHorizontal, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { useToast } from "@/components/ui/toast";

type CaseStatus = "new" | "contacted" | "scheduled" | "recovering" | "completed";

interface RecoveryCase {
  id: string;
  name: string;
  procedure: string;
  expectation: string;
  date: string;
  status: CaseStatus;
  contact: string;
}

const MOCK_CASES: RecoveryCase[] = [
  { id: "C001", name: "김유한", procedure: "줄기세포 시술", expectation: "드라마틱한 변화", date: "2024-03-27", status: "new", contact: "010-1234-5678" },
  { id: "C002", name: "이지아", procedure: "안면 윤곽 수술", expectation: "자연스러운 변화", date: "2024-03-26", status: "recovering", contact: "010-9876-5432" },
  { id: "C003", name: "박준서", procedure: "지방 흡입", expectation: "적당한 변화", date: "2024-03-26", status: "scheduled", contact: "010-5555-4444" },
  { id: "C004", name: "최혜린", procedure: "리프팅", expectation: "드 드라마틱한 변화", date: "2024-03-25", status: "contacted", contact: "010-2222-3333" },
  { id: "C005", name: "정우진", procedure: "피부 재생", expectation: "자연스러운 변화", date: "2024-03-24", status: "completed", contact: "010-8888-7777" },
];

export default function AdminRecoveryCasesPage() {
  const { addToast } = useToast();
  const [cases, setCases] = useState(MOCK_CASES);
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusBadge = (status: CaseStatus) => {
    switch (status) {
      case "new": return <Badge className="bg-status-danger text-white">신규 문진</Badge>;
      case "contacted": return <Badge className="bg-status-amber text-obsidian">상담 진행중</Badge>;
      case "scheduled": return <Badge className="bg-primary text-background">예약 확정</Badge>;
      case "recovering": return <Badge className="bg-status-good text-white font-bold animate-pulse">실시간 모니터링</Badge>;
      case "completed": return <Badge className="bg-mist text-slate">종료</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const handleStatusChange = (id: string, newStatus: CaseStatus) => {
    setCases(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    addToast({ title: "상태 변경", description: `케이스 ${id}의 상태가 변경되었습니다.`, variant: "success" });
  };

  return (
    <AdminLayout>
      <div className="space-y-8 p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight">Recovery Case Management</h1>
            <p className="text-text-secondary font-medium">네비게이터 QR 유입 및 고의도 유저의 회복 여정을 관리합니다.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="h-12 rounded-xl border-line">
              <Filter className="w-4 h-4 mr-2" /> 필터
            </Button>
            <Button className="h-12 rounded-xl bg-primary text-background font-black shadow-lg">
              보고서 생성
            </Button>
          </div>
        </div>

        {/* Dashboard Cards for Cases */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-none shadow-md bg-white">
            <CardContent className="p-6">
              <p className="text-xs font-bold text-text-tertiary uppercase mb-1">신규 문진</p>
              <h3 className="text-3xl font-black text-status-danger">1건</h3>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md bg-white">
            <CardContent className="p-6">
              <p className="text-xs font-bold text-text-tertiary uppercase mb-1">실시간 케어 중</p>
              <h3 className="text-3xl font-black text-status-good">12건</h3>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md bg-white">
            <CardContent className="p-6">
              <p className="text-xs font-bold text-text-tertiary uppercase mb-1">상담/예약 대기</p>
              <h3 className="text-3xl font-black text-primary">5건</h3>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md bg-white">
            <CardContent className="p-6">
              <p className="text-xs font-bold text-text-tertiary uppercase mb-1">금일 종료</p>
              <h3 className="text-3xl font-black text-obsidian">3건</h3>
            </CardContent>
          </Card>
        </div>

        <Card className="border-line shadow-sm rounded-[24px] overflow-hidden">
          <CardHeader className="bg-mist/30 border-b border-line px-8 py-6">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
              <Input 
                placeholder="환자명, 시술 종류 검색..." 
                className="pl-10 h-10 border-line rounded-xl"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-background">
                <TableRow className="hover:bg-transparent border-line">
                  <TableHead className="w-[100px] font-black px-8">No.</TableHead>
                  <TableHead className="font-black">환자명</TableHead>
                  <TableHead className="font-black">시술 종류</TableHead>
                  <TableHead className="font-black">변화 기대치</TableHead>
                  <TableHead className="font-black text-center">상태</TableHead>
                  <TableHead className="font-black text-right px-8">액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases
                  .filter(c => c.name.includes(searchTerm) || c.procedure.includes(searchTerm))
                  .map((c) => (
                  <TableRow key={c.id} className="hover:bg-mist/20 transition-colors border-line">
                    <TableCell className="font-bold text-text-tertiary px-8">{c.id}</TableCell>
                    <TableCell>
                      <div className="font-black text-obsidian">{c.name}</div>
                      <div className="text-[10px] text-text-tertiary">{c.contact}</div>
                    </TableCell>
                    <TableCell className="font-medium">{c.procedure}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-line text-[10px]">{c.expectation}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{getStatusBadge(c.status)}</TableCell>
                    <TableCell className="text-right px-8">
                      <div className="flex justify-end gap-2">
                        {c.status === "new" && (
                          <Button size="icon" variant="outline" className="w-9 h-9 border-line rounded-lg text-primary hover:bg-primary hover:text-white" onClick={() => handleStatusChange(c.id, "contacted")}>
                            <Phone className="w-4 h-4" />
                          </Button>
                        )}
                        {c.status === "contacted" && (
                          <Button size="icon" variant="outline" className="w-9 h-9 border-line rounded-lg text-primary hover:bg-primary hover:text-white" onClick={() => handleStatusChange(c.id, "scheduled")}>
                            <Calendar className="w-4 h-4" />
                          </Button>
                        )}
                        {c.status === "scheduled" && (
                          <Button size="icon" variant="outline" className="w-9 h-9 border-line rounded-lg text-status-good hover:bg-status-good hover:text-white" onClick={() => handleStatusChange(c.id, "recovering")}>
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" className="w-9 h-9 rounded-lg">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
