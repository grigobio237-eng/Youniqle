
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Film, Check, RefreshCw } from 'lucide-react';

export default function StepVideo({ project, onUpdate, onNext }: { project: any, onUpdate: () => void, onNext: () => void }) {
    const [generating, setGenerating] = useState(false);
    const [regeneratingId, setRegeneratingId] = useState<number | null>(null);

    const scriptData = project.workflow?.data?.script;
    const videoClips = project.workflow?.data?.videoClips || []; // Array of strings (paths)

    // Helper to find clip by scene ID from path string
    const getClipForScene = (sceneId: number) => {
        return videoClips.find((path: string) => path.includes(`video_scene_${sceneId}.mp4`));
    };

    const handleGenerateAll = async () => {
        setGenerating(true);
        try {
            const res = await fetch('/api/admin/video/step/video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId: project._id, regenerate: true }),
            });
            if (res.ok) {
                onUpdate();
            } else {
                alert('Generation failed');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setGenerating(false);
        }
    };

    const handleRegenerateOne = async (sceneId: number) => {
        setRegeneratingId(sceneId);
        try {
            const res = await fetch('/api/admin/video/step/video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId: project._id, sceneId, regenerate: true }),
            });
            if (res.ok) {
                onUpdate();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setRegeneratingId(null);
        }
    };

    const allVideosGenerated = (scriptData?.scenes?.length > 0) &&
        scriptData.scenes.every((s: any) => getClipForScene(s.id));

    const isProductPromo = project.projectType === 'product_promo';

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{isProductPromo ? '7. AI 영상 생성' : '5. AI 영상 생성'}</CardTitle>
                    <CardDescription>
                        각 씬(Scene)별로 숏츠에 최적화된 고화질 영상을 생성합니다.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {videoClips.length === 0 ? (
                        <div className="text-center py-10 space-y-4">
                            <p className="text-muted-foreground">이미지와 오디오가 준비되었습니다. 영상 클립을 생성하세요.</p>
                            <Button size="lg" onClick={handleGenerateAll} disabled={generating}>
                                {generating ? <Loader2 className="animate-spin mr-2" /> : <Film className="mr-2" />}
                                영상 클립 일괄 생성하기
                            </Button>
                        </div>
                    ) : (
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                {scriptData?.scenes?.map((scene: any) => {
                                    const clipPath = getClipForScene(scene.id);
                                    const isRegenerating = regeneratingId === scene.id;

                                    return (
                                        <Card key={scene.id} className="overflow-hidden border-2 shadow-sm">
                                            <div className="relative aspect-[9/16] bg-black group">
                                                {clipPath ? (
                                                    <div className="relative w-full h-full">
                                                        <video
                                                            src={clipPath}
                                                            className="w-full h-full object-cover"
                                                            controls
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-muted-foreground">
                                                        {generating || isRegenerating ? <Loader2 className="animate-spin" /> : "영상 없음"}
                                                    </div>
                                                )}
                                            </div>
                                            <CardContent className="p-3 flex justify-between items-center bg-muted/20">
                                                <div className="text-xs font-mono text-muted-foreground">SCENE #{scene.id}</div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRegenerateOne(scene.id)}
                                                    disabled={isRegenerating || generating}
                                                >
                                                    {isRegenerating ? <Loader2 className="animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>

                            <div className="flex justify-end gap-2 pt-6 border-t">
                                <Button variant="outline" onClick={handleGenerateAll} disabled={generating}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    전체 다시 생성
                                </Button>
                                <Button onClick={onNext} className="bg-green-600 hover:bg-green-700" disabled={!allVideosGenerated}>
                                    다음 단계로 (최종 합성) <Check className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
