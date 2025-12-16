'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Users, DollarSign, Copy, Check } from 'lucide-react';

interface ReferralStats {
    referralCount: number;
    totalEarned: number;
    referrals: Array<{
        id: string;
        name: string;
        email: string;
        grade: string;
        joinedAt: string;
    }>;
}

export default function ReferralSection({ referralCode }: { referralCode?: string }) {
    const [stats, setStats] = useState<ReferralStats>({ referralCount: 0, totalEarned: 0, referrals: [] });
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/me/referrals');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const copyLink = () => {
        if (!referralCode) return;
        const link = `${window.location.origin}/auth/signup?ref=${referralCode}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card className="shadow-lg mt-6">
            <CardHeader>
                <CardTitle className="text-lg flex items-center text-indigo-700">
                    <User className="h-5 w-5 mr-2" />
                    친구 초대 혜택
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* 새로운 안내 문구 */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-5 rounded-xl border border-indigo-100">
                    <h4 className="font-bold text-indigo-900 mb-2 text-lg">친구 초대하고 최대 3% 적립받기!</h4>
                    <p className="text-sm text-indigo-700 mb-4 leading-relaxed">
                        나의 초대로 가입한 친구가 구매하면 <b>구매 금액의 2%</b>가 적립되고,<br />
                        친구가 초대한 사람이 구매하면 <b>1%</b>가 나에게 추가 적립됩니다!
                    </p>

                    <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-indigo-200">
                        <div className="flex-1 px-2 text-xs text-gray-500 truncate">
                            {typeof window !== 'undefined' ? `${window.location.origin}/auth/signup?ref=${referralCode || '...'}` : '...'}
                        </div>
                        <Button
                            size="sm"
                            onClick={copyLink}
                            className={copied ? "bg-green-600 hover:bg-green-700" : "bg-indigo-600 hover:bg-indigo-700"}
                        >
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            <span className="ml-2">{copied ? '복사됨' : '복사'}</span>
                        </Button>
                    </div>
                </div>

                {/* 모니터링 대시보드 */}
                <div>
                    <h5 className="font-semibold text-gray-800 mb-4 flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        나의 초대 현황
                    </h5>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                            <div className="text-gray-500 text-xs mb-1">총 초대한 친구</div>
                            <div className="text-xl font-bold text-gray-900">{stats.referralCount}명</div>
                        </div>
                        <div className="bg-indigo-50 p-4 rounded-lg text-center">
                            <div className="text-indigo-600 text-xs mb-1">누적 초대 보상</div>
                            <div className="text-xl font-bold text-indigo-700">{stats.totalEarned.toLocaleString()}P</div>
                        </div>
                    </div>

                    {/* 친구 목록 (접기/펼치기 UI가 좋겠지만 일단 리스트로) */}
                    {stats.referrals.length > 0 ? (
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 font-medium">
                                    <tr>
                                        <th className="px-4 py-3">친구</th>
                                        <th className="px-4 py-3">가입일</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {stats.referrals.slice(0, 5).map((ref) => (
                                        <tr key={ref.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-900">{ref.name}</div>
                                                <div className="text-xs text-gray-500">{ref.email}</div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500">
                                                {new Date(ref.joinedAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {stats.referrals.length > 5 && (
                                <div className="p-2 text-center text-xs text-gray-500 bg-gray-50 border-t">
                                    최근 5명만 표시됩니다.
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg text-sm">
                            아직 초대한 친구가 없습니다.<br />
                            링크를 공유해서 혜택을 받아보세요!
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
