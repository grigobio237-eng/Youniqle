'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

export default function MemoPage() {
    const [memo, setMemo] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem('quick_memo');
        if (saved) {
            setMemo(saved);
        }
    }, []);

    const saveMemo = () => {
        localStorage.setItem('quick_memo', memo);
        alert('✅ 메모가 저장되었습니다!');
    };

    const clearMemo = () => {
        if (confirm('정말 메모를 삭제하시겠습니까?')) {
            setMemo('');
            localStorage.removeItem('quick_memo');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <Link href="/utils" className="inline-flex items-center text-blue-600 hover:underline mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    돌아가기
                </Link>

                <Card className="shadow-2xl">
                    <CardHeader className="text-center">
                        <div className="mb-4 text-xl">📝</div>
                        <CardTitle className="text-3xl font-bold">간편 메모장</CardTitle>
                        <CardDescription className="text-lg">빠르게 메모하고 자동 저장하세요</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <Textarea
                            value={memo}
                            onChange={(e) => setMemo(e.target.value)}
                            placeholder="여기에 메모를 작성하세요..."
                            className="min-h-[400px] text-base"
                        />

                        <div className="flex gap-2">
                            <Button onClick={saveMemo} className="flex-1" size="lg">
                                <Save className="h-5 w-5 mr-2" />
                                저장하기
                            </Button>
                            <Button onClick={clearMemo} variant="destructive" size="lg">
                                <Trash2 className="h-5 w-5 mr-2" />
                                삭제
                            </Button>
                        </div>

                        <div className="bg-blue-50 rounded-lg p-4 text-sm text-gray-600">
                            <p className="font-semibold mb-2">💡 자동 저장 기능</p>
                            <p>작성한 메모는 브라우저에 저장되어 다음 방문 시에도 유지됩니다.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
