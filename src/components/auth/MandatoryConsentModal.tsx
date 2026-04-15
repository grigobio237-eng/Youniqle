'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CONSENT_TEXTS } from '@/constants/consents';
import CharacterImage from '@/components/ui/CharacterImage';

export default function MandatoryConsentModal() {
  const { data: session, update: updateSession } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    termsAccepted: false,
    privacyAccepted: false,
    sensitiveInfoAccepted: false,
    thirdPartyAccepted: false,
    marketingConsent: false,
  });

  useEffect(() => {
    if (session?.user) {
      const user = session.user as any;
      // 필수 항목 중 하나라도 누락된 경우 모달 표시
      const isMissingConsent = 
        !user.termsAcceptedAt || 
        !user.privacyAcceptedAt || 
        !user.sensitiveInfoAcceptedAt || 
        !user.thirdPartyAcceptedAt;
      
      if (isMissingConsent) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    }
  }, [session]);

  const allMandatoryAccepted = 
    formData.termsAccepted && 
    formData.privacyAccepted && 
    formData.sensitiveInfoAccepted && 
    formData.thirdPartyAccepted;

  const handleAgreeAll = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      termsAccepted: checked,
      privacyAccepted: checked,
      sensitiveInfoAccepted: checked,
      thirdPartyAccepted: checked,
      marketingConsent: checked,
    }));
  };

  const handleSubmit = async () => {
    if (!allMandatoryAccepted) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/auth/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // 세션 업데이트 (브라우저 사이드에서 세션 정보를 최신화하여 모달을 닫음)
        await updateSession();
        setIsOpen(false);
      } else {
        const error = await response.json();
        alert(error.error || '동의 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Consent submission error:', error);
      alert('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-md rounded-[32px] p-0 overflow-hidden border-none bg-surface shadow-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="bg-primary p-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative w-16 h-16 bg-white/20 rounded-full p-2">
              <CharacterImage
                src="/character/youniqle-1.png"
                alt="Youniqle"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-white tracking-tight">
              서비스 이용 약관 개정 안내
            </DialogTitle>
          </DialogHeader>
          <p className="text-white/80 text-sm font-medium leading-relaxed">
            더 나은 서비스 제공을 위해 이용약관 및 개인정보 처리방침이 개정되었습니다. <br/>
            계속해서 서비스를 이용하시려면 아래 필수 항목에 동의해 주세요.
          </p>
        </div>

        <div className="p-8 space-y-6">
          <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
            <div className="flex items-center space-x-2">
              <input
                id="modalAgreeAll"
                type="checkbox"
                aria-label="전체 동의"
                checked={allMandatoryAccepted && formData.marketingConsent}
                onChange={(e) => handleAgreeAll(e.target.checked)}
                className="h-5 w-5 rounded-md border-primary text-primary focus:ring-primary cursor-pointer"
              />
              <Label htmlFor="modalAgreeAll" className="text-sm font-bold text-text-primary cursor-pointer">
                전체 동의하기
              </Label>
            </div>
          </div>

          <div className="space-y-3">
            <ConsentRow 
              id="m-terms" 
              label="서비스 이용약관 동의 (필수)" 
              checked={formData.termsAccepted}
              onChange={() => setFormData(p => ({ ...p, termsAccepted: !p.termsAccepted }))}
              content={CONSENT_TEXTS.terms}
            />
            <ConsentRow 
              id="m-privacy" 
              label="개인정보 처리방침 동의 (필수)" 
              checked={formData.privacyAccepted}
              onChange={() => setFormData(p => ({ ...p, privacyAccepted: !p.privacyAccepted }))}
              content={CONSENT_TEXTS.privacy}
            />
            <ConsentRow 
              id="m-sensitive" 
              label="민감정보 수집 및 이용 동의 (필수)" 
              checked={formData.sensitiveInfoAccepted}
              onChange={() => setFormData(p => ({ ...p, sensitiveInfoAccepted: !p.sensitiveInfoAccepted }))}
              content={CONSENT_TEXTS.sensitive}
            />
            <ConsentRow 
              id="m-thirdParty" 
              label="개인정보 제3자 제공 동의 (필수)" 
              checked={formData.thirdPartyAccepted}
              onChange={() => setFormData(p => ({ ...p, thirdPartyAccepted: !p.thirdPartyAccepted }))}
              content={CONSENT_TEXTS.thirdParty}
            />
            <div className="flex justify-start px-1">
              <div className="flex items-center space-x-2">
                <input
                  id="m-marketing"
                  type="checkbox"
                  aria-label="마케팅 정보 수신 동의"
                  checked={formData.marketingConsent}
                  onChange={() => setFormData(p => ({ ...p, marketingConsent: !p.marketingConsent }))}
                  className="h-4 w-4 rounded border-line text-primary focus:ring-primary cursor-pointer"
                />
                <Label htmlFor="m-marketing" className="text-xs font-medium text-text-secondary cursor-pointer">
                  마케팅 정보 수신 동의 (선택)
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              onClick={handleSubmit}
              disabled={!allMandatoryAccepted || loading}
              className="w-full h-14 bg-primary hover:bg-primary/90 text-background font-black text-lg rounded-2xl shadow-xl transition-all"
            >
              {loading ? '처리 중...' : '동의하고 계속하기'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ConsentRow({ id, label, checked, onChange, content }: any) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center space-x-2">
        <input
          id={id}
          type="checkbox"
          aria-label={label}
          checked={checked}
          onChange={onChange}
          className="h-4 w-4 rounded border-line text-primary focus:ring-primary cursor-pointer"
        />
        <Label htmlFor={id} className="text-sm font-medium text-text-secondary cursor-pointer">
          {label}
        </Label>
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <button className="text-xs font-bold text-primary hover:underline">상세보기</button>
        </DialogTrigger>
        <DialogContent className="max-w-lg rounded-3xl p-0 overflow-hidden bg-surface max-h-[70vh] flex flex-col border-none">
          <DialogHeader className="p-6 bg-primary text-white">
            <DialogTitle className="text-xl font-black">{label}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6 text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
            {content}
          </div>
          <div className="p-6 border-t border-line bg-background/50">
            <Button className="w-full h-12 bg-primary rounded-xl font-bold" onClick={(e: any) => {
              // Trigger the outer checkbox
              onChange();
              // Close this details dialog
              const closeButton = e.currentTarget.closest('[role="dialog"]')?.querySelector('button[aria-label="Close"]');
              if (closeButton instanceof HTMLElement) closeButton.click();
            }}>
              확인
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
