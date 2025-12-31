'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    Trash2,
    Save,
    Layers,
    Info,
    User,
    Package,
    CheckCircle2,
    Loader2,
    ChevronRight,
    ChevronDown,
    RefreshCw,
    LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PavilionItem {
    id: string;
    type: string;
    title: string;
    description: string;
    price: string;
    specs: Record<string, string>;
    image?: string;
}

interface FloorOwner {
    id: string;
    name: string;
    role: string;
    bio: string;
    items: PavilionItem[];
}

interface PavilionFloor {
    floor: number;
    owners: FloorOwner[];
}

export default function PavilionAdminPage() {
    const [data, setData] = useState<PavilionFloor[]>([]);
    const [activeFloor, setActiveFloor] = useState<number>(1);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [expandedOwner, setExpandedOwner] = useState<string | null>(null);

    useEffect(() => {
        fetchPavilionData();
    }, []);

    const fetchPavilionData = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/pavilion', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            if (res.ok) {
                const floors = await res.json();
                setData(floors);
            }
        } catch (error) {
            console.error('Failed to fetch pavilion data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInitData = async () => {
        if (!confirm('현재 모든 파빌리온 데이터가 초기화되고 기본 데이터로 재설정됩니다. 계속하시겠습니까?')) return;

        try {
            setLoading(true);
            const res = await fetch('/api/admin/pavilion/init', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            if (res.ok) {
                alert('데이터 초기화 완료');
                fetchPavilionData();
            }
        } catch (error) {
            alert('초기화 실패');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveFloor = async (floorNum: number) => {
        const floorData = data.find(f => f.floor === floorNum);
        if (!floorData) return;

        try {
            setSaving(true);
            const res = await fetch('/api/admin/pavilion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify(floorData)
            });
            if (res.ok) {
                alert(`${floorNum}층 데이터 저장 완료`);
            }
        } catch (error) {
            alert('저장 실패');
        } finally {
            setSaving(false);
        }
    };

    // --- Edit Handlers ---

    const updateOwnerField = (floorIdx: number, ownerIdx: number, field: keyof FloorOwner, value: string) => {
        const newData = [...data];
        newData[floorIdx].owners[ownerIdx][field] = value as any;
        setData(newData);
    };

    const updateItemField = (floorIdx: number, ownerIdx: number, itemIdx: number, field: keyof PavilionItem, value: string) => {
        const newData = [...data];
        newData[floorIdx].owners[ownerIdx].items[itemIdx][field] = value as any;
        setData(newData);
    };

    const addItem = (floorIdx: number, ownerIdx: number) => {
        const newData = [...data];
        const newItem: PavilionItem = {
            id: `item-${Date.now()}`,
            type: 'PRODUCT',
            title: '새로운 상품',
            description: '설명을 입력하세요',
            price: '₩0',
            specs: { 'Origin': 'Unknown' }
        };
        newData[floorIdx].owners[ownerIdx].items.push(newItem);
        setData(newData);
    };

    const removeItem = (floorIdx: number, ownerIdx: number, itemIdx: number) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        const newData = [...data];
        newData[floorIdx].owners[ownerIdx].items.splice(itemIdx, 1);
        setData(newData);
    };

    const addOwner = (floorIdx: number) => {
        const newData = [...data];
        const newOwner: FloorOwner = {
            id: `owner-${Date.now()}`,
            name: '새로운 전문가',
            role: '역할 입력',
            bio: '소개를 입력하세요',
            items: []
        };
        newData[floorIdx].owners.push(newOwner);
        setData(newData);
    };

    const removeOwner = (floorIdx: number, ownerIdx: number) => {
        if (!confirm('소유자와 포함된 모든 아이템이 삭제됩니다. 계속하시겠습니까?')) return;
        const newData = [...data];
        newData[floorIdx].owners.splice(ownerIdx, 1);
        setData(newData);
    };

    const currentFloorIdx = data.findIndex(f => f.floor === activeFloor);
    const currentFloor = data[currentFloorIdx];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
                <p className="text-slate-500 font-medium">파빌리온 데이터를 불러오고 있습니다...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <LayoutDashboard className="w-8 h-8 text-indigo-500" />
                        비밀 가상공간(Pavilion) 관리
                    </h1>
                    <p className="text-slate-500 mt-1">1층부터 5층까지의 가상 공간 콘텐츠를 실시간으로 제어합니다.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleInitData} className="border-slate-200 text-slate-500 hover:text-rose-500">
                        <RefreshCw className="w-4 h-4 mr-2" /> 초기화
                    </Button>
                    <Button onClick={() => handleSaveFloor(activeFloor)} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        현재 층 정보 저장
                    </Button>
                </div>
            </div>

            {/* Floor Selector */}
            <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
                {[1, 2, 3, 4, 5].map((f) => (
                    <button
                        key={f}
                        onClick={() => setActiveFloor(f)}
                        className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeFloor === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        {f}F {f === 1 ? 'Gallery' : f === 2 ? 'Shop' : f === 3 ? 'Coaching' : f === 4 ? 'Medical' : 'Omakase'}
                    </button>
                ))}
            </div>

            {!currentFloor ? (
                <Card className="p-12 text-center border-dashed">
                    <p className="text-slate-400 italic">현재 층에 대한 데이터가 없습니다. 초기화를 진행해주세요.</p>
                </Card>
            ) : (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <Layers className="w-5 h-5 text-indigo-400" />
                            전문가 영역 현황 <Badge variant="secondary" className="ml-2">{currentFloor.owners.length}</Badge>
                        </h3>
                        <Button onClick={() => addOwner(currentFloorIdx)} size="sm" variant="ghost" className="text-indigo-600 hover:bg-indigo-50 font-bold">
                            <Plus className="w-4 h-4 mr-1" /> 전문가 추가
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {currentFloor.owners.map((owner, oIdx) => (
                            <Card key={owner.id} className="overflow-hidden border-none shadow-sm ring-1 ring-slate-200">
                                <div
                                    className={`p-6 flex items-center justify-between cursor-pointer transition-colors ${expandedOwner === owner.id ? 'bg-indigo-50/30' : 'hover:bg-slate-50/50'}`}
                                    onClick={() => setExpandedOwner(expandedOwner === owner.id ? null : owner.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-500">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">{owner.name || '이름 없음'}</h4>
                                            <p className="text-xs text-slate-500">{owner.role || '역할 미정'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-200">
                                            Items: {owner.items.length}
                                        </Badge>
                                        {expandedOwner === owner.id ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {expandedOwner === owner.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-slate-100"
                                        >
                                            <div className="p-8 space-y-8 bg-white">
                                                {/* Owner Info Edit */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Name</label>
                                                        <Input value={owner.name} onChange={(e) => updateOwnerField(currentFloorIdx, oIdx, 'name', e.target.value)} placeholder="전문가 이름" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Role</label>
                                                        <Input value={owner.role} onChange={(e) => updateOwnerField(currentFloorIdx, oIdx, 'role', e.target.value)} placeholder="직함 / 역할" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Action</label>
                                                        <Button variant="destructive" className="w-full" onClick={() => removeOwner(currentFloorIdx, oIdx)}>
                                                            <Trash2 className="w-4 h-4 mr-2" /> 전문가 권한 삭제
                                                        </Button>
                                                    </div>
                                                    <div className="md:col-span-3 space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Bio</label>
                                                        <Textarea value={owner.bio} onChange={(e) => updateOwnerField(currentFloorIdx, oIdx, 'bio', e.target.value)} placeholder="전문가 소개글" className="min-h-[100px]" />
                                                    </div>
                                                </div>

                                                {/* Items Manager */}
                                                <div className="space-y-4 pt-6 border-t border-slate-50">
                                                    <div className="flex items-center justify-between">
                                                        <h5 className="text-sm font-black text-slate-700 flex items-center gap-2">
                                                            <Package className="w-4 h-4 text-slate-400" /> 관리 아이템 리스트
                                                        </h5>
                                                        <Button onClick={() => addItem(currentFloorIdx, oIdx)} size="sm" variant="outline" className="h-8 border-indigo-100 text-indigo-500 hover:bg-indigo-50">
                                                            <Plus className="w-3 h-3 mr-1" /> 아이템 추가
                                                        </Button>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {owner.items.map((item, iIdx) => (
                                                            <Card key={item.id} className="p-6 bg-slate-50/50 border-none ring-1 ring-slate-100 relative group">
                                                                <button
                                                                    onClick={() => removeItem(currentFloorIdx, oIdx, iIdx)}
                                                                    className="absolute top-2 right-2 p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>

                                                                <div className="space-y-4">
                                                                    <div className="flex gap-4">
                                                                        <div className="w-16 h-16 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-300 text-xs">
                                                                            IMG
                                                                        </div>
                                                                        <div className="flex-1 space-y-3">
                                                                            <Input
                                                                                value={item.title}
                                                                                onChange={(e) => updateItemField(currentFloorIdx, oIdx, iIdx, 'title', e.target.value)}
                                                                                placeholder="아이템 명칭"
                                                                                className="font-bold h-8 text-sm"
                                                                            />
                                                                            <div className="flex gap-2">
                                                                                <Badge className="h-5 text-[9px] uppercase">{item.type}</Badge>
                                                                                <Input
                                                                                    value={item.price}
                                                                                    onChange={(e) => updateItemField(currentFloorIdx, oIdx, iIdx, 'price', e.target.value)}
                                                                                    placeholder="가격 (예: ₩10,000)"
                                                                                    className="h-6 text-[10px] tabular-nums"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <Textarea
                                                                        value={item.description}
                                                                        onChange={(e) => updateItemField(currentFloorIdx, oIdx, iIdx, 'description', e.target.value)}
                                                                        placeholder="상세 설명"
                                                                        className="text-xs min-h-[60px] bg-white"
                                                                    />
                                                                </div>
                                                            </Card>
                                                        ))}
                                                        {owner.items.length === 0 && (
                                                            <div className="col-span-2 p-12 text-center bg-slate-50/30 border-2 border-dashed border-slate-100 rounded-3xl">
                                                                <p className="text-slate-400 text-xs font-medium">등록된 아이템이 없습니다. 새로운 가치를 추가해보세요.</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
