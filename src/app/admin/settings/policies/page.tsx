'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Settings2, FileText, FileClock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Policy {
  _id: string;
  type: string;
  title: string;
  version: number;
  effectiveDate?: string;
  isRequired: boolean;
  isActive: boolean;
  updatedAt: string;
}

export default function PoliciesAdminPage() {
  const router = useRouter();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const res = await fetch('/api/admin/policies', { credentials: 'include' });
      if (!res.ok) throw new Error('데이터를 불러오지 못했습니다.');
      const json = await res.json();
      if (json.success) {
        setPolicies(json.data.policies);
      }
    } catch (err) {
      toast.error('로딩 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`정말 '${title}' 약관을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return;

    try {
      const res = await fetch(`/api/admin/policies/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message || '성공적으로 삭제되었습니다.');
        fetchPolicies();
      } else {
        toast.error(json.error || '삭제 중 오류가 발생했습니다.');
      }
    } catch (err) {
      toast.error('네트워크 오류가 발생했습니다.');
    }
  };

  const activeCount = policies.filter((p) => p.isActive).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">약관 및 보안 관리</h1>
          <p className="text-gray-500 mt-1 flex items-center">
            <Settings2 className="w-4 h-4 mr-2" />
            웹 화면에 노출되는 동의서 및 약관을 동적으로 설정하고 버전을 관리합니다.
          </p>
        </div>
        <Button asChild className="bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl h-12 px-6">
          <Link href="/admin/settings/policies/new">
            <Plus className="w-5 h-5 mr-2" />
            새로운 약관 만들기
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b pb-4">
            <CardTitle className="text-lg font-bold flex items-center">
              <FileText className="w-5 h-5 mr-2 text-indigo-600" />
              적용 중인 정책 목록 ({activeCount}개)
            </CardTitle>
            <CardDescription>현재 시스템에 실시간으로 적용되고 있는 최신 버전의 약관들입니다.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-gray-400 font-medium">불러오는 중...</div>
            ) : policies.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">등록된 약관이 없습니다</h3>
                <p className="text-gray-500 mb-4">기존의 하드코딩된 약관 텍스트들을 데이터베이스로 옮겨와 관리를 시작하세요.</p>
                <Button 
                  onClick={async () => {
                    const res = await fetch('/api/admin/policies/seed', { method: 'POST', credentials: 'include' });
                    if (res.ok) {
                      toast.success('초기 약관 마이그레이션이 완료되었습니다.');
                      fetchPolicies();
                    } else {
                      toast.error('씨딩에 실패했습니다. 관리자 권한을 확인하세요.');
                    }
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 font-bold"
                >
                  기존 약관 데이터(V1.0) 가져오기
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
                    <tr>
                      <th className="px-6 py-4">식별 코드 (Type)</th>
                      <th className="px-6 py-4">약관명</th>
                      <th className="px-6 py-4">버전</th>
                      <th className="px-6 py-4">동의 속성</th>
                      <th className="px-6 py-4">상태</th>
                      <th className="px-6 py-4 text-right">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {policies.map((p) => (
                      <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-gray-500 font-bold">{p.type}</td>
                        <td className="px-6 py-4 font-bold text-gray-900">{p.title}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-100 text-slate-800">
                            V {p.version.toFixed(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium">
                           {p.isRequired ? (
                             <span className="text-orange-600">필수</span>
                           ) : (
                             <span className="text-blue-600">선택</span>
                           )}
                        </td>
                        <td className="px-6 py-4">
                          {p.isActive ? (
                             <span className="inline-flex items-center text-green-600 font-bold text-xs">
                               <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" />
                               활성
                             </span>
                           ) : (
                             <span className="inline-flex items-center text-gray-400 font-bold text-xs">
                               <FileClock className="w-3.5 h-3.5 mr-1" />
                               보관됨
                             </span>
                           )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end items-center gap-2">
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className="font-bold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                              asChild
                            >
                              <Link href={`/admin/settings/policies/new?type=${p.type}&title=${encodeURIComponent(p.title)}`}>
                                새 버전 수정
                              </Link>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-500 hover:bg-red-50 hover:text-red-700"
                              onClick={() => handleDelete(p._id, p.title)}
                              title="삭제하기"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
