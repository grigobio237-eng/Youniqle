
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Image as ImageIcon, Check, RefreshCw, AlertCircle } from 'lucide-react';
import Image from 'next/image';

export default function StepImage({ project, onUpdate, onNext }: { project: any, onUpdate: () => void, onNext: () => void }) {
    const [generating, setGenerating] = useState(false);
    const [regeneratingId, setRegeneratingId] = useState<number | null>(null);
    const [version, setVersion] = useState(Date.now()); // 캐시 버스팅용 버전

    const isProductPromo = project.projectType === 'product_promo';

    const scriptData = project.workflow?.data?.script;
    const assets = project.workflow?.data?.assets || [];

    // 장면별 생성 이미지: sceneId가 있는 이미지만 필터링
    const images = assets.filter((a: any) => a.type === 'image' && a.sceneId !== null);

    // 참조 에셋: 업로드된 상품/모델 이미지 + 생성된 마스터 앵커
    // [보강] 경로가 "product", "model" 등 플레이스홀더인 경우 제외 (정상 업로드 확인용)
    const referenceAssets = assets.filter((a: any) =>
        a.sceneId === null &&
        (a.role === 'product' || a.role === 'model' || a.role === 'master_anchor') &&
        (a.path && a.path.length > 5 && (a.path.startsWith('/') || a.path.startsWith('http')))
    );

    const invalidAssets = assets.filter((a: any) =>
        a.sceneId === null &&
        (a.role === 'product' || a.role === 'model') &&
        (!a.path || a.path.length <= 5 || (!a.path.startsWith('/') && !a.path.startsWith('http')))
    );

    const handleGenerateAll = async () => {
        setGenerating(true);
        try {
            const res = await fetch('/api/admin/video/step/image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId: project._id, regenerate: true }),
            });
            if (res.ok) {
                setVersion(Date.now());
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
            const res = await fetch('/api/admin/video/step/image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId: project._id, sceneId, regenerate: true }),
            });
            if (res.ok) {
                setVersion(Date.now());
                onUpdate();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setRegeneratingId(null);
        }
    };

    const allImagesGenerated = (scriptData?.scenes?.length > 0) &&
        scriptData.scenes.every((s: any) => images.find((img: any) => img.sceneId === s.id));

    return (
        <div className="space-y-8">
            {/* 상단 참조 에셋 섹션 */}
            {referenceAssets.length > 0 && (
                <Card className="bg-muted/30 border-dashed">
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-primary" />
                            기준 참고 이미지 (Reference Assets)
                        </CardTitle>
                        <CardDescription className="text-xs">
                            업로드하신 상품과 모델 이미지입니다. 이 이미지를 참고하여 각 장면이 생성됩니다.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-4 space-y-4">
                        <div className="flex gap-4">
                            {referenceAssets.map((asset: any) => {
                                // [중요] 에셋 경로가 /api/admin/video/assets?path=product 등으로 변조된 상태로 들어오는 경우를 대비하여
                                // 원본 Firebase URL이 보존되도록 path를 직접 사용하되, 절대경로 체크를 강화합니다.
                                const assetUrl = asset.path || '';
                                return (
                                    <div key={asset.id} className="relative w-24 aspect-square rounded-lg overflow-hidden border-2 bg-background">
                                        <Image
                                            src={assetUrl.startsWith('http') ? assetUrl : `${assetUrl}?v=${version}`}
                                            alt={asset.role}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                        <div className="absolute inset-x-0 bottom-0 bg-black/60 text-[10px] text-white text-center py-0.5">
                                            {asset.role === 'product' ? '상품 원본' : asset.role === 'model' ? '모델 원본' : '마스터 앵커'}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {invalidAssets.length > 0 && (
                            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <div>
                                    <p className="font-bold">업로드되지 않은 에셋이 있습니다.</p>
                                    <p className="opacity-80">프로젝트 생성 시 업로드한 파일이 정상적으로 전달되지 않았습니다. (데이터: {invalidAssets.map((a: any) => a.role).join(', ')})</p>
                                    <p className="mt-1 font-semibold underline cursor-pointer" onClick={() => window.location.href = '/admin/auto-video'}>새 프로젝트로 다시 생성하시기를 권장합니다.</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>{isProductPromo ? '6. 장면별 이미지 생성' : '4. 장면별 이미지 생성'} (Image Generation)</CardTitle>
                    <CardDescription>
                        대본의 각 장면에 맞는 이미지를 생성합니다. 위 기준 이미지를 참고하여 일관성 있게 그려집니다.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {images.filter((img: any) => img.sceneId !== null).length === 0 ? (
                        <div className="text-center py-10 space-y-4">
                            <p className="text-muted-foreground">대본과 오디오가 준비되었습니다. 이제 이미지를 생성해보세요.</p>
                            <Button size="lg" onClick={handleGenerateAll} disabled={generating}>
                                {generating ? <Loader2 className="animate-spin mr-2" /> : <ImageIcon className="mr-2" />}
                                장면 이미지 일괄 생성하기
                            </Button>
                        </div>
                    ) : (
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                {scriptData?.scenes?.map((scene: any) => {
                                    const image = images.find((i: any) => i.sceneId === scene.id);
                                    const isRegenerating = regeneratingId === scene.id;

                                    return (
                                        <Card key={scene.id} className="overflow-hidden border-2 shadow-sm">
                                            <div className="relative aspect-[9/16] bg-slate-100 group">
                                                {image ? (
                                                    <div className="relative w-full h-full">
                                                        <Image
                                                            src={`${image.path}?v=${version}`}
                                                            alt={`Scene ${scene.id}`}
                                                            fill
                                                            className="object-cover"
                                                            unoptimized
                                                        />
                                                        {/* Overlay for Regenerate */}
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none group-hover:pointer-events-auto">
                                                            <Button
                                                                variant="secondary"
                                                                size="sm"
                                                                onClick={() => handleRegenerateOne(scene.id)}
                                                                disabled={isRegenerating || generating}
                                                            >
                                                                {isRegenerating ? <Loader2 className="animate-spin mr-2" /> : <RefreshCw className="mr-2" />}
                                                                다시 그리기
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-muted-foreground">
                                                        {generating || isRegenerating ? <Loader2 className="animate-spin" /> : "이미지 대기 중"}
                                                    </div>
                                                )}
                                            </div>
                                            <CardContent className="p-3">
                                                <div className="text-xs font-mono text-muted-foreground mb-1 flex justify-between items-center">
                                                    <span>SCENE #{scene.id}</span>
                                                    {image && <Check className="w-3 h-3 text-green-500" />}
                                                </div>
                                                <p className="text-sm line-clamp-3 text-muted-foreground" title={scene.visualPrompt}>
                                                    {scene.visualPrompt}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>

                            <div className="flex justify-end gap-2 pt-6 border-t">
                                <Button variant="outline" onClick={handleGenerateAll} disabled={generating}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    전체 이미지 다시 생성
                                </Button>
                                <Button onClick={onNext} className="bg-green-600 hover:bg-green-700" disabled={!allImagesGenerated}>
                                    다음 단계로 (영상) <Check className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
