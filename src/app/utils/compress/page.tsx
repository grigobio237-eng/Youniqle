'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { ArrowLeft, Upload, Download, RefreshCw } from 'lucide-react';
import Image from 'next/image';

type ImageFormat = 'jpeg' | 'png' | 'webp';

export default function ImageConverterPage() {
    const [originalImage, setOriginalImage] = useState<File | null>(null);
    const [convertedImage, setConvertedImage] = useState<string | null>(null);
    const [originalFormat, setOriginalFormat] = useState<string>('');
    const [targetFormat, setTargetFormat] = useState<ImageFormat>('png');
    const [originalSize, setOriginalSize] = useState(0);
    const [convertedSize, setConvertedSize] = useState(0);
    const [loading, setLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setOriginalImage(file);
            setOriginalSize(file.size);
            setOriginalFormat(file.type.split('/')[1].toUpperCase());
            setConvertedImage(null);

            // 미리보기
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewUrl(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleConvert = async () => {
        if (!originalImage) return;

        setLoading(true);

        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;

                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0);

                    // 포맷 변환
                    let mimeType = 'image/png';
                    let quality = 0.95;

                    if (targetFormat === 'jpeg') {
                        mimeType = 'image/jpeg';
                    } else if (targetFormat === 'webp') {
                        mimeType = 'image/webp';
                    }

                    const convertedDataUrl = canvas.toDataURL(mimeType, quality);
                    setConvertedImage(convertedDataUrl);

                    // 변환된 파일 크기 계산
                    const base64Length = convertedDataUrl.split(',')[1].length;
                    const sizeInBytes = (base64Length * 3) / 4;
                    setConvertedSize(sizeInBytes);

                    setLoading(false);
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(originalImage);
        } catch (error) {
            console.error('변환 오류:', error);
            setLoading(false);
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const getFormatIcon = (format: string) => {
        switch (format.toLowerCase()) {
            case 'jpeg':
            case 'jpg':
                return '🖼️';
            case 'png':
                return '🎨';
            case 'webp':
                return '🎭';
            default:
                return '📷';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <Link href="/utils" className="inline-flex items-center text-blue-600 hover:underline mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    돌아가기
                </Link>

                <Card className="shadow-2xl">
                    <CardHeader className="text-center">
                        <div className="mb-4 text-xl">🔄</div>
                        <CardTitle className="text-3xl font-bold">이미지 포맷 변환</CardTitle>
                        <CardDescription className="text-lg">JPG, PNG, WEBP 간 자유롭게 변환하세요</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="upload" className="text-base font-semibold">
                                    이미지 업로드
                                </Label>
                                <div className="mt-2">
                                    <label
                                        htmlFor="upload"
                                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                                    >
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-10 h-10 mb-3 text-gray-400" />
                                            <p className="mb-2 text-sm text-gray-500">
                                                <span className="font-semibold">클릭하여 업로드</span> 또는 드래그 앤 드롭
                                            </p>
                                            <p className="text-xs text-gray-500">JPG, PNG, WEBP (최대 10MB)</p>
                                        </div>
                                        <input id="upload" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                    </label>
                                </div>
                            </div>

                            {originalImage && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-base font-semibold">원본 포맷</Label>
                                            <div className="mt-2 bg-gray-50 rounded-lg p-3 text-center">
                                                <span className="text-2xl mr-2">{getFormatIcon(originalFormat)}</span>
                                                <span className="text-lg font-bold">{originalFormat}</span>
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="text-base font-semibold">변환할 포맷</Label>
                                            <Select value={targetFormat} onValueChange={(value) => setTargetFormat(value as ImageFormat)}>
                                                <SelectTrigger className="mt-2">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="jpeg">🖼️ JPEG</SelectItem>
                                                    <SelectItem value="png">🎨 PNG</SelectItem>
                                                    <SelectItem value="webp">🎭 WEBP</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {previewUrl && (
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <Label className="text-base font-semibold mb-2 block">미리보기</Label>
                                            <Image width={800} height={800} style={{ width: '100%', height: '100%', objectFit: 'inherit' }} unoptimized src={previewUrl} alt="Preview" className="max-w-full max-h-64 mx-auto rounded-lg" />
                                        </div>
                                    )}

                                    <Button onClick={handleConvert} disabled={loading} className="w-full" size="lg">
                                        {loading ? (
                                            <>
                                                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                                                변환 중...
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCw className="h-5 w-5 mr-2" />
                                                {targetFormat.toUpperCase()}로 변환하기
                                            </>
                                        )}
                                    </Button>
                                </>
                            )}
                        </div>

                        {convertedImage && (
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 space-y-4">
                                <h3 className="text-lg font-bold text-center">✅ 변환 완료!</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white rounded-lg p-4 text-center">
                                        <p className="text-sm text-gray-600 mb-2">원본 크기</p>
                                        <p className="font-bold text-gray-900 text-xl">{formatSize(originalSize)}</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 text-center">
                                        <p className="text-sm text-gray-600 mb-2">변환 후</p>
                                        <p className="font-bold text-blue-600 text-xl">{formatSize(convertedSize)}</p>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg p-4 text-center">
                                    <p className="text-sm text-gray-600 mb-2">포맷</p>
                                    <p className="text-2xl font-bold">
                                        {getFormatIcon(originalFormat)} {originalFormat} → {getFormatIcon(targetFormat)} {targetFormat.toUpperCase()}
                                    </p>
                                </div>

                                <a href={convertedImage} download={`converted-image.${targetFormat}`}>
                                    <Button className="w-full" size="lg">
                                        <Download className="h-5 w-5 mr-2" />
                                        {targetFormat.toUpperCase()} 파일 다운로드
                                    </Button>
                                </a>
                            </div>
                        )}

                        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                            <p className="font-semibold mb-2">💡 사용 팁</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>
                                    <span className="font-medium">JPEG:</span> 사진에 최적, 파일 작음
                                </li>
                                <li>
                                    <span className="font-medium">PNG:</span> 투명 배경 지원, 무손실
                                </li>
                                <li>
                                    <span className="font-medium">WEBP:</span> 최신 포맷, 고품질 + 작은 용량
                                </li>
                                <li>원본 해상도 유지됩니다</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
