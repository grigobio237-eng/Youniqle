'use client';

import { useState, useEffect, useRef } from 'react';
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
    User,
    Package,
    Loader2,
    ChevronRight,
    ChevronDown,
    RefreshCw,
    LayoutDashboard,
    Upload,
    Globe,
    Image as ImageIcon,
    Info,
    CheckCircle2,
    Search,
    ArrowRight,
    ExternalLink
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { motion, AnimatePresence } from 'framer-motion';
import LoungeControlCenter from '@/components/admin/pavilion/LoungeControlCenter';
import InquiryList from '@/components/admin/InquiryList';

// --- Types ---
interface PavilionItem {
    id: string;
    type: string;
    title: string;
    description: string;
    price: string;
    rental?: string;
    image?: string;
    canvasSize?: string;
    specs: Record<string, string>;
}

interface FloorOwner {
    id: string;
    name: string;
    role: string;
    bio: string;
    image?: string;
    items: PavilionItem[];
}

interface PavilionFloor {
    floor: number;
    owners: FloorOwner[];
}

// --- Local Components ---

function ImageUploader({
    label,
    value,
    onChange,
    folder = 'pavilion'
}: {
    label: string,
    value?: string,
    onChange: (url: string) => void,
    folder?: string
}) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', folder);

            const res = await fetch('/api/admin/pavilion/upload', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();
            onChange(data.url);
        } catch (error) {
            console.error('Upload Error:', error);
            alert('이미지 업로드에 실패했습니다.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
            <div className="space-y-3">
                {/* 큰 미리보기 영역 */}
                <div
                    className="w-full aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center overflow-hidden cursor-pointer group hover:border-indigo-400 transition-all relative"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {value ? (
                        <>
                            <img src={value} alt="Preview" className="w-full h-full object-contain" />
                            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-[10px] font-black uppercase">
                                Uploaded
                            </div>
                        </>
                    ) : (
                        <div className="text-center">
                            <ImageIcon className="w-12 h-12 text-slate-300 group-hover:text-indigo-400 mx-auto mb-2" />
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Click to upload</p>
                        </div>
                    )}
                    {uploading && (
                        <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
                            <p className="text-[10px] font-black uppercase text-indigo-600">Uploading...</p>
                        </div>
                    )}
                </div>

                {/* URL 입력 및 버튼 */}
                <div className="space-y-2">
                    <Input
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="이미지 URL (직접 입력하거나 업로드)"
                        className="text-xs h-8"
                    />
                    <Button
                        size="sm"
                        variant="outline"
                        className="w-full h-8 text-[10px] uppercase font-black"
                        onClick={(e) => { e.preventDefault(); fileInputRef.current?.click(); }}
                        disabled={uploading}
                    >
                        {uploading ? '업로드 중...' : value ? '이미지 교체' : '파일 선택 (WebP 자동 변환)'}
                    </Button>
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleUpload}
                />
            </div>
        </div>
    );
}

