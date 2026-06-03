'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building, 
  Key, 
  History, 
  Plus, 
  Trash2, 
  Search, 
  User, 
  Clock, 
  MapPin, 
  Phone,
  ShieldCheck,
  Activity
} from 'lucide-react';

interface Hospital {
  _id: string;
  name: string;
  code: string;
  description?: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

interface VisitLog {
  _id: string;
  hospitalId: {
    _id: string;
    name: string;
    code: string;
  };
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  accessType: 'pre-consultation' | 'post-care';
  timestamp: string;
}

export default function AdminHospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [logs, setLogs] = useState<VisitLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [newHospital, setNewHospital] = useState({
    name: '',
    code: '',
    description: '',
    address: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [hRes, lRes] = await Promise.all([
        fetch('/api/admin/hospitals'),
        fetch('/api/admin/hospitals/logs')
      ]);
      
      if (hRes.ok) {
        const hData = await hRes.json();
        setHospitals(hData.hospitals);
      }
      
      if (lRes.ok) {
        const lData = await lRes.json();
        setLogs(lData.logs);
      }
    } catch (error) {
      console.error('Data fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHospital.name || !newHospital.code) return;
    
    setIsSubmitting(true);
    try {
      const url = editingId ? `/api/admin/hospitals/${editingId}` : '/api/admin/hospitals';
      const method = editingId ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHospital)
      });
      
      if (res.ok) {
        setNewHospital({ name: '', code: '', description: '', address: '', phone: '' });
        setEditingId(null);
        fetchData();
        alert(editingId ? '병원 정보가 수정되었습니다.' : '새 병원이 등록되었습니다.');
      } else {
        const err = await res.json();
        alert(err.error || '작업에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to save hospital:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (hospital: Hospital) => {
    setNewHospital({
      name: hospital.name,
      code: hospital.code,
      description: hospital.description || '',
      address: hospital.address || '',
      phone: hospital.phone || ''
    });
    setEditingId(hospital._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setNewHospital({ name: '', code: '', description: '', address: '', phone: '' });
    setEditingId(null);
  };


  const handleDeleteHospital = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까? 관련 로그는 유지되지만 병원 정보는 사라집니다.')) return;
    
    try {
      const res = await fetch(`/api/admin/hospitals/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-obsidian tracking-tight">병원 및 QR 체크 관리</h1>
        <p className="text-slate font-medium">병원용 고유코드 발급 및 방문 모니터링을 관리합니다.</p>
      </div>

      <Tabs defaultValue="management" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-8">
          <TabsTrigger value="management" className="flex items-center gap-2 font-bold">
            <Building className="w-4 h-4" /> 병원 관리
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2 font-bold">
            <Activity className="w-4 h-4" /> 방문 모니터링
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Management */}
        <TabsContent value="management" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Add Form */}
            <Card className="lg:col-span-1 shadow-xl border-line">
              <CardHeader>
                <CardTitle className="font-black flex items-center gap-2 text-obsidian text-xl">
                  {editingId ? <History className="w-5 h-5 text-chapter-accent" /> : <Plus className="w-5 h-5 text-chapter-accent" />}
                  {editingId ? '병원 정보 수정' : '새 병원 등록'}
                </CardTitle>
                <CardDescription>
                  {editingId ? '선택한 병원의 정보를 업데이트합니다.' : '병원을 등록하고 고유코드를 생성합니다.'}
                </CardDescription>

              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddHospital} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate uppercase tracking-wider">병원명 (필수)</label>
                    <Input 
                      placeholder="예: 서울 유니클 성형외과"
                      value={newHospital.name}
                      onChange={e => setNewHospital({...newHospital, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate uppercase tracking-wider">고유코드 (필수)</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate/50" />
                      <Input 
                        placeholder="예: hospital001"
                        className="pl-10"
                        value={newHospital.code}
                        onChange={e => setNewHospital({...newHospital, code: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate uppercase tracking-wider">설명</label>
                    <Input 
                      placeholder="특이사항 및 담당자 정보"
                      value={newHospital.description}
                      onChange={e => setNewHospital({...newHospital, description: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate uppercase tracking-wider">주소</label>
                    <Input 
                      placeholder="주소를 입력하세요"
                      value={newHospital.address}
                      onChange={e => setNewHospital({...newHospital, address: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate uppercase tracking-wider">연락처</label>
                    <Input 
                      placeholder="전화번호"
                      value={newHospital.phone}
                      onChange={e => setNewHospital({...newHospital, phone: e.target.value})}
                    />
                  </div>
                   <div className="flex gap-2 mt-4">
                    {editingId && (
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={cancelEdit}
                        className="flex-1 font-bold h-12 rounded-xl"
                      >
                        취소
                      </Button>
                    )}
                    <Button 
                      type="submit" 
                      className={`flex-[2] bg-obsidian hover:bg-black text-white font-black h-12 rounded-xl ${editingId ? 'bg-chapter-accent text-obsidian' : ''}`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? '처리 중...' : editingId ? '수정 완료' : '병원 등록 완료'}
                    </Button>
                  </div>

                </form>
              </CardContent>
            </Card>

            {/* List */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-black text-obsidian flex items-center gap-2">
                <Building className="w-5 h-5" /> 등록된 병원 목록 ({hospitals.length})
              </h3>
              {hospitals.length === 0 ? (
                <Card className="p-12 text-center border-dashed border-2 border-line">
                  <p className="text-slate font-medium">등록된 병원이 없습니다.</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hospitals.map(hospital => (
                    <Card key={hospital._id} className="shadow-md hover:shadow-lg transition-shadow border-line">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-black text-lg text-obsidian">{hospital.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="bg-mist/50 text-chapter-accent border-chapter-accent/20 font-black">
                                <Key className="w-3 h-3 mr-1" /> {hospital.code}
                              </Badge>
                            </div>
                          </div>
                           <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-slate hover:text-chapter-accent hover:bg-mist/50"
                              onClick={() => {
                                const url = `${window.location.origin}/black-pass?hcode=${hospital.code}`;
                                navigator.clipboard.writeText(url);
                                alert('의료진 접속용 링크가 복사되었습니다.');
                              }}
                              title="접속 링크 복사"
                            >
                              <History className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-slate hover:text-chapter-accent hover:bg-mist/50"
                              onClick={() => handleEdit(hospital)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteHospital(hospital._id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                        </div>
                        <div className="space-y-2 text-sm text-slate font-medium">
                          {hospital.address && <div className="flex items-center gap-2"><MapPin className="w-3 h-3" /> {hospital.address}</div>}
                          {hospital.phone && <div className="flex items-center gap-2"><Phone className="w-3 h-3" /> {hospital.phone}</div>}
                          <div className="flex items-center gap-2 pt-2 border-t mt-2 text-[10px] opacity-50 uppercase font-black">
                            등록일: {new Date(hospital.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Monitoring */}
        <TabsContent value="monitoring" className="space-y-6">
          <Card className="shadow-xl border-line">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-black text-obsidian text-xl">실시간 방문 로그</CardTitle>
                <CardDescription>유저가 병원에 방문하여 QR 코드를 통해 정보를 열람한 기록입니다.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchData} className="font-bold">
                <Clock className="w-4 h-4 mr-2" /> 새로고침
              </Button>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto rounded-xl border border-line">
                <table className="w-full text-left">
                  <thead className="bg-mist text-slate uppercase text-xs font-black">
                    <tr>
                      <th className="px-6 py-4">방문 시간</th>
                      <th className="px-6 py-4">병원명 (코드)</th>
                      <th className="px-6 py-4">사용 유저</th>
                      <th className="px-6 py-4">열람 구분</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate font-medium">
                          방문 기록이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      logs.map(log => (
                        <tr key={log._id} className="hover:bg-mist/30 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-slate">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-black text-obsidian">{log.hospitalId?.name || 'Unknown'}</div>
                            <div className="text-[10px] text-slate font-bold uppercase tracking-widest">{log.hospitalId?.code || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-chapter-accent/10 flex items-center justify-center">
                                <User className="w-4 h-4 text-chapter-accent" />
                              </div>
                              <div>
                                <div className="font-black text-obsidian">{log.userId?.name || 'Anonymous'}</div>
                                <div className="text-xs text-slate">{log.userId?.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={`font-black ${
                              log.accessType === 'pre-consultation' 
                                ? 'bg-blue-50 text-primary border-primary/30' 
                                : log.accessType === 'patient-detail'
                                ? 'bg-amber-50 text-primary border-primary/30'
                                : 'bg-green-50 text-green-600 border-green-200'
                            }`}>
                              {log.accessType === 'pre-consultation' ? (
                                <><ShieldCheck className="w-3 h-3 mr-1" /> 시술 전 문진</>
                              ) : log.accessType === 'patient-detail' ? (
                                <><Search className="w-3 h-3 mr-1" /> 환자 상세 열람</>
                              ) : (
                                <><Activity className="w-3 h-3 mr-1" /> 사후 관리</>
                              )}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
