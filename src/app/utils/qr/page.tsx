'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { ArrowLeft, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function QRCodePage() {
    const [text, setText] = useState('');
    const [size, setSize] = useState(256);
    const [includeCharacter, setIncludeCharacter] = useState(true);
    const [qrColor, setQrColor] = useState('#000000');

    const downloadQR = () => {
        const svg = document.getElementById('qr-code');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = size;
        canvas.height = size;

        const qrImg = new Image();

        qrImg.onload = () => {
            // QR 코드 그리기
            ctx?.drawImage(qrImg, 0, 0);

            // 캐릭터 이미지 포함 시
            if (includeCharacter) {
                const characterImg = new Image();
                characterImg.crossOrigin = 'anonymous';

                characterImg.onload = () => {
                    const logoSize = size * 0.2;
                    const logoX = (size - logoSize) / 2;
                    const logoY = (size - logoSize) / 2;

                    // 배경 원 그리기 (선택사항 - 가독성 향상)
                    if (ctx) {
                        ctx.fillStyle = 'white';
                        ctx.beginPath();
                        ctx.arc(size / 2, size / 2, logoSize / 2 + 5, 0, 2 * Math.PI);
                        ctx.fill();
                    }

                    // 캐릭터 이미지 그리기
                    ctx?.drawImage(characterImg, logoX, logoY, logoSize, logoSize);

                    // PNG 다운로드
                    const pngFile = canvas.toDataURL('image/png');
                    const downloadLink = document.createElement('a');
                    downloadLink.download = 'youniqle-qrcode.png';
                    downloadLink.href = pngFile;
                    downloadLink.click();
                };

                characterImg.src = '/character/youniqle-1.png';
            } else {
                // 캐릭터 없이 QR만 다운로드
                const pngFile = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.download = 'qrcode.png';
                downloadLink.href = pngFile;
                downloadLink.click();
            }
        };

        qrImg.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12">
            <div className="container mx-auto px-4 max-w-2xl">
                <Link href="/utils" className="inline-flex items-center text-blue-600 hover:underline mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    돌아가기
                </Link>

                <Card className="shadow-2xl">
                    <CardHeader className="text-center">
                        <div className="text-6xl mb-4">📱</div>
                        <CardTitle className="text-3xl font-bold">QR 코드 생성</CardTitle>
                        <CardDescription className="text-lg">URL이나 텍스트를 QR 코드로 변환하세요</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="text" className="text-base font-semibold">
                                    텍스트 또는 URL
                                </Label>
                                <Textarea
                                    id="text"
                                    placeholder="https://example.com 또는 텍스트 입력"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    className="mt-2 min-h-[100px]"
                                />
                            </div>

                            <div>
                                <Label htmlFor="size" className="text-base font-semibold">
                                    크기: {size}px
                                </Label>
                                <Input
                                    id="size"
                                    type="range"
                                    min="128"
                                    max="512"
                                    step="64"
                                    value={size}
                                    onChange={(e) => setSize(parseInt(e.target.value))}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <Label htmlFor="color" className="text-base font-semibold">
                                    QR 색상
                                </Label>
                                <div className="flex gap-2 mt-2">
                                    <Input
                                        id="color"
                                        type="color"
                                        value={qrColor}
                                        onChange={(e) => setQrColor(e.target.value)}
                                        className="w-20 h-10"
                                    />
                                    <Input
                                        type="text"
                                        value={qrColor}
                                        onChange={(e) => setQrColor(e.target.value)}
                                        placeholder="#000000"
                                        className="flex-1"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="character"
                                    checked={includeCharacter}
                                    onChange={(e) => setIncludeCharacter(e.target.checked)}
                                    className="w-4 h-4"
                                    aria-label="Youniqle 캐릭터 로고 포함"
                                />
                                <Label htmlFor="character" className="text-base font-semibold cursor-pointer">
                                    Youniqle 캐릭터 로고 포함
                                </Label>
                            </div>
                        </div>

                        {text && (
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-8 text-center space-y-4">
                                <div className="bg-white inline-block p-4 rounded-lg shadow-md">
                                    <QRCodeSVG
                                        id="qr-code"
                                        value={text}
                                        size={size}
                                        level="H"
                                        includeMargin
                                        fgColor={qrColor}
                                        imageSettings={
                                            includeCharacter
                                                ? {
                                                    src: '/character/youniqle-1.png',
                                                    x: undefined,
                                                    y: undefined,
                                                    height: size * 0.2,
                                                    width: size * 0.2,
                                                    excavate: true,
                                                }
                                                : undefined
                                        }
                                    />
                                </div>

                                <Button onClick={downloadQR} size="lg" className="w-full">
                                    <Download className="h-5 w-5 mr-2" />
                                    PNG로 다운로드
                                </Button>

                                <div className="bg-white rounded-lg p-4 text-sm text-left">
                                    <p className="text-gray-600 break-all">
                                        <span className="font-semibold">내용:</span> {text}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                            <p className="font-semibold mb-2">💡 사용 팁</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>URL, 이메일, 전화번호, 텍스트 모두 가능</li>
                                <li>캐릭터 로고를 포함하면 브랜드 QR 코드가 됩니다</li>
                                <li>색상을 변경하여 브랜드에 맞게 커스터마이징</li>
                                <li>고품질 PNG 이미지로 저장됩니다</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
