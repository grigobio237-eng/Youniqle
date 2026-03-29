'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import PartnerLayout from '@/components/partner/PartnerLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, QrCode, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PartnerScanPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const router = useRouter();

  useEffect(() => {
    // DOM이 완전히 렌더링된 후 스캐너 초기화
    let scanner: Html5QrcodeScanner | null = null;
    
    const initScanner = () => {
      const readerElement = document.getElementById('reader');
      if (!readerElement) {
        // console.error 대신 console.log를 사용하여 Next.js 에러 오버레이 방지
        console.log('Waiting for scanner element...');
        setTimeout(initScanner, 500);
        return;
      }

      try {
        scanner = new Html5QrcodeScanner(
          'reader',
          { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          /* verbose= */ false
        );

        scanner.render(onScanSuccess, onScanFailure);
        scannerRef.current = scanner;
      } catch (err) {
        console.error('Scanner init error:', err);
      }
    };

    initScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => console.error('Failed to clear scanner', error));
      }
    };
  }, []);

  function onScanSuccess(decodedText: string) {
    console.log('Scanned text:', decodedText);
    
    // URL에서 회원 코드 추출
    // 예: http://localhost:3000/member/CODE 또는 /member/CODE
    let code = '';
    if (decodedText.includes('/member/')) {
      code = decodedText.split('/member/')[1]?.split('?')[0];
    } else {
      // 코드가 직접 입력된 경우 (예: TEST123)
      code = decodedText.trim();
    }

    if (code) {
      setScanResult(code);
      // 스캔 성공 시 잠시 후 이동
      // 스캐너를 멈추고 이동
      if (scannerRef.current) {
        scannerRef.current.clear().then(() => {
          router.push(`/member/${code}`);
        }).catch(() => {
          // 클리어 실패해도 이동 시도
          router.push(`/member/${code}`);
        });
      }
    }
  }

  function onScanFailure(error: any) {
    // 매 프레임 스캔 실패 시 발생하는 에러는 로깅하지 않음
  }

  return (
    <PartnerLayout>
      <div className="max-w-2xl mx-auto space-y-6 py-8 px-4">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-slate-100">
            <Link href="/partner/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-black tracking-tight">고객 QR 스캔</h1>
            <p className="text-sm text-text-secondary">오프라인 매장 방문 확인</p>
          </div>
        </div>

        <Card className="border-0 shadow-2xl overflow-hidden bg-white rounded-[32px]">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                  <QrCode className="h-5 w-5 text-primary" />
                  Scanner
                </CardTitle>
                <CardDescription>
                  고객의 인비테이션 QR 코드를 카메라 선 안에 맞춰주세요.
                </CardDescription>
              </div>
              <div className="p-3 bg-primary/10 rounded-2xl">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="relative group">
              <div id="reader" className="w-full overflow-hidden rounded-[24px] border-2 border-dashed border-slate-200 min-h-[300px] bg-slate-50 transition-all group-hover:border-primary/30" />
              
              {/* Overlay for Scanning Area Guide */}
              {!scanResult && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                   <div className="w-64 h-64 border-2 border-primary/20 rounded-3xl" />
                </div>
              )}
            </div>
            
            {scanResult && (
              <div className="mt-8 p-6 bg-green-50 border border-green-100 rounded-[24px] flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="p-3 bg-green-500 rounded-full text-white">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-black text-green-900">QR 코드 인식 완료</p>
                  <p className="text-sm text-green-700">회원 정보를 불러오는 중입니다. 잠시만 기다려주세요...</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="bg-blue-50/50 rounded-[24px] p-6 border border-blue-100/50 text-sm text-blue-900 leading-relaxed shadow-sm">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
               <span className="text-xs font-bold text-blue-600">Tip</span>
            </div>
            <p>
              카메라 접근 권한을 허용해 주세요. 인식이 잘 안 될 경우 고객님의 휴대폰 화면 밝기를 최대화하고 카메라와의 거리를 15~20cm 정도로 유지해 주세요.
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        #reader {
          border: none !important;
        }
        #reader video {
          border-radius: 20px;
          object-fit: cover;
        }
        #reader__dashboard_section_csr button {
          background-color: #3b82f6 !important;
          color: white !important;
          border-radius: 12px !important;
          padding: 8px 16px !important;
          font-weight: bold !important;
          border: none !important;
          cursor: pointer !important;
          margin-top: 10px !important;
        }
        #reader__dashboard_section_csr span {
           font-size: 14px !important;
           color: #64748b !important;
        }
        #reader select {
          padding: 8px !important;
          border-radius: 12px !important;
          border: 1px solid #e2e8f0 !important;
          margin-top: 10px !important;
          outline: none !important;
        }
      `}</style>
    </PartnerLayout>
  );
}
