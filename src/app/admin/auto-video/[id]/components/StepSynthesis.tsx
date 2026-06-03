'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Clapperboard, Download, CheckCircle2, Sparkles } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function StepSynthesis({ project, onUpdate }: { project: any, onUpdate: () => void }) {
    const [generating, setGenerating] = useState(false);
    const [transitionType, setTransitionType] = useState('fade');
    const [transitionDuration, setTransitionDuration] = useState(0.8);

    const TRANSITIONS = [
        { value: 'none', label: '효과 없음 (단순 연결)' },
        { value: 'fade', label: '페이드 (Fade)' },
        { value: 'dissolve', label: '디졸브 (Dissolve)' },
        { value: 'wipeleft', label: '와이프 - 왼쪽 (Wipe Left)' },
        { value: 'wiperight', label: '와이프 - 오른쪽 (Wipe Right)' },
        { value: 'slideup', label: '슬라이드 - 위로 (Slide Up)' },
        { value: 'slidedown', label: '슬라이드 - 아래로 (Slide Down)' },
        { value: 'circlecrop', label: '원형 크롭 (Circle Crop)' },
        { value: 'radial', label: '방사형 (Radial)' },
        { value: 'pixelize', label: '픽셀화 (Pixelize)' },
    ];

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const res = await fetch('/api/admin/video/step/synthesis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: project._id,
                    transitionType,
                    transitionDuration
                }),
            });
            const data = await res.json();
            if (res.ok) {
                onUpdate();
            } else {
                alert('Synthesis failed: ' + data.error);
            }
        } catch (e) {
            console.error(e);
            alert('Error generating final video');
        } finally {
            setGenerating(false);
        }
    };

    const isCompleted = project.workflow?.stepStatus?.synthesis === 'completed';
    const isProductPromo = project.projectType === 'product_promo';

    return (
        <div className="space-y-6">
            <Card className={isCompleted ? "border-green-500/50 bg-green-50/10" : ""}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {isProductPromo ? '8. 최종 영상 완성' : '6. 최종 합성 (Final Synthesis)'}
                        {isCompleted && <CheckCircle2 className="text-green-500 h-6 w-6" />}
                    </CardTitle>
                    <CardDescription>
                        모든 클립을 부드러운 전환 효과와 함께 하나로 병합합니다.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/30 rounded-xl border border-dashed mb-4">
                        <div className="space-y-3">
                            <Label className="text-sm font-bold flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-primary" />
                                전환 효과 (Transition)
                            </Label>
                            <Select value={transitionType} onValueChange={setTransitionType}>
                                <SelectTrigger className="bg-background">
                                    <SelectValue placeholder="효과 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    {TRANSITIONS.map(t => (
                                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="transition-duration" className="text-sm font-bold">전환 지속 시간 ({transitionDuration}초)</Label>
                            </div>
                            <div className="pt-4 px-2">
                                <input
                                    id="transition-duration"
                                    type="range"
                                    min="0.1"
                                    max="2"
                                    step="0.1"
                                    value={transitionDuration}
                                    onChange={(e) => setTransitionDuration(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                                    title="전환 지속 시간 설정"
                                    aria-label="전환 지속 시간 설정"
                                />
                                <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                                    <span>0.1s</span>
                                    <span>1.0s</span>
                                    <span>2.0s</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {project.finalVideoUrl ? (
                        <div className="space-y-6">
                            <Alert className="bg-green-50 border-green-200">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <AlertTitle className="text-green-800 font-semibold">영상 제작 완료!</AlertTitle>
                                <AlertDescription className="text-green-700">
                                    지정한 전환 효과가 적용된 최종 영상이 성공적으로 생성되었습니다.
                                </AlertDescription>
                            </Alert>

                            <div className="aspect-[9/16] max-h-[600px] mx-auto bg-black rounded-lg overflow-hidden shadow-2xl relative">
                                <video
                                    src={`${project.finalVideoUrl}?t=${new Date(project.updatedAt).getTime()}`}
                                    controls
                                    className="w-full h-full object-contain"
                                    autoPlay
                                />
                            </div>

                            <div className="flex justify-center gap-4">
                                <Button size="lg" asChild className="px-8">
                                    <a href={project.finalVideoUrl} download target="_blank" rel="noopener noreferrer">
                                        <Download className="mr-2 h-4 w-4" />
                                        다운로드
                                    </a>
                                </Button>
                                <Button variant="outline" size="lg" onClick={handleGenerate} disabled={generating}>
                                    <Clapperboard className="mr-2 h-4 w-4" />
                                    {generating ? '재합성 중...' : '효과 변경후 다시 만들기'}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-10 space-y-6">
                            <p className="text-muted-foreground text-lg">
                                선택하신 전환 효과로 최종 영상을 완성할 준비가 되었습니다.
                            </p>
                            <Button size="lg" onClick={handleGenerate} disabled={generating} className="px-12 py-8 h-auto shadow-lg hover:shadow-xl transition-all text-xl">
                                {generating ? (
                                    <>
                                        <Loader2 className="animate-spin mr-3 h-8 w-8" />
                                        최종 렌더링 중...
                                    </>
                                ) : (
                                    <>
                                        <Clapperboard className="mr-3 h-8 w-8" />
                                        최종 영상 만들기
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
