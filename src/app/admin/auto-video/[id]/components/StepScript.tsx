
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, ScrollText, Check, RefreshCw } from 'lucide-react';
import { Label } from '@/components/ui/label';

export default function StepScript({ project, onUpdate, onNext }: { project: any, onUpdate: () => void, onNext: () => void }) {
    const [generating, setGenerating] = useState(false);
    const [scriptData, setScriptData] = useState<any>(project.workflow?.data?.script || null);

    // Manage editing state for scenes
    // We update local state first, then save via PUT

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const res = await fetch('/api/admin/video/step/script', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId: project._id }),
            });
            const data = await res.json();
            if (res.ok) {
                setScriptData(data.data);
                onUpdate();
            } else {
                alert('Script generation failed: ' + data.error);
            }
        } catch (e) {
            console.error(e);
            alert('Error generating script');
        } finally {
            setGenerating(false);
        }
    };

    const handleSceneChange = (index: number, field: string, value: string) => {
        if (!scriptData) return;
        const newScenes = [...scriptData.scenes];
        newScenes[index] = { ...newScenes[index], [field]: value };
        setScriptData({ ...scriptData, scenes: newScenes });
    };

    const handleTitleChange = (value: string) => {
        if (!scriptData) return;
        setScriptData({ ...scriptData, title: value });
    };

    const handleSave = async () => {
        if (!scriptData) return;
        try {
            const res = await fetch(`/api/admin/video/${project._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workflow: {
                        data: { script: scriptData },
                        stepStatus: { ...project.workflow?.stepStatus, script: 'completed' }
                    }
                }),
            });
            if (res.ok) {
                onUpdate();
                onNext();
            }
        } catch (e) {
            alert('Error saving script');
        }
    };

    const isProductPromo = project.projectType === 'product_promo';

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{isProductPromo ? '4. 영상 대본 작성' : '2. 영상 대본 작성'}</CardTitle>
                    <CardDescription>
                        트렌드 분석 내용을 기반으로 최적화된 영상 대본을 구성합니다.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!scriptData ? (
                        <div className="text-center py-10 space-y-4">
                            <p className="text-muted-foreground">트렌드 분석이 완료되었습니다. 이제 대본을 작성해보세요.</p>
                            <Button size="lg" onClick={handleGenerate} disabled={generating}>
                                {generating ? <Loader2 className="animate-spin mr-2" /> : <ScrollText className="mr-2" />}
                                대본 자동 작성하기
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Title Edit */}
                            <div className="space-y-2">
                                <Label htmlFor="video-title">영상 제목</Label>
                                <Input
                                    id="video-title"
                                    value={scriptData.title}
                                    onChange={(e) => handleTitleChange(e.target.value)}
                                    className="text-lg font-bold"
                                />
                            </div>

                            {/* Scenes List */}
                            <div className="space-y-6">
                                {scriptData.scenes?.map((scene: any, index: number) => (
                                    <div key={index} className="border rounded-lg p-4 space-y-4 relative bg-card">
                                        <div className="absolute top-4 right-4 text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                                            SCENE #{scene.id}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-primary">🖼️ 시각적 묘사 (Image Prompt)</Label>
                                            <Textarea
                                                value={scene.visualPrompt}
                                                onChange={(e) => handleSceneChange(index, 'visualPrompt', e.target.value)}
                                                className="min-h-[80px]"
                                            />
                                            <p className="text-xs text-muted-foreground">유니클이 이 설명을 보고 이미지를 그립니다. 구체적일수록 좋습니다.</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-green-600">🎙️ 내레이션 (Narration)</Label>
                                            <Textarea
                                                value={scene.audioScript}
                                                onChange={(e) => handleSceneChange(index, 'audioScript', e.target.value)}
                                                className="min-h-[60px]"
                                            />
                                            <p className="text-xs text-muted-foreground">성우가 읽을 대사입니다.</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end gap-2 pt-6 border-t">
                                <Button variant="outline" onClick={handleGenerate} disabled={generating}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    전체 다시 쓰기 (AI)
                                </Button>
                                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                                    확정 및 오디오 생성으로 이동 <Check className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
