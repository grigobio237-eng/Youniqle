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
    RefreshCw,
    Globe,
    Image as ImageIcon,
    Info,
    ExternalLink,
    Palette,
    LayoutDashboard,
    ArrowLeft,
    Check,
    Search,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

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
    productId?: string; // 참조용 상품 ID
}

interface FloorOwner {
    id: string;
    name: string;
    role: string;
    bio: string;
    image?: string;
    items: PavilionItem[];
}

interface Product {
    _id: string;
    name: string;
    price: number;
    summary: string;
    images: { url: string }[];
    category: string;
}

// --- ImageUploader Component ---
function ImageUploader({
    label,
    value,
    onChange,
    folder = 'pavilion/partner'
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

            const res = await fetch('/api/partner/pavilion/upload', {
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
                <div className="space-y-2">
                    <Input
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="이미지 URL"
                        className="text-xs h-8"
                    />
                    <Button
                        size="sm"
                        variant="outline"
                        className="w-full h-8 text-[10px] uppercase font-black"
                        onClick={(e) => { e.preventDefault(); fileInputRef.current?.click(); }}
                        disabled={uploading}
                    >
                        {uploading ? '업로드 중...' : '파일 선택'}
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

export default function PartnerPavilionPage() {
    const router = useRouter();
    const [owner, setOwner] = useState<FloorOwner | null>(null);
    const [floor, setFloor] = useState<number>(1);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Product Selection State
    const [showProductSelector, setShowProductSelector] = useState(false);
    const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
    const [fetchingProducts, setFetchingProducts] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/partner/pavilion');
            if (res.ok) {
                const data = await res.json();
                setOwner(data.owner);
                setFloor(data.floor);
            }
        } catch (error) {
            console.error('Failed to fetch exhibition data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            setFetchingProducts(true);
            const res = await fetch('/api/partner/products');
            if (res.ok) {
                const data = await res.json();
                setAvailableProducts(data.products || []);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setFetchingProducts(false);
        }
    };

    const handleSave = async () => {
        if (!owner) return;
        try {
            setSaving(true);
            const res = await fetch('/api/partner/pavilion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(owner)
            });
            if (res.ok) {
                alert('전시 정보가 성공적으로 저장되었습니다.');
            } else {
                const err = await res.json();
                alert('저장 실패: ' + err.error);
            }
        } catch (error) {
            alert('저장 중 오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    };

    const handleAddClick = () => {
        if (floor === 1) {
            addItem();
        } else {
            fetchProducts();
            setShowProductSelector(true);
        }
    };

    const addItem = (product?: Product) => {
        if (!owner) return;

        const newItem: PavilionItem = product ? {
            id: `item-${Date.now()}`,
            type: floor === 2 ? 'PRODUCT' : 'COACHING',
            title: product.name,
            description: product.summary,
            price: `₩${product.price.toLocaleString()}`,
            image: product.images[0]?.url || '',
            specs: { 'Category': product.category },
            productId: product._id
        } : {
            id: `item-${Date.now()}`,
            type: 'ARTWORK',
            title: '새로운 작품',
            description: '작품에 대한 설명을 입력하세요',
            price: '₩0',
            rental: '₩0',
            canvasSize: '0 x 0 cm',
            specs: { 'Origin': 'Korea' }
        };

        setOwner({
            ...owner,
            items: [...owner.items, newItem]
        });

        if (product) setShowProductSelector(false);
    };

    const updateItem = (index: number, updates: Partial<PavilionItem>) => {
        if (!owner) return;
        const newItems = [...owner.items];
        newItems[index] = { ...newItems[index], ...updates };
        setOwner({ ...owner, items: newItems });
    };

    const removeItem = (index: number) => {
        if (!owner || !confirm('이 항목을 삭제하시겠습니까?')) return;
        const newItems = [...owner.items];
        newItems.splice(index, 1);
        setOwner({ ...owner, items: newItems });
    };

    const pageTitle = floor === 1 ? 'EXHIBITION' : (floor === 2 ? 'SHOP' : 'COACHING');
    const pageSubTitle = floor === 1 ? '작가 전용 가상전시관 1층 관리 센터' : (floor === 2 ? '상점 전용 가상전시관 2층 관리 센터' : '코치 전용 가상전시관 3층 관리 센터');
    const profileTitle = floor === 1 ? '작가 프로필' : (floor === 2 ? '상점 프로필' : '코치 프로필');
    const itemSectionTitle = floor === 1 ? '전시 작품 관리' : (floor === 2 ? '진열 상품 관리' : '코칭 프로그램 관리');
    const addButtonText = floor === 1 ? '작품 추가' : (floor === 2 ? '상품 추가' : '프로그램 추가');

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">전시 데이터를 불러오는 중...</p>
            </div>
        );
    }

    if (!owner) return null;

    const filteredProducts = availableProducts.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-32 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push('/partner/dashboard')}
                        className="rounded-full hover:bg-slate-100 h-12 w-12"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-400" />
                    </Button>
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic flex items-center gap-3">
                            <Palette className="w-10 h-10 text-indigo-600" />
                            {pageTitle} <span className="text-indigo-600">MANAGEMENT</span>
                        </h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{pageSubTitle}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => router.push('/partner/dashboard')}
                        className="border-slate-200 text-slate-500 font-black text-[12px] uppercase h-12 px-6 rounded-xl hover:bg-slate-50"
                    >
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        대시보드
                    </Button>
                    <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 font-black text-[12px] uppercase px-8 h-12 rounded-xl">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        저장하기
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Section */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-none shadow-xl rounded-[32px] overflow-hidden sticky top-6">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                <User className="w-5 h-5 text-indigo-500" />
                                {profileTitle}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <ImageUploader
                                label="프로필 / 대표 이미지"
                                value={owner.image}
                                onChange={(url) => setOwner({ ...owner, image: url })}
                            />
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">이름 / 상호명</label>
                                <Input className="h-12 font-bold" value={owner.name} onChange={(e) => setOwner({ ...owner, name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">전문 분야 / 담당 역할</label>
                                <Input className="h-12 font-bold" value={owner.role} onChange={(e) => setOwner({ ...owner, role: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">소개 / 약력</label>
                                <Textarea className="min-h-[200px] font-medium leading-relaxed" value={owner.bio} onChange={(e) => setOwner({ ...owner, bio: e.target.value })} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Gallery Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-8 bg-indigo-400 rounded-full" />
                            <h3 className="text-xl font-black uppercase tracking-tight text-slate-800">{itemSectionTitle}</h3>
                            <Badge className="bg-indigo-50 text-indigo-600 border-none font-bold ml-2">
                                {owner.items.length} 항목
                            </Badge>
                        </div>
                        <Button onClick={handleAddClick} className="bg-indigo-600 hover:bg-indigo-700 font-black text-[12px] uppercase h-10 px-6 rounded-xl">
                            <Plus className="w-4 h-4 mr-2" /> {addButtonText}
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <AnimatePresence>
                            {owner.items.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Card className="p-6 bg-white border border-slate-100 shadow-sm rounded-[32px] relative group hover:shadow-md transition-all">
                                        <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-all">
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="h-8 w-8 rounded-full shadow-lg"
                                                onClick={() => removeItem(index)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                                            <div className="md:col-span-2 space-y-4">
                                                <ImageUploader
                                                    label="이미지"
                                                    value={item.image}
                                                    onChange={(url) => updateItem(index, { image: url })}
                                                />
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">제목</label>
                                                    <Input className="font-black italic" placeholder="Untitled" value={item.title} onChange={(e) => updateItem(index, { title: e.target.value })} />
                                                </div>
                                            </div>
                                            <div className="md:col-span-3 space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-indigo-600 ml-1">가격 / 가치</label>
                                                        <Input className="font-black text-indigo-600" value={item.price} onChange={(e) => updateItem(index, { price: e.target.value })} />
                                                    </div>
                                                    {floor === 1 && (
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 ml-1">월 렌탈료 (KRW)</label>
                                                            <Input className="font-black text-indigo-400" value={item.rental || ''} onChange={(e) => updateItem(index, { rental: e.target.value })} />
                                                        </div>
                                                    )}
                                                    {floor === 1 && (
                                                        <div className="col-span-2 space-y-1">
                                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">작품 크기 (예: 50x70cm)</label>
                                                            <Input className="font-bold" value={item.canvasSize || ''} onChange={(e) => updateItem(index, { canvasSize: e.target.value })} />
                                                        </div>
                                                    )}
                                                    {floor !== 1 && (
                                                        <div className="col-span-2 space-y-1">
                                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">참조 상품 ID</label>
                                                            <Input className="font-mono text-[10px] text-slate-400 bg-slate-50" readOnly value={item.productId || 'N/A'} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">상세 설명</label>
                                                    <Textarea className="min-h-[120px] text-sm" value={item.description} onChange={(e) => updateItem(index, { description: e.target.value })} />
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {owner.items.length === 0 && (
                            <div className="p-20 text-center border-4 border-dashed border-slate-100 rounded-[40px] bg-slate-50/30">
                                <ImageIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic">등록된 항목이 없습니다. 새로운 항목을 추가해보세요.</p>
                                <Button onClick={handleAddClick} variant="outline" className="mt-6 border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-black">
                                    <Plus className="w-4 h-4 mr-2" /> 첫 항목 등록하기
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Product Selector Modal */}
            <AnimatePresence>
                {showProductSelector && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => setShowProductSelector(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-4xl bg-white rounded-[40px] shadow-2xl flex flex-col overflow-hidden max-h-[80vh]"
                        >
                            <div className="p-8 border-b flex items-center justify-between bg-slate-50/50">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black tracking-tight text-slate-800 flex items-center gap-3">
                                        <Package className="w-7 h-7 text-indigo-500" />
                                        내 상품 {floor === 2 ? '진열하기' : '선택하기'}
                                    </h2>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">본인이 등록한 상품 중에서 파빌리온에 전시할 항목을 선택하세요.</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setShowProductSelector(false)} className="rounded-full">
                                    <X className="w-6 h-6 text-slate-400" />
                                </Button>
                            </div>

                            <div className="p-8 border-b">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <Input
                                        className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50 font-bold"
                                        placeholder="상품 이름 또는 카테고리로 검색..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/20">
                                {fetchingProducts ? (
                                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                                        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                                        <p className="text-[10px] font-black uppercase text-slate-400">상품 목록을 가져오는 중...</p>
                                    </div>
                                ) : filteredProducts.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {filteredProducts.map(product => (
                                            <div
                                                key={product._id}
                                                onClick={() => addItem(product)}
                                                className="group p-4 bg-white border border-slate-100 rounded-[24px] flex items-center gap-5 cursor-pointer hover:border-indigo-400 hover:shadow-lg transition-all"
                                            >
                                                <div className="w-20 h-20 bg-slate-50 rounded-[18px] overflow-hidden flex-shrink-0">
                                                    <img src={product.images[0]?.url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                </div>
                                                <div className="flex-1 min-w-0 pr-4">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge className="text-[8px] h-4 bg-slate-100 text-slate-500 border-none font-black">{product.category}</Badge>
                                                    </div>
                                                    <h4 className="text-sm font-black text-slate-800 truncate">{product.name}</h4>
                                                    <p className="text-[10px] font-bold text-indigo-600">₩{product.price.toLocaleString()}</p>
                                                </div>
                                                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                                                    <Plus className="w-5 h-5 text-slate-300 group-hover:text-white" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-20 border-4 border-dashed border-slate-100 rounded-[40px]">
                                        <Package className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">등록된 상품이 없거나 검색 결과가 없습니다.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
