
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2, Check } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function StepTrend({ project, onUpdate, onNext }: { project: any, onUpdate: () => void, onNext: () => void }) {
    const [generating, setGenerating] = useState(false);
    const [trendData, setTrendData] = useState<any>(project.workflow?.data?.trend || null);
    const [editMode, setEditMode] = useState(false);
    const [jsonString, setJsonString] = useState(JSON.stringify(trendData, null, 2));

    const handleAnalyze = async () => {
        setGenerating(true);
        try {
            const res = await fetch('/api/admin/video/step/trend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId: project._id, topic: project.topic }),
            });
            const data = await res.json();
            if (res.ok) {
                setTrendData(data.data);
                setJsonString(JSON.stringify(data.data, null, 2));
                onUpdate();
            } else {
                alert('Analysis failed: ' + data.error);
            }
        } catch (e) {
            console.error(e);
            alert('Error analyzing trend');
        } finally {
            setGenerating(false);
        }
    };

    const handleSave = async () => {
        try {
            const parsed = JSON.parse(jsonString);
            const res = await fetch(`/api/admin/video/${project._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workflow: {
                        data: { trend: parsed },
                        stepStatus: { ...project.workflow?.stepStatus, trend: 'completed' }
                    }
                }),
            });
            if (res.ok) {
                setTrendData(parsed);
                setEditMode(false);
                onUpdate();
            }
        } catch (e) {
            alert('Invalid JSON format');
        }
    };

    const isCompleted = project.workflow?.stepStatus?.trend === 'completed';

    const isProductPromo = project.projectType === 'product_promo';

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{isProductPromo ? '3. 트렌드 & 기획 분석' : '1. 트렌드 & 기획 분석'}</CardTitle>
                    <CardDescription>
                        Gemini Pro가 주제 "{project.topic}"에 맞는 최신 트렌드와 영상 컨셉을 제안합니다.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!trendData ? (
                        <div className="text-center py-10 space-y-4">
                            <p className="text-muted-foreground">아직 분석된 데이터가 없습니다.</p>
                            <Button size="lg" onClick={handleAnalyze} disabled={generating}>
                                {generating ? <Loader2 className="animate-spin mr-2" /> : <Wand2 className="mr-2" />}
                                AI 기획 시작하기
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {editMode ? (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">분석 결과 수정 (JSON)</p>
                                    <Textarea
                                        value={jsonString}
                                        onChange={(e) => setJsonString(e.target.value)}
                                        className="font-mono h-96 text-sm bg-slate-950 text-slate-50 p-4"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" onClick={() => setEditMode(false)}>취소</Button>
                                        <Button onClick={handleSave}>저장 및 확정</Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <Alert className="bg-blue-50 border-primary/30">
                                        <Wand2 className="h-4 w-4 text-primary" />
                                        <AlertTitle className="text-primary font-semibold">AI 분석 결과</AlertTitle>
                                        <AlertDescription className="text-primary">
                                            {trendData.analysis || "분석 완료"}
                                        </AlertDescription>
                                    </Alert>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="border p-4 rounded-lg bg-card text-card-foreground">
                                            <h3 className="font-semibold mb-2 text-primary">🎯 핵심 컨셉</h3>
                                            <ul className="list-disc pl-5 space-y-1">
                                                {trendData.concepts?.map((c: string, i: number) => (
                                                    <li key={i}>{c}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="border p-4 rounded-lg bg-card text-card-foreground">
                                            <h3 className="font-semibold mb-2 text-primary">🪝 후킹 문구</h3>
                                            <ul className="list-disc pl-5 space-y-1">
                                                {trendData.hooks?.map((h: string, i: number) => (
                                                    <li key={i}>{h}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="border p-4 rounded-lg bg-card text-card-foreground">
                                        <h3 className="font-semibold mb-2 text-primary">✨ 스타일링 가이드</h3>
                                        <p>{trendData.styling}</p>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-4 border-t">
                                        <Button variant="outline" onClick={handleAnalyze} disabled={generating}>
                                            <Wand2 className="mr-2 h-4 w-4" />
                                            다시 분석하기
                                        </Button>
                                        <Button variant="outline" onClick={() => setEditMode(true)}>
                                            수정하기
                                        </Button>
                                        <Button onClick={onNext} className="bg-green-600 hover:bg-green-700">
                                            다음 단계로 (대본 작성) <Check className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
