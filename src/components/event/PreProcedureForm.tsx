"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function PreProcedureForm() {
  const router = useRouter();
  const { addToast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1
    changeScale: "",
    downtime: "",
    hasImportantEvent: false,
    importantEventDetails: "",

    // Step 2
    hasPastExperience: false,
    pastExperienceDetails: "",
    isTakingMedication: false,
    medicationDetails: "",
    hasHealthIssue: false,
    healthIssueDetails: "",

    // Step 3
    anxietyPoints: [] as string[],
    privacyDetails: "",

    // Step 4
    hasCompanion: false,
    companionDetails: "",
    needsTransportation: false,
    transportationDetails: "",
    wantsPrivacyRoute: false,
    privacyRouteDetails: "",

    // Step 5
    budgetRange: "",
    customBudget: "",
    needsDedicatedManager: false,
    needsPremiumKit: false,
  });

  const handleAnxietyChange = (point: string) => {
    setFormData((prev) => ({
      ...prev,
      anxietyPoints: prev.anxietyPoints.includes(point)
        ? prev.anxietyPoints.filter((p) => p !== point)
        : [...prev.anxietyPoints, point],
    }));
  };

  const calculateType = () => {
    // 회복 유형 분류 로직 (간단한 예시)
    if (formData.wantsPrivacyRoute || formData.anxietyPoints.includes('privacy')) return '프라이버시 보호형';
    if (formData.downtime === '1d' || formData.downtime === '3d') return '빠른 복귀형';
    if (formData.budgetRange === 'large' || formData.needsDedicatedManager) return '프리미엄 집중케어형';
    return '스탠다드 맞춤형';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        expectation: {
          changeScale: formData.changeScale,
          downtime: formData.downtime,
          importantEvent: {
            hasEvent: formData.hasImportantEvent,
            details: formData.importantEventDetails,
          }
        },
        medicalHistory: {
          pastExperience: {
            hasExperience: formData.hasPastExperience,
            details: formData.pastExperienceDetails,
          },
          currentMedication: {
            taking: formData.isTakingMedication,
            details: formData.medicationDetails,
          },
          healthStatus: {
            isIssue: formData.hasHealthIssue,
            details: formData.healthIssueDetails,
          }
        },
        anxiety: {
          points: formData.anxietyPoints,
          privacyDetails: formData.privacyDetails,
          classifiedType: calculateType(),
        },
        visitPlan: {
          companion: {
            hasCompanion: formData.hasCompanion,
            details: formData.companionDetails,
          },
          transportation: {
            needsHelp: formData.needsTransportation,
            details: formData.transportationDetails,
          },
          privacyRoute: {
            wantsPrivacy: formData.wantsPrivacyRoute,
            details: formData.privacyRouteDetails,
          }
        },
        investment: {
          budgetRange: formData.budgetRange,
          customBudget: formData.customBudget,
          focusServices: {
            needsDedicatedManager: formData.needsDedicatedManager,
            needsPremiumKit: formData.needsPremiumKit,
          }
        }
      };

      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("문진표 제출에 실패했습니다.");
      
      const data = await res.json();

      addToast({
        title: "문진표 제출 완료",
        description: "회복 설계사(네비게이터)가 내용을 검토 중입니다.",
        variant: "success",
      });

      // 리포트 페이지로 이동
      router.push(`/event/consultation/report/${data.consultationId}`);
    } catch (err) {
      addToast({
        title: "오류",
        description: "문진표 제출 중 문제가 발생했습니다. (로그인 상태를 확인해주세요)",
        variant: "error",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <Card className="border-none shadow-2xl bg-surface/80 backdrop-blur-xl rounded-[32px] overflow-hidden">
        <div className="h-2 bg-primary w-full transition-all duration-500" style={{ width: `${(step / 5) * 100}%` }} />
        <CardHeader className="pt-10 pb-6 text-center">
          <CardTitle className="text-3xl font-black tracking-tight mb-2 italic">Recovery Design</CardTitle>
          <CardDescription className="text-lg font-medium text-text-secondary">
            더 정밀한 회복 설계를 위해 당신의 이야기를 들려주세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-10">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-8 px-2 sm:px-6">
            
            {/* STEP 1: 기대치 */}
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-black text-primary mb-2">당신은 어떤 회복을 꿈꾸나요?</h3>
                  <p className="text-text-secondary">기대하는 변화와 목표를 알려주세요.</p>
                </div>

                <div className="space-y-4">
                  <Label className="text-xl font-bold">1. 원하는 변화의 크기</Label>
                  <RadioGroup 
                    onValueChange={(v) => setFormData({...formData, changeScale: v})}
                    value={formData.changeScale}
                    className="grid grid-cols-1 gap-3"
                  >
                    {[
                      { id: "v-small", label: "자연스럽고 미세한 변화 (티 나지 않게)", value: "자연스러운 변화" },
                      { id: "v-mid", label: "적당히 티가 나는 세련된 변화", value: "세련된 변화" },
                      { id: "v-large", label: "확실하고 드라마틱한 변화", value: "드라마틱한 변화" },
                    ].map((opt) => (
                      <div key={opt.id} className={`flex items-center space-x-3 p-4 border rounded-2xl cursor-pointer transition-colors ${formData.changeScale === opt.value ? 'bg-primary/10 border-primary' : 'border-line hover:bg-primary/5'}`}>
                        <RadioGroupItem value={opt.value} id={opt.id} />
                        <Label htmlFor={opt.id} className="flex-1 cursor-pointer font-semibold">{opt.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <Label className="text-xl font-bold">2. 일상 복귀 목표</Label>
                  <p className="text-sm text-text-secondary">시술 후 며칠 뒤에 다시 출근하거나 친구들을 만나야 하나요?</p>
                  <RadioGroup 
                    onValueChange={(v) => setFormData({...formData, downtime: v})}
                    value={formData.downtime}
                    className="grid grid-cols-2 gap-3"
                  >
                    {[
                      { id: "d-1", label: "1일 (바로 일상 복귀)", value: "1일" },
                      { id: "d-3", label: "3일 (주말 활용)", value: "3일" },
                      { id: "d-7", label: "7일 (충분한 휴식)", value: "7일" },
                      { id: "d-14", label: "14일 이상 (완벽한 회복)", value: "14일 이상" },
                    ].map((opt) => (
                      <div key={opt.id} className={`col-span-2 sm:col-span-1 flex items-center space-x-3 p-4 border rounded-2xl cursor-pointer transition-colors ${formData.downtime === opt.value ? 'bg-primary/10 border-primary' : 'border-line hover:bg-primary/5'}`}>
                        <RadioGroupItem value={opt.value} id={opt.id} />
                        <Label htmlFor={opt.id} className="flex-1 cursor-pointer font-semibold">{opt.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <Label className="text-xl font-bold">3. 중요한 약속 여부</Label>
                  <p className="text-sm text-text-secondary">시술 후 এক 달 안에 결혼식이나 사진 촬영처럼 꼭 예뻐야 하는 날이 있나요?</p>
                  <RadioGroup 
                    onValueChange={(v) => setFormData({...formData, hasImportantEvent: v === 'true'})}
                    value={formData.hasImportantEvent ? 'true' : 'false'}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="e-yes" />
                      <Label htmlFor="e-yes" className="font-semibold text-lg">네, 있습니다</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="e-no" />
                      <Label htmlFor="e-no" className="font-semibold text-lg">아니오</Label>
                    </div>
                  </RadioGroup>

                  {formData.hasImportantEvent && (
                    <div className="animate-in fade-in slide-in-from-top-2 pt-2">
                      <Label htmlFor="e-details" className="text-sm font-semibold text-primary mb-2 block">어떤 중요한 약속인가요? (일정 및 내용)</Label>
                      <Textarea 
                        id="e-details"
                        placeholder="예: 3주 뒤 웨딩 촬영이 있습니다."
                        className="rounded-xl min-h-[100px]"
                        value={formData.importantEventDetails}
                        onChange={(e) => setFormData({...formData, importantEventDetails: e.target.value})}
                      />
                    </div>
                  )}
                </div>
                
                <Button 
                  type="button" 
                  onClick={() => setStep(2)} 
                  disabled={!formData.changeScale || !formData.downtime || (formData.hasImportantEvent && !formData.importantEventDetails)}
                  className="w-full h-14 rounded-2xl text-lg font-bold bg-primary hover:bg-primary/90 transition-all"
                >
                  다음 단계로 (1/5)
                </Button>
              </div>
            )}

            {/* STEP 2: 과거 경험과 안전 */}
            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                 <div className="text-center mb-6">
                  <h3 className="text-2xl font-black text-primary mb-2">몸의 소리에 귀를 기울여요</h3>
                  <p className="text-text-secondary">과거 경험과 현재 상태를 통해 안전한 시술을 준비합니다.</p>
                </div>

                <div className="space-y-4">
                  <Label className="text-xl font-bold">1. 비슷한 경험 여부</Label>
                  <p className="text-sm text-text-secondary">예전에 줄기세포나 다른 비슷한 시술을 받아본 적이 있나요?</p>
                  <RadioGroup 
                    onValueChange={(v) => setFormData({...formData, hasPastExperience: v === 'true'})}
                    value={formData.hasPastExperience ? 'true' : 'false'}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="p-yes" />
                      <Label htmlFor="p-yes" className="font-semibold text-lg">네, 있습니다</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="p-no" />
                      <Label htmlFor="p-no" className="font-semibold text-lg">아니오, 처음입니다</Label>
                    </div>
                  </RadioGroup>

                  {formData.hasPastExperience && (
                    <div className="animate-in fade-in pt-2">
                      <Label htmlFor="p-details" className="text-sm font-semibold text-primary block mb-2">어떤 시술이었고 언제 받으셨나요?</Label>
                      <Textarea 
                        id="p-details"
                        placeholder="예: 작년에 줄기세포 주사를 맞았습니다."
                        className="rounded-xl min-h-[100px]"
                        value={formData.pastExperienceDetails}
                        onChange={(e) => setFormData({...formData, pastExperienceDetails: e.target.value})}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <Label className="text-xl font-bold">2. 복용 중인 약품 확인</Label>
                  <p className="text-sm text-text-secondary">혹시 피를 멈추지 않게 하는 약(아스피린 등)이나 과도한 비타민을 드시고 있나요?</p>
                  <RadioGroup 
                    onValueChange={(v) => setFormData({...formData, isTakingMedication: v === 'true'})}
                    value={formData.isTakingMedication ? 'true' : 'false'}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="m-yes" />
                      <Label htmlFor="m-yes" className="font-semibold text-lg">네, 있습니다</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="m-no" />
                      <Label htmlFor="m-no" className="font-semibold text-lg">아니오</Label>
                    </div>
                  </RadioGroup>

                  {formData.isTakingMedication && (
                    <div className="animate-in fade-in pt-2">
                      <Label htmlFor="m-details" className="text-sm font-semibold text-primary block mb-2">드시고 계신 약물이나 영양제의 이름을 모두 적어주세요.</Label>
                      <Textarea 
                        id="m-details"
                        placeholder="예: 아스피린, 오메가3, 비타민E 매일 복용중"
                        className="rounded-xl min-h-[100px]"
                        value={formData.medicationDetails}
                        onChange={(e) => setFormData({...formData, medicationDetails: e.target.value})}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <Label className="text-xl font-bold">3. 최근 건강 상태</Label>
                  <p className="text-sm text-text-secondary">최근 수면 부족, 과도한 스트레스 등 특별한 컨디션 저하가 있었나요?</p>
                  <RadioGroup 
                    onValueChange={(v) => setFormData({...formData, hasHealthIssue: v === 'true'})}
                    value={formData.hasHealthIssue ? 'true' : 'false'}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="h-yes" />
                      <Label htmlFor="h-yes" className="font-semibold text-lg">네</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="h-no" />
                      <Label htmlFor="h-no" className="font-semibold text-lg">아니오, 좋습니다</Label>
                    </div>
                  </RadioGroup>

                  {formData.hasHealthIssue && (
                    <div className="animate-in fade-in pt-2">
                      <Label htmlFor="h-details" className="text-sm font-semibold text-primary block mb-2">어떤 불편함이 있으신가요?</Label>
                      <Textarea 
                        id="h-details"
                        placeholder="예: 요새 업무 스트레스로 불면증이 며칠째 지속되고 있습니다."
                        className="rounded-xl min-h-[100px]"
                        value={formData.healthIssueDetails}
                        onChange={(e) => setFormData({...formData, healthIssueDetails: e.target.value})}
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1 h-14 rounded-2xl font-bold">이전</Button>
                  <Button 
                    type="button" 
                    onClick={() => setStep(3)} 
                    disabled={
                      (formData.hasPastExperience && !formData.pastExperienceDetails) ||
                      (formData.isTakingMedication && !formData.medicationDetails) ||
                      (formData.hasHealthIssue && !formData.healthIssueDetails)
                    }
                    className="flex-[2] h-14 rounded-2xl text-lg font-bold bg-primary"
                  >
                    다음 단계로 (2/5)
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: 불안 체크 */}
            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-black text-primary mb-2">무엇이 가장 걱정되시나요?</h3>
                  <p className="text-text-secondary">불안한 점을 미리 파악해 세심하게 케어해 드립니다.</p>
                </div>

                <div className="space-y-4">
                  <Label className="text-xl font-bold">시술과 관련하여 제일 무서운 부분을 선택해주세요. (복수 선택)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "a-pain", label: "통증", value: "통증" },
                      { id: "a-swelling", label: "붓기 및 멍", value: "붓기/멍" },
                      { id: "a-scar", label: "흉터", value: "흉터" },
                      { id: "a-privacy", label: "남들의 시선(프라이버시)", value: "프라이버시" },
                    ].map((opt) => (
                      <div key={opt.id} className={`flex items-center space-x-3 p-4 border rounded-2xl cursor-pointer transition-colors ${formData.anxietyPoints.includes(opt.value) ? 'bg-primary/10 border-primary' : 'border-line hover:bg-primary/5'}`}>
                        <Checkbox 
                          id={opt.id} 
                          checked={formData.anxietyPoints.includes(opt.value)}
                          onCheckedChange={() => handleAnxietyChange(opt.value)}
                        />
                        <Label htmlFor={opt.id} className="flex-1 cursor-pointer font-semibold">{opt.label}</Label>
                      </div>
                    ))}
                  </div>

                  {formData.anxietyPoints.includes("프라이버시") && (
                    <div className="animate-in fade-in pt-4">
                      <Label htmlFor="a-privacy-details" className="text-sm font-semibold text-primary block mb-2">프라이버시에 대해 특별히 신경써야 할 부분이 있다면 알려주세요.</Label>
                      <Textarea 
                        id="a-privacy-details"
                        placeholder="예: 회사 사람들에게 절대 알려지면 안 됩니다."
                        className="rounded-xl min-h-[100px]"
                        value={formData.privacyDetails}
                        onChange={(e) => setFormData({...formData, privacyDetails: e.target.value})}
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-6">
                  <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1 h-14 rounded-2xl font-bold">이전</Button>
                  <Button 
                    type="button" 
                    onClick={() => setStep(4)} 
                    disabled={formData.anxietyPoints.length === 0 || (formData.anxietyPoints.includes("프라이버시") && !formData.privacyDetails)}
                    className="flex-[2] h-14 rounded-2xl text-lg font-bold bg-primary"
                  >
                    다음 단계로 (3/5)
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: 방문 환경 */}
             {step === 4 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-black text-primary mb-2">병원에 오시는 길을 도와드릴게요</h3>
                  <p className="text-text-secondary">VIP 맞춤 환경을 위해 이동 경로와 동반자를 파악합니다.</p>
                </div>

                <div className="space-y-4">
                  <Label className="text-xl font-bold">1. 방문 시 보호자 동행 유무</Label>
                  <p className="text-sm text-text-secondary">혼자 오시나요, 아니면 보호자와 함께 오시나요?</p>
                  <RadioGroup 
                    onValueChange={(v) => setFormData({...formData, hasCompanion: v === 'true'})}
                    value={formData.hasCompanion ? 'true' : 'false'}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="c-alone" />
                      <Label htmlFor="c-alone" className="font-semibold text-lg cursor-pointer">혼자 방문</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="c-with" />
                      <Label htmlFor="c-with" className="font-semibold text-lg cursor-pointer">보호자와 동반</Label>
                    </div>
                  </RadioGroup>

                  {formData.hasCompanion && (
                    <div className="animate-in fade-in pt-2">
                      <Label htmlFor="c-details" className="text-sm font-semibold text-primary block mb-2">보호자분과의 관계나 특별한 요청사항이 있으신가요?</Label>
                      <Textarea 
                        id="c-details"
                        placeholder="예: 남편과 함께 갑니다. 보호자 대기실이 편안했으면 좋겠습니다."
                        className="rounded-xl min-h-[100px]"
                        value={formData.companionDetails}
                        onChange={(e) => setFormData({...formData, companionDetails: e.target.value})}
                      />
                    </div>
                  )}
                </div>

                 <div className="space-y-4">
                  <Label className="text-xl font-bold">2. 교통편 및 숙소</Label>
                  <p className="text-sm text-text-secondary">멀리서 오신다면 숙소나 모범택시(차량) 예약 등 특별한 교통편 편의가 필요하신가요?</p>
                  <RadioGroup 
                     onValueChange={(v) => setFormData({...formData, needsTransportation: v === 'true'})}
                     value={formData.needsTransportation ? 'true' : 'false'}
                    className="flex gap-4"
                  >
                     <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="t-alone" />
                      <Label htmlFor="t-alone" className="font-semibold text-lg cursor-pointer">자체 해결</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="t-with" />
                      <Label htmlFor="t-with" className="font-semibold text-lg cursor-pointer">교통/숙소 지원 필요</Label>
                    </div>
                  </RadioGroup>

                  {formData.needsTransportation && (
                    <div className="animate-in fade-in pt-2">
                      <Label htmlFor="t-details" className="text-sm font-semibold text-primary block mb-2">필요하신 편의 서비스에 대해 남겨주세요.</Label>
                      <Textarea 
                        id="t-details"
                        placeholder="예: 부산에서 KTX를 타고 갑니다. 근처 조용한 호텔 연계 예약이 필요합니다."
                        className="rounded-xl min-h-[100px]"
                        value={formData.transportationDetails}
                        onChange={(e) => setFormData({...formData, transportationDetails: e.target.value})}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <Label className="text-xl font-bold">3. 프라이버시 동선 요청</Label>
                  <p className="text-sm text-text-secondary">병원에서 다른 사람과 마주치지 않는 조용한 VIP 전용 길(동선)을 원하시나요?</p>
                  <RadioGroup 
                     onValueChange={(v) => setFormData({...formData, wantsPrivacyRoute: v === 'true'})}
                     value={formData.wantsPrivacyRoute ? 'true' : 'false'}
                    className="flex gap-4"
                  >
                     <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="pr-with" />
                      <Label htmlFor="pr-with" className="font-semibold text-lg cursor-pointer">VIP 동선 원함</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="pr-alone" />
                      <Label htmlFor="pr-alone" className="font-semibold text-lg cursor-pointer">일반 동선 무관</Label>
                    </div>
                  </RadioGroup>

                  {formData.wantsPrivacyRoute && (
                    <div className="animate-in fade-in pt-2">
                      <Label htmlFor="pr-details" className="text-sm font-semibold text-primary block mb-2">특히 피하고 싶은 상황이 있다면 알려주세요.</Label>
                      <Textarea 
                        id="pr-details"
                        placeholder="예: 로비 대기를 최소화하고 싶습니다."
                        className="rounded-xl min-h-[100px]"
                        value={formData.privacyRouteDetails}
                        onChange={(e) => setFormData({...formData, privacyRouteDetails: e.target.value})}
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-6">
                  <Button type="button" variant="outline" onClick={() => setStep(3)} className="flex-1 h-14 rounded-2xl font-bold">이전</Button>
                  <Button 
                    type="button" 
                    onClick={() => setStep(5)} 
                    disabled={
                      (formData.hasCompanion && !formData.companionDetails) ||
                      (formData.needsTransportation && !formData.transportationDetails) ||
                      (formData.wantsPrivacyRoute && !formData.privacyRouteDetails)
                    }
                    className="flex-[2] h-14 rounded-2xl text-lg font-bold bg-primary"
                  >
                    마지막 단계로 (4/5)
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 5: 투자와 기대되는 서비스 */}
            {step === 5 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-black text-primary mb-2">더 완벽한 관리를 위한 디자인</h3>
                  <p className="text-text-secondary">이번 회복과 아름다움을 위해 어느 정도의 투자를 생각하시나요?</p>
                </div>

                <div className="space-y-4">
                  <Label className="text-xl font-bold">1. 예상 투자 예산 (시술 및 회복 케어 포함)</Label>
                  <RadioGroup 
                    onValueChange={(v) => {
                      setFormData({...formData, budgetRange: v, customBudget: v === 'custom' ? formData.customBudget : ''})
                    }}
                    value={formData.budgetRange}
                    className="grid grid-cols-2 gap-3"
                  >
                    {[
                      { id: "b-1", label: "500만 원 이하", value: "500만 원 이하" },
                      { id: "b-2", label: "500~1,000만 원", value: "500~1,000만 원" },
                      { id: "b-3", label: "1,000~2,000만 원", value: "1,000~2,000만 원" },
                      { id: "b-4", label: "2,000만 원 이상", value: "2,000만 원 이상" },
                      { id: "b-5", label: "직접 입력", value: "custom" },
                    ].map((opt) => (
                      <div key={opt.id} className={`col-span-2 sm:col-span-1 flex items-center space-x-3 p-4 border rounded-2xl cursor-pointer transition-colors ${formData.budgetRange === opt.value ? 'bg-primary/10 border-primary' : 'border-line hover:bg-primary/5'}`}>
                        <RadioGroupItem value={opt.value} id={opt.id} />
                        <Label htmlFor={opt.id} className="flex-1 cursor-pointer font-semibold">{opt.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>

                  {formData.budgetRange === 'custom' && (
                    <div className="animate-in fade-in pt-2">
                       <Input 
                        placeholder="원하시는 예산 범위를 직접 적어주세요."
                        className="h-14 rounded-2xl text-lg"
                        value={formData.customBudget}
                        onChange={(e) => setFormData({...formData, customBudget: e.target.value})}
                      />
                    </div>
                  )}
                </div>

                 <div className="space-y-4">
                  <Label className="text-xl font-bold">2. 금액에 따라 더 집중하고 싶은 프리미엄 서비스 연동</Label>
                  
                  <div className={`p-4 mt-4 border rounded-2xl cursor-pointer transition-colors ${formData.needsDedicatedManager ? 'bg-primary/10 border-primary' : 'border-line hover:bg-primary/5'}`}>
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        id="fs-manager" 
                        checked={formData.needsDedicatedManager}
                        onCheckedChange={(c) => setFormData({...formData, needsDedicatedManager: !!c})}
                      />
                      <Label htmlFor="fs-manager" className="flex-1 cursor-pointer font-semibold text-lg">전담 마크 매니저 배치</Label>
                    </div>
                    <p className="text-sm text-text-secondary mt-1 ml-7">24시간 나만 지켜봐 주고 상담해 주는 VIP 전담 회복 매니저가 필요한가요?</p>
                  </div>

                  <div className={`p-4 border rounded-2xl cursor-pointer transition-colors ${formData.needsPremiumKit ? 'bg-primary/10 border-primary' : 'border-line hover:bg-primary/5'}`}>
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        id="fs-kit" 
                        checked={formData.needsPremiumKit}
                        onCheckedChange={(c) => setFormData({...formData, needsPremiumKit: !!c})}
                      />
                      <Label htmlFor="fs-kit" className="flex-1 cursor-pointer font-semibold text-lg">프리미엄 리커버리 키트</Label>
                    </div>
                    <p className="text-sm text-text-secondary mt-1 ml-7">집에서도 완벽하게 관리할 수 있는 최고급 회복 화장품과 전문 도구들이 필요한가요?</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-6">
                  <Button type="button" variant="outline" onClick={() => setStep(4)} className="flex-1 h-14 rounded-2xl font-bold">이전</Button>
                  <Button 
                    type="button" 
                    onClick={handleSubmit} 
                    disabled={isSubmitting || !formData.budgetRange || (formData.budgetRange === 'custom' && !formData.customBudget)}
                    className="flex-[2] h-14 rounded-2xl text-lg font-bold bg-primary"
                  >
                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : '최종 설계 완료하기'}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
