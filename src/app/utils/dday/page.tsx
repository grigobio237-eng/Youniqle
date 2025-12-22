'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function DDayPage() {
    const [targetDate, setTargetDate] = useState('');
    const [eventName, setEventName] = useState('');
    const [dday, setDDay] = useState<number | null>(null);

    const calculateDDay = () => {
        if (!targetDate) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const target = new Date(targetDate);
        target.setHours(0, 0, 0, 0);

        const diffTime = target.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        setDDay(diffDays);
    };

    const getDDayText = () => {
        if (dday === null) return '';
        if (dday === 0) return 'D-Day';
        if (dday > 0) return `D-${dday}`;
        return `D+${Math.abs(dday)}`;
    };

    const getDDayColor = () => {
        if (dday === null) return '';
        if (dday === 0) return 'text-red-600';
        if (dday > 0) return 'text-blue-600';
        return 'text-gray-600';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12">
            <div className="container mx-auto px-4 max-w-2xl">
                <Link href="/utils" className="inline-flex items-center text-blue-600 hover:underline mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    돌아가기
                </Link>

                <Card className="shadow-2xl">
                    <CardHeader className="text-center">
                        <div className="text-6xl mb-4">📅</div>
                        <CardTitle className="text-3xl font-bold">D-Day 계산기</CardTitle>
                        <CardDescription className="text-lg">중요한 날까지 며칠 남았는지 확인하세요</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="eventName" className="text-base font-semibold">
                                    이벤트 이름
                                </Label>
                                <Input
                                    id="eventName"
                                    type="text"
                                    placeholder="예: 생일, 시험, 여행"
                                    value={eventName}
                                    onChange={(e) => setEventName(e.target.value)}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <Label htmlFor="targetDate" className="text-base font-semibold">
                                    목표 날짜
                                </Label>
                                <Input
                                    id="targetDate"
                                    type="date"
                                    value={targetDate}
                                    onChange={(e) => setTargetDate(e.target.value)}
                                    className="mt-2"
                                />
                            </div>

                            <Button onClick={calculateDDay} className="w-full" size="lg">
                                D-Day 계산하기
                            </Button>
                        </div>

                        {dday !== null && (
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-8 text-center space-y-4">
                                {eventName && (
                                    <div>
                                        <p className="text-lg text-gray-600 mb-2">{eventName}</p>
                                    </div>
                                )}

                                <div>
                                    <p className={`text-7xl font-bold ${getDDayColor()}`}>{getDDayText()}</p>
                                </div>

                                <div className="text-gray-600">
                                    {dday === 0 && <p className="text-xl font-semibold">오늘이 바로 그날입니다! 🎉</p>}
                                    {dday > 0 && (
                                        <p className="text-lg">
                                            목표일까지 <span className="font-bold text-blue-600">{dday}일</span> 남았습니다
                                        </p>
                                    )}
                                    {dday < 0 && (
                                        <p className="text-lg">
                                            목표일이 <span className="font-bold text-gray-600">{Math.abs(dday)}일</span> 지났습니다
                                        </p>
                                    )}
                                </div>

                                <div className="bg-white rounded-lg p-4 text-sm text-gray-600">
                                    <p>
                                        📆 목표 날짜: <span className="font-semibold">{new Date(targetDate).toLocaleDateString('ko-KR')}</span>
                                    </p>
                                    <p className="mt-2">
                                        📍 오늘: <span className="font-semibold">{new Date().toLocaleDateString('ko-KR')}</span>
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                            <p className="font-semibold mb-2">💡 사용 팁</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>D-Day: 당일입니다</li>
                                <li>D-7: 7일 남았습니다</li>
                                <li>D+3: 3일 지났습니다</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
