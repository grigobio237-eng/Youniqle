'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { ArrowLeft, ArrowLeftRight, RefreshCw } from 'lucide-react';

interface ExchangeRates {
    [key: string]: number;
}

const currencies = [
    { code: 'USD', name: '미국 달러', symbol: '$' },
    { code: 'EUR', name: '유로', symbol: '€' },
    { code: 'JPY', name: '일본 엔', symbol: '¥' },
    { code: 'GBP', name: '영국 파운드', symbol: '£' },
    { code: 'KRW', name: '한국 원', symbol: '₩' },
    { code: 'CNY', name: '중국 위안', symbol: '¥' },
];

export default function CurrencyPage() {
    const [amount, setAmount] = useState('1');
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('KRW');
    const [result, setResult] = useState<number | null>(null);
    const [rates, setRates] = useState<ExchangeRates>({});
    const [loading, setLoading] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

    const fetchRates = async () => {
        setLoading(true);
        try {
            // 무료 API 사용 (ExchangeRate-API)
            const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
            const data = await response.json();
            setRates(data.rates);
            setLastUpdate(new Date());
        } catch (error) {
            console.error('환율 정보 가져오기 실패:', error);
            // 폴백: 하드코딩된 환율
            setRates({
                USD: 1,
                EUR: 0.85,
                JPY: 110,
                GBP: 0.73,
                KRW: 1300,
                CNY: 6.5,
            });
            setLastUpdate(new Date());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRates();
    }, [fromCurrency]);

    const handleConvert = () => {
        const inputAmount = parseFloat(amount);
        if (isNaN(inputAmount) || !rates[toCurrency]) return;

        const converted = inputAmount * rates[toCurrency];
        setResult(converted);
    };

    const handleSwap = () => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
        if (result !== null) {
            setAmount(result.toFixed(2));
            setResult(parseFloat(amount));
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-12">
            <div className="container mx-auto px-4 max-w-2xl">
                <Link href="/utils" className="inline-flex items-center text-blue-600 hover:underline mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    돌아가기
                </Link>

                <Card className="shadow-2xl">
                    <CardHeader className="text-center">
                        <div className="text-6xl mb-4">💱</div>
                        <CardTitle className="text-3xl font-bold">환율 계산기</CardTitle>
                        <CardDescription className="text-lg">실시간 환율로 통화를 변환하세요</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-600">
                                {lastUpdate && `마지막 업데이트: ${lastUpdate.toLocaleTimeString('ko-KR')}`}
                            </p>
                            <Button variant="ghost" size="sm" onClick={fetchRates} disabled={loading}>
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="amount" className="text-base font-semibold">
                                    금액
                                </Label>
                                <div className="flex gap-2 mt-2">
                                    <Input
                                        id="amount"
                                        type="number"
                                        placeholder="금액 입력"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="flex-1"
                                    />
                                    <Select value={fromCurrency} onValueChange={setFromCurrency}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {currencies.map((curr) => (
                                                <SelectItem key={curr.code} value={curr.code}>
                                                    {curr.symbol} {curr.code}
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
                                <Label className="text-base font-semibold">변환 결과</Label>
                                <div className="flex gap-2 mt-2">
                                    <Input type="text" value={result !== null ? result.toFixed(2) : ''} readOnly className="flex-1 bg-gray-50 text-lg font-bold" />
                                    <Select value={toCurrency} onValueChange={setToCurrency}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {currencies.map((curr) => (
                                                <SelectItem key={curr.code} value={curr.code}>
                                                    {curr.symbol} {curr.code}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Button onClick={handleConvert} className="w-full" size="lg" disabled={loading}>
                                {loading ? '로딩 중...' : '변환하기'}
                            </Button>
                        </div>

                        {result !== null && (
                            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-6 text-center">
                                <p className="text-2xl font-bold text-gray-900">
                                    {amount} {fromCurrency} = {result.toFixed(2)} {toCurrency}
                                </p>
                                <p className="text-sm text-gray-600 mt-2">
                                    환율: 1 {fromCurrency} = {rates[toCurrency]?.toFixed(4)} {toCurrency}
                                </p>
                            </div>
                        )}

                        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                            <p className="font-semibold mb-2">💡 지원 통화</p>
                            <div className="grid grid-cols-2 gap-2">
                                {currencies.map((curr) => (
                                    <div key={curr.code}>
                                        {curr.symbol} {curr.name} ({curr.code})
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
