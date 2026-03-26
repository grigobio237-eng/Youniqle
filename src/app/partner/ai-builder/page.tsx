'use client';

import PartnerLayout from '@/components/partner/PartnerLayout';
import DetailPlanner from '@/components/admin/AIBuilder/DetailPlanner';
import ThumbnailGenerator from '@/components/admin/AIBuilder/ThumbnailGenerator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function PartnerAIBuilderPage() {
    const [partnerType, setPartnerType] = useState<string>('commerce');

    useEffect(() => {
        const checkPartner = async () => {
            try {
                const response = await fetch('/api/partner/auth/verify');
                if (response.ok) {
                    const data = await response.json();
                    setPartnerType(data.partner?.partnerType || 'commerce');
                }
            } catch (error) {
                console.error('Partner check failed:', error);
            }
        };
        checkPartner();
    }, []);

    return (
        <PartnerLayout>
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
                        <DetailPlanner mode="partner" partnerType={partnerType} />
                    </TabsContent>

                    <TabsContent value="thumbnail" className="mt-0 focus-visible:outline-none">
                        <ThumbnailGenerator partnerType={partnerType} />
                    </TabsContent>
                </Tabs>
            </div>
        </PartnerLayout>
    );
}
