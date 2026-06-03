'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { ArrowLeft, ArrowLeftRight } from 'lucide-react';

type UnitType = 'length' | 'weight' | 'temperature';

interface Conversion {
    from: string;
    to: string;
    formula: (value: number) => number;
}

const conversions: Record<UnitType, Conversion[]> = {
    length: [
        { from: 'cm', to: 'inch', formula: (v) => v / 2.54 },
        { from: 'inch', to: 'cm', formula: (v) => v * 2.54 },
        { from: 'm', to: 'ft', formula: (v) => v * 3.28084 },
        { from: 'ft', to: 'm', formula: (v) => v / 3.28084 },
        { from: 'km', to: 'mile', formula: (v) => v * 0.621371 },
        { from: 'mile', to: 'km', formula: (v) => v / 0.621371 },
    ],
    weight: [
        { from: 'kg', to: 'lb', formula: (v) => v * 2.20462 },
        { from: 'lb', to: 'kg', formula: (v) => v / 2.20462 },
        { from: 'g', to: 'oz', formula: (v) => v * 0.035274 },
        { from: 'oz', to: 'g', formula: (v) => v / 0.035274 },
    ],
    temperature: [
        { from: '°C', to: '°F', formula: (v) => v * 1.8 + 32 },
        { from: '°F', to: '°C', formula: (v) => (v - 32) / 1.8 },
        { from: '°C', to: 'K', formula: (v) => v + 273.15 },
        { from: 'K', to: '°C', formula: (v) => v - 273.15 },
    ],
};

export default function UnitConverterPage() {
    const [unitType, setUnitType] = useState<UnitType>('length');
    const [fromUnit, setFromUnit] = useState('cm');
    const [toUnit, setToUnit] = useState('inch');
    const [inputValue, setInputValue] = useState('');
    const [result, setResult] = useState<number | null>(null);

    const handleConvert = () => {
        const value = parseFloat(inputValue);
        if (isNaN(value)) return;

        const conversion = conversions[unitType].find((c) => c.from === fromUnit && c.to === toUnit);

        if (conversion) {
            setResult(conversion.formula(value));
        }
    };

    const handleSwap = () => {
        setFromUnit(toUnit);
        setToUnit(fromUnit);
        if (result !== null) {
            setInputValue(result.toFixed(2));
            setResult(parseFloat(inputValue));
        }
    };

    const getUnits = () => {
        return [...new Set(conversions[unitType].flatMap((c) => [c.from, c.to]))];
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 py-12">
            <div className="container mx-auto px-4 max-w-2xl">
                <Link href="/utils" className="inline-flex items-center text-primary hover:underline mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    돌아가기
                </Link>

                <Card className="shadow-2xl">
                    <CardHeader className="text-center">
                        <div className="mb-4 text-xl">📏</div>
                        <CardTitle className="text-3xl font-bold">단위 변환기</CardTitle>
                        <CardDescription className="text-lg">길이, 무게, 온도를 쉽게 변환하세요</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div>
                            <Label className="text-base font-semibold mb-2 block">변환 종류</Label>
                            <Select value={unitType} onValueChange={(value) => setUnitType(value as UnitType)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="length">길이 (Length)</SelectItem>
                                    <SelectItem value="weight">무게 (Weight)</SelectItem>
                                    <SelectItem value="temperature">온도 (Temperature)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="from" className="text-base font-semibold">
                                    입력
                                </Label>
                                <div className="flex gap-2 mt-2">
                                    <Input
                                        id="from"
                                        type="number"
                                        placeholder="숫자 입력"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        className="flex-1"
                                    />
                                    <Select value={fromUnit} onValueChange={setFromUnit}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {getUnits().map((unit) => (
                                                <SelectItem key={unit} value={unit}>
                                                    {unit}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <Button variant="ghost" size="icon" onClick={handleSwap}>
                                    <ArrowLeftRight className="h-5 w-5" />
                                </Button>
                            </div>

                            <div>
                                <Label htmlFor="to" className="text-base font-semibold">
                                    결과
                                </Label>
                                <div className="flex gap-2 mt-2">
                                    <Input id="to" type="text" value={result !== null ? result.toFixed(4) : ''} readOnly className="flex-1 bg-surface" />
                                    <Select value={toUnit} onValueChange={setToUnit}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {getUnits().map((unit) => (
                                                <SelectItem key={unit} value={unit}>
                                                    {unit}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Button onClick={handleConvert} className="w-full" size="lg">
                                변환하기
                            </Button>
                        </div>

                        <div className="bg-surface rounded-lg p-4 text-sm text-obsidian">
                            <p className="font-semibold mb-2">📊 지원 단위</p>
                            <ul className="space-y-1">
                                <li>
                                    <span className="font-medium">길이:</span> cm, inch, m, ft, km, mile
                                </li>
                                <li>
                                    <span className="font-medium">무게:</span> kg, lb, g, oz
                                </li>
                                <li>
                                    <span className="font-medium">온도:</span> °C, °F, K
                                </li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
