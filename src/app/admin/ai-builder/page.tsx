'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import DetailPlanner from '@/components/admin/AIBuilder/DetailPlanner';
import ThumbnailGenerator from '@/components/admin/AIBuilder/ThumbnailGenerator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Image as ImageIcon } from 'lucide-react';

export default function AdminAIBuilderPage() {
    return (
        <AdminLayout>
            <div className="py-6">
                <Tabs defaultValue="detail" className="w-full">
                    <div className="flex justify-center mb-8">
                        <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-100 p-1">
                            <TabsTrigger value="detail" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
                                상세페이지 빌더
                            </TabsTrigger>
                            <TabsTrigger value="thumbnail" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <ImageIcon className="h-4 w-4 mr-2 text-indigo-500" />
                                썸네일 생성기
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="detail" className="mt-0 focus-visible:outline-none">
                        <DetailPlanner />
                    </TabsContent>

                    <TabsContent value="thumbnail" className="mt-0 focus-visible:outline-none">
                        <ThumbnailGenerator />
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
