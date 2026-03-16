
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Music, Check, RefreshCw, Play, Pause } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function StepAudio({ project, onUpdate, onNext }: { project: any, onUpdate: () => void, onNext: () => void }) {
    const [generating, setGenerating] = useState(false);
    const [regeneratingId, setRegeneratingId] = useState<number | null>(null);
    const [editableScripts, setEditableScripts] = useState<Record<number, string>>({});

    // ElevenLabs 무료 플랜용 기본 성우(Premade Voices) ID 맵 - API 실측 결과 기반
    const KOREAN_VOICES = {
        BELLA: 'hpp4J3VqNfWAUOO0d1Us',  // 여성 - 전문적인, 밝은
        ALICE: 'Xb7hH8MSUJpSbSDYk0k2',  // 여성 - 명확한, 신뢰감
        LILY: 'pFZP5JQG7iQjIQuC4Bku',   // 여성 - 감성적인, 극적인
        ADAM: 'pNInz6obpgDQGcFmaJgB'    // 남성 - 진중한, 깊은
    };

    const scriptData = project.workflow?.data?.script;
    const recommendedVoice = scriptData?.recommendedVoice;
    const assets = project.workflow?.data?.assets || [];
    const audios = assets.filter((a: any) => a.type === 'audio');

    // Initialize editable scripts from project data
    useEffect(() => {
        if (scriptData?.scenes) {
            const scripts: Record<number, string> = {};
            scriptData.scenes.forEach((s: any) => {
                scripts[s.id] = s.audioScript;
            });
            setEditableScripts(scripts);
        }
    }, [scriptData]);

    const [voiceName, setVoiceName] = useState(() => {
        // AI 추천 성별에 따라 기본 성우 선택
        if (recommendedVoice?.gender === 'MALE') return KOREAN_VOICES.ADAM;
        return KOREAN_VOICES.BELLA; // 기본값 여성
    });

    const getGender = (id: string) => {
        if (id === KOREAN_VOICES.ADAM) return 'MALE';
        return 'FEMALE';
    };

    const handleScriptChange = (sceneId: number, value: string) => {
        setEditableScripts(prev => ({ ...prev, [sceneId]: value }));
    };

    const handleGenerateAll = async () => {
        setGenerating(true);
        try {
            // 일괄 생성 시에도 현재 UI에 있는 텍스트를 먼저 저장해야 할 수 있음 
            // 하지만 일괄 생성은 보통 초기 단계이므로 기본 저장된 값을 사용하거나, 
            // 전체 저장을 먼저 수행하도록 유도. 여기서는 단순히 생성 호출.
            const res = await fetch('/api/admin/video/step/audio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId: project._id, voiceName, gender: getGender(voiceName) }),
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
        const newText = editableScripts[sceneId];
        setRegeneratingId(sceneId);

        try {
            // 1. 수정된 텍스트가 있다면 먼저 DB에 저장
            if (newText !== undefined) {
                const updatedScript = { ...scriptData };
                const sceneIndex = updatedScript.scenes.findIndex((s: any) => s.id === sceneId);
                if (sceneIndex !== -1) {
                    updatedScript.scenes[sceneIndex].audioScript = newText;

                    await fetch(`/api/admin/video/${project._id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            workflow: {
                                data: { ...project.workflow.data, script: updatedScript }
                            }
                        }),
                    });
                }
            }

            // 2. 오디오 재생성 호출
            const res = await fetch('/api/admin/video/step/audio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId: project._id, sceneId, regenerate: true, voiceName, gender: getGender(voiceName) }),
            });

            if (res.ok) {
                onUpdate();
            }
        } catch (e) {
            console.error(e);
            alert('Failed to update and regenerate audio');
        } finally {
            setRegeneratingId(null);
        }
    };

    const allAudiosGenerated = (scriptData?.scenes?.length > 0) &&
        scriptData.scenes.every((s: any) => audios?.find((aud: any) => aud.sceneId === s.id));

    const isProductPromo = project.projectType === 'product_promo';

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{isProductPromo ? '5. 오디오 생성' : '3. 오디오 생성'}</CardTitle>
                    <CardDescription>
                        대본의 대사(Line)별로 AI 음성을 생성합니다. 발음이 어색할 경우 직접 수정 후 재생성하세요.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-end gap-4 border-b pb-6">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="voice">성우 선택</Label>
                            <Select value={voiceName} onValueChange={setVoiceName}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Voice" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={KOREAN_VOICES.BELLA}>여성 (밝은 - 벨라)</SelectItem>
                                    <SelectItem value={KOREAN_VOICES.ALICE}>여성 (명확한 - 앨리스)</SelectItem>
                                    <SelectItem value={KOREAN_VOICES.LILY}>여성 (감성적인 - 릴리)</SelectItem>
                                    <SelectItem value={KOREAN_VOICES.ADAM}>남성 (깊은 - 아담)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleGenerateAll} disabled={generating}>
                            {generating ? <Loader2 className="animate-spin mr-2" /> : <Music className="mr-2" />}
                            {audios.length > 0 ? "전체 다시 생성" : "오디오 일괄 생성"}
                        </Button>
                    </div>

                    <div className="grid gap-4">
                        {scriptData?.scenes?.map((scene: any) => {
                            const audio = audios.find((a: any) => a.sceneId === scene.id);
                            const isRegenerating = regeneratingId === scene.id;

                            return (
                                <div key={scene.id} className="flex items-center justify-between p-4 border rounded-lg bg-card gap-4">
                                    <div className="flex-1 space-y-1">
                                        <div className="text-xs font-mono text-muted-foreground flex justify-between">
                                            <span>SCENE #{scene.id}</span>
                                            <span className="text-[10px] opacity-50">수정 후 우측 새로고침 버튼 클릭</span>
                                        </div>
                                        <Input
                                            value={editableScripts[scene.id] || ''}
                                            onChange={(e) => handleScriptChange(scene.id, e.target.value)}
                                            className="h-9 text-sm font-medium border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/30 p-0 bg-transparent hover:bg-muted/30 transition-colors px-2"
                                            placeholder="대사를 입력하거나 수정하세요..."
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {audio ? (
                                            <audio
                                                controls
                                                src={`${audio.path}?t=${new Date(project.updatedAt).getTime()}`}
                                                className="h-8 w-48 lg:w-64"
                                            />
                                        ) : (
                                            <span className="text-xs text-muted-foreground">생성 전</span>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRegenerateOne(scene.id)}
                                            disabled={isRegenerating || generating}
                                            title="수정 사항 저장 및 재생성"
                                            className="hover:text-primary transition-colors"
                                        >
                                            {isRegenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-end gap-2 pt-6 border-t mt-6">
                        <Button onClick={onNext} className="bg-green-600 hover:bg-green-700" disabled={!allAudiosGenerated}>
                            다음 단계로 (이미지) <Check className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