export default function PavilionAdminPage() {
    const [data, setData] = useState<PavilionFloor[]>([]);
    const [activeFloor, setActiveFloor] = useState<number>(1);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [stats, setStats] = useState<{ floorCounts: Record<string, number>, artistCounts: Record<string, number> }>({ floorCounts: {}, artistCounts: {} });

    useEffect(() => {
        fetchPavilionData();
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/pavilion/stats');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    // 층이 바뀌면 선택된 작가 초기화 및 검색어 초기화
    useEffect(() => {
        setSelectedOwnerId(null);
        setSearchTerm('');
    }, [activeFloor]);

    const fetchPavilionData = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/pavilion');
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

    const handleSaveFloor = async (floorNum: number) => {
        const floorData = data.find(f => f.floor === floorNum);
        if (!floorData) return;

        // 디버깅: 전송하는 데이터 확인
        console.log('[Frontend] Saving Floor Data:', floorNum);
        floorData.owners.forEach(owner => {
            console.log(`  - ${owner.name}: image = ${owner.image || 'EMPTY'}`);
        });

        try {
            setSaving(true);
            const res = await fetch('/api/admin/pavilion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(floorData)
            });
            if (res.ok) alert(`${floorNum}층 데이터 저장 완료`);
        } catch (error) {
            alert('저장 실패');
        } finally {
            setSaving(false);
        }
    };

    const handleInitData = async () => {
        if (!confirm('현재 모든 파빌리온 데이터가 초기화되고 기본 데이터로 재설정됩니다. 계속하시겠습니까?')) return;
        try {
            setLoading(true);
            const res = await fetch('/api/admin/pavilion/init', { method: 'POST' });
            if (res.ok) {
                alert('데이터 초기화 완료');
                fetchPavilionData();
            }
        } catch (error) { alert('초기화 실패'); } finally { setLoading(false); }
    };

    // --- Data Update Handlers ---
    const updateOwner = (fIdx: number, oIdx: number, updates: Partial<FloorOwner>) => {
        const newData = [...data];
        newData[fIdx].owners[oIdx] = { ...newData[fIdx].owners[oIdx], ...updates };
        setData(newData);
    };

    const updateItem = (fIdx: number, oIdx: number, iIdx: number, updates: Partial<PavilionItem>) => {
        const newData = [...data];
        newData[fIdx].owners[oIdx].items[iIdx] = { ...newData[fIdx].owners[oIdx].items[iIdx], ...updates };
        setData(newData);
    };

    const addOwner = (fIdx: number) => {
        const newData = [...data];
        const newOwnerId = `owner-${Date.now()}`;
        newData[fIdx].owners.push({
            id: newOwnerId,
            name: '새로운 전문가',
            role: activeFloor === 1 ? '아티스트' : '마스터',
            bio: '소개를 입력하세요',
            items: []
        });
        setData(newData);
        // 추가 후 즉시 상세 페이지로 이동
        setSelectedOwnerId(newOwnerId);
    };

    const addItem = (fIdx: number, oIdx: number) => {
        const newData = [...data];
        newData[fIdx].owners[oIdx].items.push({
            id: `item-${Date.now()}`,
            type: activeFloor === 1 ? 'ARTWORK' : 'PRODUCT',
            title: '새로운 항목',
            description: '항목에 대한 설명을 입력하세요',
            price: '₩0',
            rental: activeFloor === 1 ? '₩0' : undefined,
            canvasSize: '0 x 0 cm',
            specs: { 'Origin': 'Korea' }
        });
        setData(newData);
    };

    const currentFloorIdx = data.findIndex(f => f.floor === activeFloor);
    const currentFloor = data[currentFloorIdx];
    const selectedOwner = currentFloor?.owners.find(o => o.id === selectedOwnerId);
    const selectedOwnerIdx = currentFloor?.owners.findIndex(o => o.id === selectedOwnerId);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Synchronizing Pavilion Core...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-32 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic flex items-center gap-3">
                        <Globe className="w-10 h-10 text-indigo-600" />
                        RECOVERY <span className="text-indigo-600">PAVILION</span>
                    </h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Digital Twin Space Control Center</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleInitData} className="border-slate-200 text-slate-400 hover:text-rose-500 font-black text-[10px] uppercase">
                        <RefreshCw className="w-3 h-3 mr-2" /> Reset All
                    </Button>
                    <Button onClick={() => handleSaveFloor(activeFloor)} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 font-black text-[10px] uppercase px-8">
                        {saving ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Save className="w-3 h-3 mr-2" />}
                        Save {activeFloor}F Changes
                    </Button>
                </div>
            </header>

            {/* Floor Navigation */}
            <nav className="flex gap-2 p-2 bg-slate-100 rounded-3xl w-fit">
                {[1, 2, 3, 4, 5].map((f) => (
                    <button
                        key={f}
                        onClick={() => setActiveFloor(f)}
                        className={`relative px-10 py-4 rounded-2xl font-black text-xs transition-all uppercase tracking-tighter ${activeFloor === f ? 'bg-white text-indigo-600 shadow-md scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        {f}F {f === 1 ? '아트 갤러리' : f === 2 ? '체험 샵' : f === 3 ? '라이프 코칭' : f === 4 ? '메디컬 체크' : '김미정원장 전용라운지'}
                        {stats.floorCounts[f] > 0 && (
                            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white border-white border-2">
                                {stats.floorCounts[f]}
                            </Badge>
                        )}
                    </button>
                ))}
            </nav>

            {!currentFloor ? (
                <Card className="p-20 text-center border-4 border-dashed border-slate-100 rounded-[40px]">
                    <Info className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold italic tracking-tight">No synchronized data for this floor. Initialize the system to start.</p>
                </Card>
            ) : (
                <div className="space-y-6">
                    {/* List/Detail Layout */}
                    {activeFloor === 5 ? (
                        <LoungeControlCenter
                            floorData={currentFloor}
                            onSave={() => handleSaveFloor(5)}
                        />
                    ) : !selectedOwner ? (
                        /* --- TABLE VIEW (Excel Style) --- */
                        <div className="space-y-6 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                                        <Layers className="w-5 h-5 text-indigo-500" />
                                        Specialist Directory
                                        <Badge variant="secondary" className="ml-2 bg-slate-100 text-slate-500 font-bold px-2 py-0 h-5 text-[10px]">{currentFloor.owners.length}</Badge>
                                    </h3>
                                    <p className="text-[11px] text-slate-400 font-medium">Manage and monitor floor specialists in a data-centric view.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Find by name or role..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[12px] font-bold focus:ring-2 focus:ring-indigo-500 transition-all w-64 outline-none"
                                        />
                                    </div>
                                    <Button onClick={() => addOwner(currentFloorIdx)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[11px] uppercase tracking-widest px-6 rounded-lg h-10">
                                        <Plus className="w-4 h-4 mr-2" /> Add New
                                    </Button>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-slate-100">
                                <Table>
                                    <TableHeader className="bg-slate-50/50">
                                        <TableRow className="hover:bg-transparent border-slate-100">
                                            <TableHead className="w-[80px] text-[11px] font-black uppercase text-slate-400 py-4">Profile</TableHead>
                                            <TableHead className="text-[11px] font-black uppercase text-slate-400 py-4">Full Name</TableHead>
                                            <TableHead className="text-[11px] font-black uppercase text-slate-400 py-4">Designated Role</TableHead>
                                            <TableHead className="text-[11px] font-black uppercase text-slate-400 py-4 text-center">Asset Count</TableHead>
                                            <TableHead className="text-right text-[11px] font-black uppercase text-slate-400 py-4">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {currentFloor.owners
                                            .filter(owner =>
                                                owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                owner.role.toLowerCase().includes(searchTerm.toLowerCase())
                                            )
                                            .map((owner) => (
                                                <TableRow
                                                    key={owner.id}
                                                    className="group cursor-pointer hover:bg-slate-50/80 transition-colors border-slate-50"
                                                    onClick={() => setSelectedOwnerId(owner.id)}
                                                >
                                                    <TableCell className="py-3">
                                                        <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
                                                            {owner.image ? (
                                                                <img src={owner.image} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <User className="w-4 h-4 text-slate-300" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-black text-slate-700 group-hover:text-indigo-600 transition-colors">{owner.name || 'Anonymous'}</span>
                                                            {stats.artistCounts[owner.id] > 0 && (
                                                                <Badge className="bg-red-500 text-white text-[10px] px-1.5 h-5">
                                                                    {stats.artistCounts[owner.id]}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-3">
                                                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest border-slate-200 text-slate-500 group-hover:border-indigo-200 group-hover:text-indigo-500 transition-all">
                                                            {owner.role}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="py-3 text-center">
                                                        <span className="text-xs font-bold text-slate-500">{owner.items.length} Assets</span>
                                                    </TableCell>
                                                    <TableCell className="py-3 text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}

                                        {currentFloor.owners.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="py-20 text-center">
                                                    <User className="w-10 h-10 text-slate-100 mx-auto mb-4" />
                                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Floor registry is empty</p>
                                                </TableCell>
                                            </TableRow>
                                        )}

                                        {currentFloor.owners.length > 0 && currentFloor.owners.filter(owner =>
                                            owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            owner.role.toLowerCase().includes(searchTerm.toLowerCase())
                                        ).length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="py-12 text-center">
                                                        <Search className="w-8 h-8 text-slate-100 mx-auto mb-3" />
                                                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest italic">No matches found for "{searchTerm}"</p>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    ) : (
                        /* --- DETAIL VIEW --- */
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between border-b-4 border-slate-50 pb-6">
                                <Button
                                    variant="ghost"
                                    onClick={() => setSelectedOwnerId(null)}
                                    className="text-slate-400 hover:text-slate-900 font-black text-[11px] uppercase p-0 h-auto"
                                >
                                    <Loader2 className="w-4 h-4 mr-2 rotate-90" />
                                    Back to Specialist List
                                </Button>
                                <div className="flex items-center gap-4">
                                    <Badge className="bg-indigo-50 text-indigo-600 border-none font-black px-4 py-1">
                                        Editing: {selectedOwner.name}
                                    </Badge>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-rose-500 hover:bg-rose-50 font-black text-[10px] uppercase"
                                        onClick={() => {
                                            if (confirm('Delete specialist and all data?')) {
                                                const newData = [...data];
                                                newData[currentFloorIdx].owners.splice(selectedOwnerIdx!, 1);
                                                setData(newData);
                                                setSelectedOwnerId(null);
                                            }
                                        }}
                                    >
                                        <Trash2 className="w-3 h-3 mr-2" /> Delete Specialist
                                    </Button>
                                </div>
                            </div>

                            <Card className="border-none shadow-2xl shadow-indigo-100/50 rounded-[40px] overflow-hidden">
                                <div className="p-10 space-y-12">
                                    {/* Profile Edit Section */}
                                    <section className="space-y-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-8 bg-indigo-600 rounded-full" />
                                            <h5 className="text-sm font-black uppercase tracking-widest text-slate-800">Master Identity</h5>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                            <div className="lg:col-span-1">
                                                <ImageUploader
                                                    label="Profile / Bio Image"
                                                    folder={`pavilion/floor${activeFloor}/owners`}
                                                    value={selectedOwner.image}
                                                    onChange={(url) => updateOwner(currentFloorIdx, selectedOwnerIdx!, { image: url })}
                                                />
                                            </div>
                                            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                                                    <Input className="h-12 font-bold" value={selectedOwner.name} onChange={(e) => updateOwner(currentFloorIdx, selectedOwnerIdx!, { name: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Designated Role</label>
                                                    <Input className="h-12 font-bold" value={selectedOwner.role} onChange={(e) => updateOwner(currentFloorIdx, selectedOwnerIdx!, { role: e.target.value })} />
                                                </div>
                                                <div className="md:col-span-2 space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Curriculum Vitae / Narrative Bio</label>
                                                    <Textarea className="min-h-[150px] font-medium leading-relaxed" value={selectedOwner.bio} onChange={(e) => updateOwner(currentFloorIdx, selectedOwnerIdx!, { bio: e.target.value })} />
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Items / Gallery Management */}
                                    <section className="space-y-8 border-t-4 border-slate-50 pt-12">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-8 bg-indigo-400 rounded-full" />
                                                <h5 className="text-sm font-black uppercase tracking-widest text-slate-800">{activeFloor === 1 ? 'Curated Masterpieces' : 'Assigned Product Assets'}</h5>
                                            </div>
                                            <Button onClick={() => addItem(currentFloorIdx, selectedOwnerIdx!)} variant="outline" size="sm" className="font-black text-[10px] uppercase border-2 h-10 px-6 hover:bg-slate-50 rounded-xl">
                                                <Plus className="w-3 h-3 mr-2" /> Add New Asset
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                            {selectedOwner.items.map((item, iIdx) => (
                                                <Card key={item.id} className="p-6 bg-slate-50/50 border-none rounded-[32px] relative group transition-all hover:bg-slate-100/50 ring-1 ring-slate-100">
                                                    {/* 우측 상단 액션 버튼들 */}
                                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    setSaving(true);
                                                                    const floorData = data.find(f => f.floor === activeFloor);
                                                                    if (!floorData) return;

                                                                    const res = await fetch('/api/admin/pavilion', {
                                                                        method: 'POST',
                                                                        headers: { 'Content-Type': 'application/json' },
                                                                        body: JSON.stringify(floorData)
                                                                    });

                                                                    if (res.ok) {
                                                                        alert('작품 정보가 저장되었습니다!');
                                                                    }
                                                                } catch (error) {
                                                                    alert('저장 실패');
                                                                } finally {
                                                                    setSaving(false);
                                                                }
                                                            }}
                                                            className="p-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-full shadow-lg transition-all"
                                                            title="Save this asset"
                                                        >
                                                            <Save className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm('Delete this asset?')) {
                                                                    const newData = [...data];
                                                                    newData[currentFloorIdx].owners[selectedOwnerIdx!].items.splice(iIdx, 1);
                                                                    setData(newData);
                                                                }
                                                            }}
                                                            className="p-2 bg-white text-slate-300 hover:text-rose-500 rounded-full shadow-lg transition-all"
                                                            title="Delete this asset"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                                                        <div className="md:col-span-2 space-y-4">
                                                            <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                                                <ImageUploader
                                                                    label="Asset Visual"
                                                                    folder={`pavilion/floor${activeFloor}/items`}
                                                                    value={item.image}
                                                                    onChange={(url) => updateItem(currentFloorIdx, selectedOwnerIdx!, iIdx, { image: url })}
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Asset Title</label>
                                                                <Input className="font-black italic bg-white" placeholder="작품명을 입력하세요" value={item.title} onChange={(e) => updateItem(currentFloorIdx, selectedOwnerIdx!, iIdx, { title: e.target.value })} />
                                                            </div>
                                                        </div>
                                                        <div className="md:col-span-3 space-y-4">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-1 text-indigo-600">
                                                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Sale Value (KRW)</label>
                                                                    <Input className="font-black bg-white/50 border-indigo-100" placeholder="₩0" value={item.price} onChange={(e) => updateItem(currentFloorIdx, selectedOwnerIdx!, iIdx, { price: e.target.value })} />
                                                                </div>
                                                                <div className="space-y-1 text-indigo-400">
                                                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Monthly Rental (KRW)</label>
                                                                    <Input className="font-black bg-white/50 border-indigo-50" placeholder="₩0" value={item.rental || ''} onChange={(e) => updateItem(currentFloorIdx, selectedOwnerIdx!, iIdx, { rental: e.target.value })} />
                                                                </div>
                                                                <div className="col-span-2 space-y-1">
                                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Canvas Size (캔버스 크기)</label>
                                                                    <Input className="font-bold bg-white" placeholder="예: 50.0 x 60.0 cm (15호)" value={item.canvasSize || ''} onChange={(e) => updateItem(currentFloorIdx, selectedOwnerIdx!, iIdx, { canvasSize: e.target.value })} />
                                                                </div>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Curated Description</label>
                                                                <Textarea className="min-h-[100px] text-xs font-medium bg-white" placeholder="작품의 의도와 상세 정보를 입력하세요" value={item.description} onChange={(e) => updateItem(currentFloorIdx, selectedOwnerIdx!, iIdx, { description: e.target.value })} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                            {selectedOwner.items.length === 0 && (
                                                <div className="xl:col-span-2 p-12 text-center border-2 border-dashed border-slate-100 rounded-[32px]">
                                                    <Package className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No assets added yet</p>
                                                </div>
                                            )}
                                        </div>
                                    </section>

                                    {/* Inquiry Management Section */}
                                    <section className="space-y-8 border-t-4 border-slate-50 pt-12">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-2 h-8 bg-rose-500 rounded-full" />
                                            <h5 className="text-sm font-black uppercase tracking-widest text-slate-800">
                                                Inquiry Management
                                                {stats.artistCounts[selectedOwner.id] > 0 && (
                                                    <Badge className="ml-3 bg-rose-500 hover:bg-rose-600 text-white border-none">
                                                        {stats.artistCounts[selectedOwner.id]} New Pending
                                                    </Badge>
                                                )}
                                            </h5>
                                        </div>

                                        <div className="bg-slate-50/50 rounded-[32px] overflow-hidden border border-slate-100 p-6">
                                            <InquiryList
                                                artistId={selectedOwner.id}
                                                floor={activeFloor}
                                                title={`Inquiries for ${selectedOwner.name}`}
                                                description="Manage inquiries specifically related to this partner/artist."
                                            />
                                        </div>
                                    </section>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
