'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Mail } from 'lucide-react';
import CharacterImage from '@/components/ui/CharacterImage';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitted(true);
        // TODO: Implement actual password reset logic
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md relative z-10">
                <Card className="shadow-2xl border-0 rounded-3xl overflow-hidden">
                    <CardHeader className="text-center pb-8 pt-12">
                        <div className="flex justify-center mb-6">
                            <div className="relative w-16 h-16">
                                <CharacterImage
                                    src="/character/youniqle-1.png"
                                    alt="Youniqle 로고"
                                    fill
                                    className="object-contain"
                                    sizes="64px"
                                />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                            비밀번호 찾기
                        </CardTitle>
                        <CardDescription>
                            가입한 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="px-8 pb-12">
                        {!isSubmitted ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                                        이메일 주소
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <Input
                                            id="email"
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="example@email.com"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200"
                                >
                                    재설정 링크 보내기
                                </Button>
                            </form>
                        ) : (
                            <div className="text-center space-y-6">
                                <div className="p-4 bg-green-50 text-green-700 rounded-xl">
                                    <p className="font-medium">이메일이 전송되었습니다!</p>
                                    <p className="text-sm mt-1">메일함을 확인해주세요.</p>
                                </div>
                                <Button
                                    onClick={() => setIsSubmitted(false)}
                                    variant="outline"
                                    className="w-full h-12"
                                >
                                    다시 입력하기
                                </Button>
                            </div>
                        )}

                        <div className="mt-8 text-center">
                            <Link
                                href="/auth/signin"
                                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                로그인 페이지로 돌아가기
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
