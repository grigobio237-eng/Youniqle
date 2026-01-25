'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import PavilionDetailPlanner from '@/components/admin/AIBuilder/PavilionDetailPlanner';
import { Badge } from '@/components/ui/badge';
import { Zap } from 'lucide-react';

export default function PavilionBuilderPage() {
    return (
        <AdminLayout>
            <div className="py-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 max-w-4xl mx-auto">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Zap className="w-5 h-5 text-purple-600" />
                            <h1 className="text-2xl font-black text-slate-800 tracking-tight">줄기세포 솔루션 전용 AI 빌더</h1>
                        </div>
                        <p className="text-sm text-slate-500 font-medium">파빌리온 5층 라운지 무형 상품(진단/솔루션) 전용 상세페이지 제작 환경입니다.</p>
                    </div>
                    <Badge className="w-fit bg-purple-50 text-purple-600 border-purple-100 font-bold px-3 py-1">
                        High-End Solution Mode
                    </Badge>
                </div>

                <PavilionDetailPlanner />
            </div>
        </AdminLayout>
    );
}
