'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function BMICalculatorPage() {
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [bmi, setBMI] = useState<number | null>(null);
    const [category, setCategory] = useState('');

    const calculateBMI = () => {
        const h = parseFloat(height) / 100;
        const w = parseFloat(weight);

        if (h > 0 && w > 0) {
            const bmiValue = w / (h * h);
            setBMI(parseFloat(bmiValue.toFixed(1)));

            if (bmiValue < 18.5) {
                setCategory('저체중');
            } else if (bmiValue < 23) {
                setCategory('정상');
            } else if (bmiValue < 25) {
                setCategory('과체중');
            } else if (bmiValue < 30) {
                setCategory('비만');
            } else {
                setCategory('고도비만');
            }
        }
    };

    const getCategoryColor = () => {
        switch (category) {
            case '저체중':
                return 'text-blue-600';
            case '정상':
                return 'text-green-600';
            case '과체중':
                return 'text-yellow-600';
            case '비만':
                return 'text-orange-600';
            case '고도비만':
                return 'text-red-600';
            default:
                return '';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12">
            <div className="container mx-auto px-4 max-w-2xl">
                <Link href="/utils" className="inline-flex items-center text-blue-600 hover:underline mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    돌아가기
                </Link>

                <Card className="shadow-2xl">
                    <CardHeader className="text-center">
                        <div className="mb-4 text-xl">🧮</div>
                        <CardTitle className="text-3xl font-bold">BMI 계산기</CardTitle>
                        <CardDescription className="text-lg">신장과 체중으로 건강 지수를 계산해보세요</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="height" className="text-base font-semibold">
                                    신장 (cm)
                                </Label>
                                <Input
                                    id="height"
                                    type="number"
                                    placeholder="165"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                    className="mt-2 text-lg"
                                />
                            </div>

                            <div>
                                <Label htmlFor="weight" className="text-base font-semibold">
                                    체중 (kg)
                                </Label>
                                <Input
                                    id="weight"
                                    type="number"
                                    placeholder="60"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    className="mt-2 text-lg"
                                />
                            </div>

                            <Button onClick={calculateBMI} className="w-full" size="lg">
                                BMI 계산하기
                            </Button>
                        </div>

                        {bmi !== null && (
                            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 text-center space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">당신의 BMI</p>
                                    <p className="font-bold text-gray-900 text-xl">{bmi}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600 mb-2">분류</p>
                                    <p className={`text-3xl font-bold ${getCategoryColor()}`}>{category}</p>
                                </div>

                                <div className="bg-white rounded-lg p-4 text-left text-sm">
                                    <p className="font-semibold mb-2">📊 BMI 기준 (WHO 아시아-태평양)</p>
                                    <ul className="space-y-1 text-gray-600">
                                        <li>
                                            <span className="font-medium">저체중:</span> 18.5 미만
                                        </li>
                                        <li>
                                            <span className="font-medium">정상:</span> 18.5 ~ 22.9
                                        </li>
                                        <li>
                                            <span className="font-medium">과체중:</span> 23 ~ 24.9
                                        </li>
                                        <li>
                                            <span className="font-medium">비만:</span> 25 ~ 29.9
                                        </li>
                                        <li>
                                            <span className="font-medium">고도비만:</span> 30 이상
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                            <p className="font-semibold mb-2">ℹ️ BMI란?</p>
                            <p>
                                BMI(Body Mass Index)는 체질량지수로, 신장과 체중을 이용하여 비만도를 측정하는 지표입니다.
                                <br />
                                계산식: 체중(kg) ÷ [신장(m) × 신장(m)]
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
