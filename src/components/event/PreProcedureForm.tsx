"use client";

import React, { useState, useMemo } from "react";
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
import { useRecovery } from "@/contexts/RecoveryContext";

export default function PreProcedureForm() {
  const router = useRouter();
  const { addToast } = useToast();
  const { medicalCategory } = useRecovery();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Adaptive Content Definition
  const content = useMemo(() => {
    switch (medicalCategory) {
      case 'ORTHOPEDIC':
        return {
          step1Title: "기대하는 회복 수준을 알려주세요",
          step1Sub: "통증 완화와 가동 범위 회복 등 목표를 설정합니다.",
          changeLabel: "1. 기대하는 기능 회복 정도",
          changeOptions: [
            { label: "일상생활에 불편함이 없는 수준 (기본 회복)", value: "자연스러운 변화" },
            { label: "가벼운 운동이나 취미 활동 가능 수준 (적극 회복)", value: "세련된 변화" },
            { label: "이전의 최고 컨디션 및 스포츠 복귀 수준 (완벽 회복)", value: "드라마틱한 변화" }
          ],
          eventLabel: "3. 활동 복귀 데드라인",
          eventSub: "여행, 운동 경기 참여 등 정상적인 신체 활동이 꼭 필요한 날이 있나요?",
          eventPlaceholder: "예: 2주 뒤 가족 여행이 있어 장거리 보행이 가능해야 합니다."
        };
      case 'INTERNAL':
        return {
          step1Title: "건강 개선 목표를 설정합니다",
          step1Sub: "검진 결과 개선 및 수치 안정화를 위한 계획을 세웁니다.",
          changeLabel: "1. 목표하는 수치 개선 정도",
          changeOptions: [
            { label: "정상 범위 진입 및 유지 (기본 관리)", value: "자연스러운 변화" },
            { label: "체감 컨디션의 뚜렷한 개선 (집중 관리)", value: "세련된 변화" },
            { label: "만성 질환 위험 요소의 완전 배제 (완벽 관리)", value: "드라마틱한 변화" }
          ],
          eventLabel: "3. 건강 지표 확인 일정",
          eventSub: "다음 정밀 검진이나 중요한 건강 리포트 확인일이 정해져 있나요?",
          eventPlaceholder: "예: 한 달 뒤 혈액 검사 재통보가 예정되어 있습니다."
        };
      case 'GENERAL':
        return {
          step1Title: "안전한 치료와 회복을 설계합니다",
          step1Sub: "전신 컨디션 관리와 치료 성공을 위한 준비를 시작합니다.",
          changeLabel: "1. 원하는 회복 목표",
          changeOptions: [
            { label: "안정적인 컨디션 유지", value: "자연스러운 변화" },
            { label: "빠른 기력 회복 및 증상 완화", value: "세련된 변화" },
            { label: "근본적인 신체 자생력 강화", value: "드라마틱한 변화" }
          ],
          eventLabel: "3. 중요한 일정 확인",
          eventSub: "시술/수술 전후로 반드시 건강을 회복해야 하는 일정이 있나요?",
          eventPlaceholder: "예: 다음 주부터 중요한 프로젝트 복귀가 예정되어 있습니다."
        };
      default: // PLASTIC or Default
        return {
          step1Title: "당신은 어떤 회복을 꿈꾸나요?",
          step1Sub: "기대하는 변화와 미적 목표를 알려주세요.",
          changeLabel: "1. 원하는 변화의 크기",
          changeOptions: [
            { label: "자연스럽고 미세한 변화 (티 나지 않게)", value: "자연스러운 변화" },
            { label: "적당히 티가 나는 세련된 변화", value: "세련된 변화" },
            { label: "확실하고 드라마틱한 변화", value: "드라마틱한 변화" }
          ],
          eventLabel: "3. 중요한 약속 여부",
          eventSub: "시술 후 한 달 안에 결혼식이나 사진 촬영처럼 꼭 예뻐야 하는 날이 있나요?",
          eventPlaceholder: "예: 3주 뒤 웨딩 촬영이 있습니다."
        };
    }
  }, [medicalCategory]);

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
    if (formData.wantsPrivacyRoute || formData.anxietyPoints.includes('프라이버시')) return '프라이버시 보호형';
    if (formData.downtime === '1일' || formData.downtime === '3일') return '빠른 복귀형';
    if (formData.budgetRange === 'large' || formData.needsDedicatedManager) return '프리미엄 집중케어형';
    return '스탠다드 맞춤형';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        medicalCategory, // Include the selected category
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

  const getProgressWidth = () => {
    switch (step) {
      case 1: return "w-1/5";
      case 2: return "w-2/5";
      case 3: return "w-3/5";
      case 4: return "w-4/5";
      case 5: return "w-full";
      default: return "w-0";
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <Card className="border-none shadow-2xl bg-surface/80 backdrop-blur-xl rounded-[32px] overflow-hidden">
        <div className={`h-2 bg-primary transition-all duration-500 ${getProgressWidth()}`} />
        <CardHeader className="pt-10 pb-6 text-center">
          <CardTitle className="text-3xl font-black tracking-tight mb-2 italic">Recovery Design</CardTitle>
          <CardDescription className="text-lg font-medium text-text-secondary">
            {medicalCategory === 'PLASTIC' ? '성형/피부' : 
             medicalCategory === 'ORTHOPEDIC' ? '정형/재활' : 
             medicalCategory === 'INTERNAL' ? '내과/검진' : '정밀'} 회복 설계를 시작합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-10">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-8 px-2 sm:px-6">
            
            {/* STEP 1: 기대치 (Adaptive Content applied here) */}
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-black text-primary mb-2">{content.step1Title}</h3>
                  <p className="text-text-secondary">{content.step1Sub}</p>
                </div>

                <div className="space-y-4">
                  <Label className="text-xl font-bold">{content.changeLabel}</Label>
                  <RadioGroup 
                    onValueChange={(v) => setFormData({...formData, changeScale: v})}
                    value={formData.changeScale}
                    className="grid grid-cols-1 gap-3"
                  >
                    {content.changeOptions.map((opt, idx) => (
                      <div key={idx} className={`flex items-center space-x-3 p-4 border rounded-2xl cursor-pointer transition-colors ${formData.changeScale === opt.value ? 'bg-primary/10 border-primary' : 'border-line hover:bg-primary/5'}`}>
                        <RadioGroupItem value={opt.value} id={`v-${idx}`} />
                        <Label htmlFor={`v-${idx}`} className="flex-1 cursor-pointer font-semibold">{opt.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <Label className="text-xl font-bold">2. 일상 복귀 목표</Label>
                  <p className="text-sm text-text-secondary">시술 후 며칠 뒤에 다시 본업이나 일상으로 돌아가야 하나요?</p>
                  <RadioGroup 
                    onValueChange={(v) => setFormData({...formData, downtime: v})}
                    value={formData.downtime}
                    className="grid grid-cols-2 gap-3"
                  >
                    {[
                      { id: "d-1", label: "1일 (바로 복귀)", value: "1일" },
                      { id: "d-3", label: "3일 (단기 휴식)", value: "3일" },
                      { id: "d-7", label: "7일 (충분한 회복)", value: "7일" },
                      { id: "d-14", label: "14일 이상 (완벽한 복구)", value: "14일 이상" },
                    ].map((opt) => (
                      <div key={opt.id} className={`col-span-2 sm:col-span-1 flex items-center space-x-3 p-4 border rounded-2xl cursor-pointer transition-colors ${formData.downtime === opt.value ? 'bg-primary/10 border-primary' : 'border-line hover:bg-primary/5'}`}>
                        <RadioGroupItem value={opt.value} id={opt.id} />
                        <Label htmlFor={opt.id} className="flex-1 cursor-pointer font-semibold">{opt.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <Label className="text-xl font-bold">{content.eventLabel}</Label>
                  <p className="text-sm text-text-secondary">{content.eventSub}</p>
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
                      <Label htmlFor="e-details" className="text-sm font-semibold text-primary mb-2 block">상세 내용을 알려주세요</Label>
                      <Textarea 
                        id="e-details"
                        placeholder={content.eventPlaceholder}
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
                  <p className="text-text-secondary">과거 경험과 현재 상태를 통해 안전한 과정을 준비합니다.</p>
                </div>

                <div className="space-y-4">
                  <Label className="text-xl font-bold">1. 비슷한 경험 여부</Label>
                  <p className="text-sm text-text-secondary">이전에 줄기세포나 해당 분야의 시술/치료를 받아본 적이 있나요?</p>
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
                      <Label htmlFor="p-details" className="text-sm font-semibold text-primary block mb-2">당시 경험에 대해 알려주세요</Label>
                      <Textarea 
                        id="p-details"
                        placeholder="예: 2년 전 같은 부위 치료를 받았고, 회복까지 2주 정도 걸렸습니다."
                        className="rounded-xl min-h-[100px]"
                        value={formData.pastExperienceDetails}
                        onChange={(e) => setFormData({...formData, pastExperienceDetails: e.target.value})}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <Label className="text-xl font-bold">2. 복용 중인 약품 확인</Label>
                  <p className="text-sm text-text-secondary">현재 정기적으로 드시는 약이나 주의가 필요한 영양제(아스피린, 혈전 용해제 등)가 있나요?</p>
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
                      <Label htmlFor="m-details" className="text-sm font-semibold text-primary block mb-2">복용 중인 약이나 영양제 이름을 적어주세요</Label>
                      <Textarea 
                        id="m-details"
                        placeholder="예: 혈압약, 오메가3, 아스피린 복용 중입니다."
                        className="rounded-xl min-h-[100px]"
                        value={formData.medicationDetails}
                        onChange={(e) => setFormData({...formData, medicationDetails: e.target.value})}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <Label className="text-xl font-bold">3. 최근 건강 상태</Label>
                  <p className="text-sm text-text-secondary">최근 무력감, 불면, 과도한 피로 등 컨디션 저하가 눈에 띄게 있었나요?</p>
                  <RadioGroup 
                    onValueChange={(v) => setFormData({...formData, hasHealthIssue: v === 'true'})}
                    value={formData.hasHealthIssue ? 'true' : 'false'}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="h-yes" />
                      <Label htmlFor="h-yes" className="font-semibold text-lg">네, 있습니다</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="h-no" />
                      <Label htmlFor="h-no" className="font-semibold text-lg">아니오, 양호합니다</Label>
                    </div>
                  </RadioGroup>

                  {formData.hasHealthIssue && (
                    <div className="animate-in fade-in pt-2">
                      <Label htmlFor="h-details" className="text-sm font-semibold text-primary block mb-2">상태에 대해 간단히 적어주세요</Label>
                      <Textarea 
                        id="h-details"
                        placeholder="예: 요새 불면증이 있어 컨디션이 저하된 상태입니다."
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

            {/* STEP 3 ~ 5 remains mostly same structurally but uses the updated payload in submit */}
            {/* STEP 3: 불안 체크 */}
            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-black text-primary mb-2">무엇이 가장 걱정되시나요?</h3>
                  <p className="text-text-secondary">불안한 점을 미리 파악해 세심하게 케어해 드립니다.</p>
                </div>

                <div className="space-y-4">
                  <Label className="text-xl font-bold">과정 중 가장 우려되는 부분을 선택해주세요. (복수 선택)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "a-pain", label: "통증/불편함", value: "통증" },
                      { id: "a-swelling", label: "부기 및 흔적", value: "붓기/멍" },
                      { id: "a-scar", label: "치료 효과 미비", value: "효과걱정" },
                      { id: "a-privacy", label: "프라이버시 노출", value: "프라이버시" },
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
                        placeholder="예: VIP 전용 동선을 사용하고 싶습니다."
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

            {/* STEP 4 & 5 Omitted for brevity in this replace, but they should include the final handleSubmit with medicalCategory */}
            {/* Keeping it simple by re-writing the whole file to ensure completeness */}
             {step === 4 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-black text-primary mb-2">프리미엄 방문 환경 설계</h3>
                  <p className="text-text-secondary">VIP 맞춤 환경을 위해 이동 경로와 동반자를 파악합니다.</p>
                </div>

                <div className="space-y-4">
                  <Label className="text-xl font-bold">1. 방문 시 보호자 동행 유무</Label>
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
                      <Label htmlFor="c-with" className="font-semibold text-lg cursor-pointer">보호자와 함께</Label>
                    </div>
                  </RadioGroup>

                  {formData.hasCompanion && (
                    <div className="animate-in fade-in pt-2">
                      <Label htmlFor="c-details" className="text-sm font-semibold text-primary block mb-2">보호자분을 위한 특별한 요청사항이 있나요?</Label>
                      <Textarea 
                        id="c-details"
                        placeholder="예: 함께 오시는 남편이 쉴 수 있는 편안한 대기 공간이 필요합니다."
                        className="rounded-xl min-h-[100px]"
                        value={formData.companionDetails}
                        onChange={(e) => setFormData({...formData, companionDetails: e.target.value})}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <Label className="text-xl font-bold">2. 교통편 및 숙소 지원</Label>
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
                      <Label htmlFor="t-with" className="font-semibold text-lg cursor-pointer">지원 필요</Label>
                    </div>
                  </RadioGroup>

                  {formData.needsTransportation && (
                    <div className="animate-in fade-in pt-2">
                      <Label htmlFor="t-details" className="text-sm font-semibold text-primary block mb-2">필요하신 편의 서비스에 대해 알려주세요</Label>
                      <Textarea 
                        id="t-details"
                        placeholder="예: 지방에서 올라가서 병원 근처 제휴 숙박 시설 안내가 필요합니다."
                        className="rounded-xl min-h-[100px]"
                        value={formData.transportationDetails}
                        onChange={(e) => setFormData({...formData, transportationDetails: e.target.value})}
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
                      (formData.needsTransportation && !formData.transportationDetails)
                    }
                    className="flex-[2] h-14 rounded-2xl text-lg font-bold bg-primary"
                  >
                    마지막 단계로 (4/5)
                  </Button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-black text-primary mb-2">최종 회복 투자 설계</h3>
                  <p className="text-text-secondary">이번 회복 여정에 생각하시는 예산 범위를 설정합니다.</p>
                </div>

                <div className="space-y-4">
                  <Label className="text-xl font-bold">1. 예상 투자 예산 (치료 및 집중 케어 포함)</Label>
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
                        placeholder="직접 입력하세요."
                        className="h-14 rounded-2xl text-lg"
                        value={formData.customBudget}
                        onChange={(e) => setFormData({...formData, customBudget: e.target.value})}
                      />
                    </div>
                  )}
                </div>

                 <div className="space-y-4">
                  <Label className="text-xl font-bold">2. 추가 프리미엄 서비스 옵션</Label>
                  <div className="grid gap-3">
                    <div className={`p-4 border rounded-2xl cursor-pointer transition-colors ${formData.needsDedicatedManager ? 'bg-primary/10 border-primary' : 'border-line hover:bg-primary/5'}`}>
                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          id="fs-manager" 
                          checked={formData.needsDedicatedManager}
                          onCheckedChange={(c) => setFormData({...formData, needsDedicatedManager: !!c})}
                        />
                        <Label htmlFor="fs-manager" className="flex-1 cursor-pointer font-semibold text-lg">VIP 전담 매니저 매칭</Label>
                      </div>
                    </div>

                    <div className={`p-4 border rounded-2xl cursor-pointer transition-colors ${formData.needsPremiumKit ? 'bg-primary/10 border-primary' : 'border-line hover:bg-primary/5'}`}>
                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          id="fs-kit" 
                          checked={formData.needsPremiumKit}
                          onCheckedChange={(c) => setFormData({...formData, needsPremiumKit: !!c})}
                        />
                        <Label htmlFor="fs-kit" className="flex-1 cursor-pointer font-semibold text-lg">리커버리 홈 케어 키트</Label>
                      </div>
                    </div>
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
                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : '상담 신청 및 완료'}
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
