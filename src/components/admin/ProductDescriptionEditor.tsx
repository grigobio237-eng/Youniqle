import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Code, Eye, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductDescriptionEditorProps {
    value: string;
    onChange: (value: string) => void;
    isHtml: boolean;
    onIsHtmlChange: (isHtml: boolean) => void;
    className?: string;
}

export default function ProductDescriptionEditor({
    value,
    onChange,
    isHtml,
    onIsHtmlChange,
    className
}: ProductDescriptionEditorProps) {
    const [activeTab, setActiveTab] = useState<string>('edit');

    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">상품 상세 설명</Label>
                <div className="flex items-center space-x-2">
                    <Switch
                        id="html-mode"
                        checked={isHtml}
                        onCheckedChange={(checked) => {
                            if (checked && !confirm('HTML 모드로 전환하시겠습니까? 기존 텍스트 포맷이 HTML 태그로 감싸지지 않을 수 있습니다.')) {
                                return;
                            }
                            onIsHtmlChange(checked);
                        }}
                    />
                    <Label htmlFor="html-mode" className="text-sm font-medium cursor-pointer flex items-center">
                        <Code className="w-4 h-4 mr-1 text-gray-500" />
                        HTML 모드 사용
                    </Label>
                </div>
            </div>

            <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                {isHtml ? (
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="bg-gray-50 border-b px-4 py-2 flex items-center justify-between">
                            <TabsList className="grid w-[200px] grid-cols-2">
                                <TabsTrigger value="edit" className="flex items-center">
                                    <Code className="w-3 h-3 mr-2" />
                                    HTML 편집
                                </TabsTrigger>
                                <TabsTrigger value="preview" className="flex items-center">
                                    <Eye className="w-3 h-3 mr-2" />
                                    미리보기
                                </TabsTrigger>
                            </TabsList>
                            <div className="text-xs text-gray-500 flex items-center">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                이미지 태그(&lt;img&gt;) 등을 포함한 전체 HTML을 입력하세요.
                            </div>
                        </div>

                        <TabsContent value="edit" className="mt-0 p-0">
                            <Textarea
                                value={value}
                                onChange={(e) => onChange(e.target.value)}
                                className="min-h-[400px] border-0 rounded-none focus-visible:ring-0 font-mono text-sm resize-y p-4"
                                placeholder="<div style='...'>...</div>"
                            />
                        </TabsContent>

                        <TabsContent value="preview" className="mt-0 p-0">
                            <div className="min-h-[400px] p-6 bg-white overflow-auto border-b">
                                <div
                                    className="prose max-w-none"
                                    dangerouslySetInnerHTML={{ __html: value }}
                                />
                            </div>
                        </TabsContent>
                    </Tabs>
                ) : (
                    <div className="relative">
                        <div className="bg-gray-50 border-b px-4 py-2 flex items-center text-xs text-gray-500">
                            <FileText className="w-3 h-3 mr-1" />
                            텍스트 모드: 줄바꿈이 자동으로 적용됩니다.
                        </div>
                        <Textarea
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            className="min-h-[300px] border-0 rounded-none focus-visible:ring-0 resize-y p-4"
                            placeholder="상품에 대한 상세한 설명을 적어주세요..."
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
