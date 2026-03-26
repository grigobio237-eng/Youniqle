'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import PartnerLayout from '@/components/partner/PartnerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Sparkles, 
  Upload, 
  Save, 
  Layout, 
  Music, 
  Palette, 
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  DollarSign,
  Youtube,
  Instagram,
  Video,
  Plus,
  Trash2,
  ExternalLink,
  BadgeCent,
  Award
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import Image from 'next/image';

export default function CoachingManagementPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [partnerType, setPartnerType] = useState<string>('trainer');
  const [pavilionInfo, setPavilionInfo] = useState({
    characterImage: '',
    roomDescription: '',
    roomMusic: '',
    roomTheme: 'premium',
    isActive: true
  });
  const [coachProfile, setCoachProfile] = useState<any>({
    programs: [],
    availability: [],
    socialMedia: {
      youtube: '',
      instagram: '',
      tiktok: ''
    }
  });
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);

  const isMedical = partnerType === 'medical';

  const labels = {
    title: isMedical ? '병원 설정관리' : '트레이너 설정관리',
    badge: isMedical ? '병원 프로필 관리' : '트레이너 프로필 관리',
    subtitle: isMedical ? '의료 전문가로서의 페르소나, 상담 스케줄 및 미디어 채널을 관리합니다.' : '전문가로서의 페르소나, 스케줄 및 미디어 채널을 관리합니다.',
    tab1: isMedical ? '프로필/진료공간 설정' : '프로필/공간 설정',
    tab2: isMedical ? '스케줄/상담상품 관리' : '스케줄/상품 관리',
    card1Title: isMedical ? '의료진 캐릭터 설정' : '코치 캐릭터 설정',
    card1Desc: isMedical ? '리스트 및 가상 진료실에 노출될 마스터 캐릭터' : '리스트 및 가상공간에 노출될 마스터 캐릭터',
    card1UiTitle: isMedical ? 'Expert Reflection Logic' : 'UI Reflection Logic',
    card1UiDesc: isMedical ? '이미지를 업로드하시면 의료진 리스트에서 더 신뢰감 있게 표현됩니다. 가급적 전문적인 캐릭터 컷을 권장합니다.' : '이미지를 업로드하시면 트레이너 리스트에서 더 품격 있게 표현됩니다. 가급적 전문 스튜디오에서 촬영된 캐릭터 컷을 권장합니다.',
    protocolTitle: isMedical ? '진료 프로토콜' : '전시 프로토콜',
    protocolStatus: isMedical ? '상담 노출 활성화' : '퍼블릭 노출 활성화',
    themeLabel: isMedical ? '진료공간 분위기 설정' : '공간 분위기 설정',
    musicLabel: isMedical ? '배경 음악 설정' : '배경 음악 설정',
    musicPlaceholder: isMedical ? '가상 상담실에서 자동 재생될 엠비언스 선택' : '가상 코칭 룸에서 자동 재생될 엠비언스 선택',
    identityTitle: isMedical ? '의료진 직함' : '트레이너 직함',
    identityTitlePlaceholder: isMedical ? '예: 대표 원장, 수석 전문의, 재활 전문가' : '예: Senior Recovery Curator, Pro Soccer Coach',
    specialtyLabel: isMedical ? '주요 진료/전문 분야' : '주요 전문 분야',
    specialtyPlaceholder: isMedical ? '예: 근골격계 재활, 수면 장애 클리닉' : '예: Neuromuscular Reset, Tactical Analysis',
    narrativeLabel: isMedical ? '공간 서사 및 진료 철학' : '공간 서사 및 철학',
    narrativePlaceholder: isMedical ? '가상 상담실에 입장했을 때 노출될 당신만의 진료 철학이나 환영의 인사를 입력하세요.' : '가상 코칭 룸에 입장했을 때 노출될 당신만의 철학이나 환영의 인사를 입력하세요.',
    programTitle: isMedical ? '상담 상품 및 금액 설정' : '코칭 상품 및 금액 설정',
    programDesc: isMedical ? '회원에게 제공할 상담 프로그램 리스트' : '회원에게 제공할 코칭 프로그램 리스트',
    programBtn: isMedical ? '상품 추가' : '상품 추가',
    programEmpty: isMedical ? '등록된 상담 상품이 없습니다.' : '등록된 코칭 상품이 없습니다.',
    scheduleTitle: isMedical ? '예약 가능 스케줄 관리' : '예약 가능 스케줄 관리',
    scheduleDesc: isMedical ? '유저가 선택할 수 있는 상담 예약 시간대 설정' : '유저가 선택할 수 있는 빈 시간대 설정',
    scheduleFooter: isMedical ? '등록하신 시간에 유저가 진료 및 상담을 예약할 수 있습니다.' : '등록하신 시간에 유저가 코칭을 예약할 수 있습니다.',
    socialMediaLabel: isMedical ? '의료 전문성 소셜 미디어 연동' : '영상 및 소셜 미디어 연동',
    socialMediaDesc: isMedical ? '의료진 개인의 전문성을 보여줄 외부 채널을 연결하세요.' : '트레이너 개인의 전문성을 보여줄 외부 채널을 연결하세요.',
    mediaPolicyHeader: isMedical ? '전문성 증명 정책' : '표시 정책',
    mediaPolicyBody: isMedical ? '연동된 영상과 SNS 채널은 의료진 상세 페이지 하단의 \'미디어 갤러리\' 영역에 노출되어 전문성을 입증하는 증거가 됩니다.' : '연동된 영상과 SNS 채널은 트레이너 상세 페이지 하단의 \'미디어 갤러리\' 영역에 노출되어 당신의 전문성을 입증하는 증거가 됩니다.',
    syncHeader: isMedical ? '의료 시스템 동기화 활성화' : '자동 반영 프로토콜 활성화',
    syncBody: isMedical ? '설정된 데이터는 Master Curator List와 의료진 상세 페이지에 실시간 동기화됩니다. 당신의 페르소나가 유니클 생태계 전반에 걸쳐 신뢰감 있게 표현되도록 관리하십시오.' : '설정된 데이터는 Master Curator List와 트레이너 상세 페이지에 실시간 동기화됩니다. 당신의 페르소나가 유니클 생태계 전반에 걸쳐 일관되게 표현되도록 관리하십시오.'
  };

  const THEME_DESCRIPTIONS = {
    premium: "고급스럽고 격식 있는 분위기로 정교한 하이엔드 회복 프로토콜에 적합합니다.",
    zen: "차분한 분위기로 스트레스 해소나 마인드풀니스 위주의 코칭에 최적화되어 있습니다.",
    modern: "세련되고 전문가적인 느낌으로 데이터 기반의 정밀 분석 코칭에 어울립니다.",
    sleek: "간결하고 미래지향적인 스타일로 최첨단 효율성을 중시하는 스타일에 적합합니다.",
    classic: "편안하고 신뢰감 있는 분위기로 따뜻한 회복 경험을 선사합니다."
  };

  const characterInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPavilionSettings();
  }, []);

  const fetchPavilionSettings = async () => {
    try {
      const response = await fetch('/api/partner/pavilion');
      if (response.ok) {
        const data = await response.json();
        setPartnerType(data.partnerType || 'trainer');
        setPavilionInfo(data.pavilionInfo);
        if (data.coachProfile) {
          setCoachProfile({
            ...coachProfile,
            ...data.coachProfile,
            socialMedia: {
              ...coachProfile.socialMedia,
              ...(data.coachProfile.socialMedia || {})
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch pavilion settings:', error);
      toast.error('설정을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'pavilion-characters');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setPavilionInfo(prev => ({ ...prev, characterImage: data.url }));
        toast.success('캐릭터 이미지가 업로드되었습니다.');
      } else {
        toast.error('이미지 업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/partner/pavilion', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pavilionInfo,
          coachProfile
        })
      });

      if (response.ok) {
        toast.success('매니지먼트 설정이 시스템에 동기화되었습니다.');
      } else {
        toast.error('저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // Schedule/Program Handlers
  const addProgram = () => {
    const newProgram = {
      title: '',
      duration: '60 min',
      intensity: 'Medium',
      price: '100,000',
      tags: []
    };
    setCoachProfile((prev: any) => ({
      ...prev,
      programs: [...(prev.programs || []), newProgram]
    }));
  };

  const updateProgram = (index: number, field: string, value: any) => {
    const newPrograms = [...coachProfile.programs];
    newPrograms[index] = { ...newPrograms[index], [field]: value };
    setCoachProfile((prev: any) => ({ ...prev, programs: newPrograms }));
  };

  const removeProgram = (index: number) => {
    const newPrograms = coachProfile.programs.filter((_: any, i: number) => i !== index);
    setCoachProfile((prev: any) => ({ ...prev, programs: newPrograms }));
  };

  // Availability Handlers
  const addAvailability = () => {
    const newSlot = {
      date: new Date().toISOString().split('T')[0],
      slots: ['09:00', '10:00', '14:00', '15:00'],
      isAllDay: false
    };
    setCoachProfile((prev: any) => ({
      ...prev,
      availability: [...(prev.availability || []), newSlot]
    }));
  };

  const updateAvailability = (index: number, field: string, value: any) => {
    const newAvail = [...coachProfile.availability];
    newAvail[index] = { ...newAvail[index], [field]: value };
    setCoachProfile((prev: any) => ({ ...prev, availability: newAvail }));
  };

  const removeAvailability = (index: number) => {
    const newAvail = coachProfile.availability.filter((_: any, i: number) => i !== index);
    setCoachProfile((prev: any) => ({ ...prev, availability: newAvail }));
  };

  if (loading) {
    return (
      <PartnerLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-chapter-accent"></div>
        </div>
      </PartnerLayout>
    );
  }

  return (
    <PartnerLayout>
      <div className="max-w-6xl mx-auto space-y-8 py-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 md:px-0 mb-4">
          <div>
            <Badge className="bg-chapter-accent/10 text-chapter-accent border-none mb-3 px-3 py-1 text-[10px] font-black uppercase tracking-widest">
              {labels.badge}
            </Badge>
            <h1 className="text-3xl md:text-5xl font-black text-obsidian tracking-tighter">
              {labels.title}
            </h1>
            <p className="text-slate font-medium mt-1">{labels.subtitle}</p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={saving} 
            className="h-16 px-10 rounded-2xl bg-obsidian text-mist font-black gap-3 shadow-2xl hover:scale-[1.02] transform transition-all active:scale-[0.98]"
          >
            <Save className="h-5 w-5" />
            {saving ? '시스템 동기화 중...' : '매니지먼트 설정 저장'}
          </Button>
        </div>

        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent border-b border-line/10 w-full justify-start rounded-none h-auto p-0 mb-8 gap-8 overflow-x-auto no-scrollbar">
            <TabsTrigger value="profile" className="rounded-none border-b-2 border-transparent data-[state=active]:border-chapter-accent data-[state=active]:bg-transparent data-[state=active]:text-obsidian text-slate font-black uppercase tracking-widest text-[11px] pb-4 px-1">
              {labels.tab1}
            </TabsTrigger>
            <TabsTrigger value="schedule" className="rounded-none border-b-2 border-transparent data-[state=active]:border-chapter-accent data-[state=active]:bg-transparent data-[state=active]:text-obsidian text-slate font-black uppercase tracking-widest text-[11px] pb-4 px-1">
              {labels.tab2}
            </TabsTrigger>
            <TabsTrigger value="video" className="rounded-none border-b-2 border-transparent data-[state=active]:border-chapter-accent data-[state=active]:bg-transparent data-[state=active]:text-obsidian text-slate font-black uppercase tracking-widest text-[11px] pb-4 px-1">
              영상/소셜 연동
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Character & Preview */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="border-none shadow-xl rounded-[40px] overflow-hidden bg-white border border-slate-100/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-black flex items-center gap-2 tracking-tight">
                      <div className="w-8 h-8 rounded-xl bg-chapter-accent/10 flex items-center justify-center text-chapter-accent">
                        <UserIcon size={18} />
                      </div>
                      {labels.card1Title}
                    </CardTitle>
                    <CardDescription className="font-bold text-xs">{labels.card1Desc}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div 
                      onClick={() => characterInputRef.current?.click()}
                      className="relative aspect-[3/4] bg-slate-50 rounded-[32px] border-4 border-dashed border-slate-100 flex items-center justify-center overflow-hidden cursor-pointer group transition-all hover:border-chapter-accent/40 hover:bg-white"
                    >
                      {pavilionInfo.characterImage ? (
                        <>
                          <Image 
                            src={pavilionInfo.characterImage} 
                            alt="Character" 
                            fill 
                            className="object-cover transition-transform duration-500 group-hover:scale-105" 
                          />
                          <div className="absolute inset-0 bg-obsidian/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity duration-300">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-obsidian shadow-xl mb-2">
                               <Upload size={24} />
                            </div>
                            <span className="text-white text-xs font-black uppercase tracking-widest">이미지 변경</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-4 text-slate/30">
                          <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center">
                            <Upload size={32} />
                          </div>
                          <div className="text-center">
                            <span className="text-sm font-black uppercase tracking-[0.2em] block">캐릭터 업로드</span>
                            <span className="text-[10px] font-bold mt-1 opacity-60">PNG / WebP (투명 배경 권장)</span>
                          </div>
                        </div>
                      )}
                      <input 
                        id="character-upload-input"
                        type="file" 
                        ref={characterInputRef} 
                        className="hidden" 
                        onChange={handleImageUpload} 
                        accept="image/*"
                        aria-label="캐릭터 이미지 업로드"
                        title="캐릭터 이미지 업로드"
                      />
                    </div>
                    <div className="p-5 bg-gradient-to-br from-indigo-50/50 to-chapter-accent/5 rounded-3xl border border-chapter-accent/10 flex gap-4">
                      <div className="shrink-0">
                        <Sparkles className="h-5 w-5 text-chapter-accent mt-0.5" />
                      </div>
                      <p className="text-[11px] font-bold text-slate/70 leading-relaxed">
                        <strong className="text-chapter-accent block mb-1">{labels.card1UiTitle}</strong>
                        {labels.card1UiDesc}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-[32px] bg-obsidian overflow-hidden text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-black flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-chapter-accent">
                        <Layout size={18} />
                      </div>
                      {labels.protocolTitle}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5">
                      <div>
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">공개 상태</p>
                        <div className="text-sm font-black flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full ${pavilionInfo.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]' : 'bg-slate-500'}`} />
                           {pavilionInfo.isActive ? labels.protocolStatus : '시스템 비활성 상태'}
                        </div>
                      </div>
                      <Switch 
                        checked={pavilionInfo.isActive} 
                        onCheckedChange={(checked) => setPavilionInfo(prev => ({ ...prev, isActive: checked }))} 
                        className="data-[state=checked]:bg-chapter-accent"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Settings */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-none shadow-xl rounded-[40px] bg-white p-6 md:p-10 border border-slate-100/50">
                  <div className="space-y-10">
                    {/* Theme Selection */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                            <Palette size={18} />
                          </div>
                          <Label className="text-sm font-black uppercase tracking-[0.2em] text-slate/60">{labels.themeLabel}</Label>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-black border-slate-100 text-slate/40">{(pavilionInfo.roomTheme || 'premium').toUpperCase()}</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {['Premium', 'Zen', 'Modern', 'Sleek', 'Classic'].map(theme => (
                          <button
                            key={theme}
                            onClick={() => setPavilionInfo(prev => ({ ...prev, roomTheme: theme.toLowerCase() }))}
                            onMouseEnter={() => setHoveredTheme(theme.toLowerCase())}
                            onMouseLeave={() => setHoveredTheme(null)}
                            className={`h-20 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                              pavilionInfo.roomTheme === theme.toLowerCase() 
                                ? 'border-chapter-accent bg-chapter-accent/5 shadow-inner' 
                                : 'border-slate-50 bg-slate-50 text-slate/40 hover:border-slate-100'
                            }`}
                            aria-label={`${theme} 테마 선택`}
                            title={`${theme} 테마 선택`}
                          >
                            <span className={`text-[11px] font-black ${pavilionInfo.roomTheme === theme.toLowerCase() ? 'text-chapter-accent' : ''}`}>
                              {theme}
                            </span>
                          </button>
                        ))}
                      </div>
                      <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 transition-all">
                        <p className="text-xs font-bold text-slate/70 text-center leading-relaxed">
                          {hoveredTheme 
                            ? THEME_DESCRIPTIONS[hoveredTheme as keyof typeof THEME_DESCRIPTIONS] 
                            : "각 테마 위에 마우스를 올리면 공간의 컨셉과 조언을 확인할 수 있습니다."}
                        </p>
                      </div>
                    </div>

                    {/* Music Selection */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                          <Music size={18} />
                        </div>
                        <Label htmlFor="room-music-select" className="text-sm font-black uppercase tracking-[0.2em] text-slate/60">배경 음악 설정</Label>
                      </div>
                      <Select 
                        value={pavilionInfo.roomMusic} 
                        onValueChange={(v) => setPavilionInfo(prev => ({ ...prev, roomMusic: v }))}
                      >
                        <SelectTrigger className="h-16 rounded-[20px] border-slate-100 bg-slate-50/50 font-bold px-6 focus:ring-chapter-accent" aria-label="배경 음악 선택">
                          <SelectValue placeholder={labels.musicPlaceholder} />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-100">
                          <SelectItem value="deep-rest">Deep Rest (Ambient Synthesis)</SelectItem>
                          <SelectItem value="morning-forest">Morning Forest Echoes</SelectItem>
                          <SelectItem value="theta-wave">Theta Wave Neural Recovery</SelectItem>
                          <SelectItem value="ocean-breeze">Soft Ocean Breeze</SelectItem>
                          <SelectItem value="silent-zen">Silent Zen Atmosphere</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Professional Identity */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                            <BadgeCent size={18} />
                          </div>
                          <Label htmlFor="coach-title-input" className="text-sm font-black uppercase tracking-[0.2em] text-slate/60">{labels.identityTitle}</Label>
                        </div>
                        <Input 
                          id="coach-title-input"
                          value={coachProfile.title}
                          onChange={(e) => setCoachProfile((prev: any) => ({ ...prev, title: e.target.value }))}
                          placeholder={labels.identityTitlePlaceholder}
                          className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 px-6 font-bold"
                        />
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                            <Award size={18} />
                          </div>
                          <Label htmlFor="coach-specialty-input" className="text-sm font-black uppercase tracking-[0.2em] text-slate/60">{labels.specialtyLabel}</Label>
                        </div>
                        <Input 
                          id="coach-specialty-input"
                          value={coachProfile.specialty}
                          onChange={(e) => setCoachProfile((prev: any) => ({ ...prev, specialty: e.target.value }))}
                          placeholder={labels.specialtyPlaceholder}
                          className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 px-6 font-bold"
                        />
                      </div>
                    </div>

                    {/* Narrative Description */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
                          <Sparkles size={18} />
                        </div>
                        <Label htmlFor="coach-description-textarea" className="text-sm font-black uppercase tracking-[0.2em] text-slate/60">{labels.narrativeLabel}</Label>
                      </div>
                      <Textarea 
                        id="coach-description-textarea"
                        value={coachProfile.description}
                        onChange={(e) => setCoachProfile((prev: any) => ({ ...prev, description: e.target.value }))}
                        placeholder={labels.narrativePlaceholder}
                        className="min-h-[200px] rounded-[32px] border-slate-100 bg-slate-50/50 p-8 font-medium leading-relaxed resize-none focus:ring-chapter-accent/20 transition-all focus:bg-white"
                      />
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Programs Management */}
              <Card className="border-none shadow-xl rounded-[40px] bg-white border border-slate-100/50 overflow-hidden">
                <CardHeader className="p-8 pb-4">
                   <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <CardTitle className="text-xl font-black flex items-center gap-2 tracking-tight">
                        <div className="w-8 h-8 rounded-xl bg-chapter-accent/10 flex items-center justify-center text-chapter-accent">
                          <DollarSign size={18} />
                        </div>
                        {labels.programTitle}
                      </CardTitle>
                      <CardDescription className="font-bold text-xs">{labels.programDesc}</CardDescription>
                    </div>
                    <Button onClick={addProgram} size="sm" className="bg-chapter-accent text-white rounded-xl gap-1">
                      <Plus size={14} /> {labels.programBtn}
                    </Button>
                   </div>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-4">
                   {(coachProfile.programs || []).length > 0 ? (
                     coachProfile.programs.map((prog: any, idx: number) => (
                       <div key={idx} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col gap-4 relative group">
                          <button 
                            onClick={() => removeProgram(idx)} 
                            title="상품 삭제"
                            aria-label="상품 삭제"
                            className="absolute top-4 right-4 text-slate/30 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`prog-title-${idx}`} className="text-[10px] font-black text-slate uppercase ml-1">상품명</Label>
                              <Input 
                                id={`prog-title-${idx}`}
                                value={prog.title} 
                                onChange={(e) => updateProgram(idx, 'title', e.target.value)}
                                placeholder="예: 수면 최적화 상담" 
                                className="h-12 rounded-xl bg-white border-none shadow-sm font-bold"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`prog-price-${idx}`} className="text-[10px] font-black text-slate uppercase ml-1">금액 (원)</Label>
                              <Input 
                                id={`prog-price-${idx}`}
                                value={prog.price} 
                                onChange={(e) => updateProgram(idx, 'price', e.target.value)}
                                placeholder="예: 150,000" 
                                className="h-12 rounded-xl bg-white border-none shadow-sm font-bold"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`prog-duration-${idx}`} className="text-[10px] font-black text-slate uppercase ml-1">소요 시간</Label>
                              <Input 
                                id={`prog-duration-${idx}`}
                                value={prog.duration} 
                                onChange={(e) => updateProgram(idx, 'duration', e.target.value)}
                                placeholder="예: 60 min" 
                                className="h-10 rounded-xl bg-white border-none shadow-sm text-xs font-bold"
                              />
                            </div>
                            <div className="space-y-2">
                               <Label className="text-[10px] font-black text-slate uppercase ml-1">강도</Label>
                              <Select value={prog.intensity} onValueChange={(v) => updateProgram(idx, 'intensity', v)}>
                                <SelectTrigger className="h-10 rounded-xl bg-white border-none shadow-sm text-xs font-bold" aria-label="강도 선택">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                  <SelectItem value="Low">Low</SelectItem>
                                  <SelectItem value="Medium">Medium</SelectItem>
                                  <SelectItem value="High">High</SelectItem>
                                  <SelectItem value="Mild">Mild</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                       </div>
                     ))
                   ) : (
                     <div className="py-12 text-center bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-100 text-slate/40">
                        <DollarSign size={32} className="mx-auto mb-2 opacity-20" />
                        <p className="text-sm font-bold">{labels.programEmpty}</p>
                     </div>
                   )}
                </CardContent>
              </Card>

              {/* Schedule Management */}
              <Card className="border-none shadow-xl rounded-[40px] bg-white border border-slate-100/50 overflow-hidden">
                <CardHeader className="p-8 pb-4">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <CardTitle className="text-xl font-black flex items-center gap-2 tracking-tight">
                        <div className="w-8 h-8 rounded-xl bg-chapter-accent/10 flex items-center justify-center text-chapter-accent">
                          <Calendar size={18} />
                        </div>
                        {labels.scheduleTitle}
                      </CardTitle>
                      <CardDescription className="font-bold text-xs">{labels.scheduleDesc}</CardDescription>
                    </div>
                    <Button onClick={addAvailability} size="sm" className="bg-chapter-accent text-white rounded-xl gap-1">
                      <Plus size={14} /> 날짜 추가
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-4">
                   {(coachProfile.availability || []).length > 0 ? (
                     coachProfile.availability.map((avail: any, idx: number) => (
                       <div key={idx} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col gap-4 relative group">
                          <button 
                            onClick={() => removeAvailability(idx)} 
                            title="예약 날짜 삭제"
                            aria-label="예약 날짜 삭제"
                            className="absolute top-4 right-4 text-slate/30 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end w-full">
                            <div className="space-y-2 flex-1 w-full">
                              <Label htmlFor={`avail-date-${idx}`} className="text-[10px] font-black text-slate uppercase ml-1 flex items-center gap-1">
                                <Calendar size={12} /> 날짜 선택
                              </Label>
                              <Input 
                                id={`avail-date-${idx}`}
                                type="date" 
                                value={avail.date} 
                                onChange={(e) => updateAvailability(idx, 'date', e.target.value)}
                                className="h-12 rounded-xl bg-white border-none shadow-sm font-bold"
                              />
                            </div>
                            
                            <div className="flex flex-col gap-2 min-w-[140px] w-full md:w-auto">
                               <Label className="text-[10px] font-black text-slate uppercase ml-1 flex items-center gap-1">
                                 <AlertCircle size={12} /> 예약 모드
                               </Label>
                               <div className="flex bg-white rounded-xl shadow-sm p-1">
                                 <button 
                                   onClick={() => updateAvailability(idx, 'isAllDay', false)}
                                   className={`flex-1 h-10 px-3 rounded-lg text-[10px] font-black transition-all ${!avail.isAllDay ? 'bg-chapter-accent text-white shadow-md' : 'text-slate/40 hover:text-slate'}`}
                                   aria-label="슬롯 방식 선택"
                                   title="슬롯 방식 선택"
                                 >
                                   슬롯 방식
                                 </button>
                                 <button 
                                   onClick={() => updateAvailability(idx, 'isAllDay', true)}
                                   className={`flex-1 h-10 px-3 rounded-lg text-[10px] font-black transition-all ${avail.isAllDay ? 'bg-amber-500 text-white shadow-md' : 'text-slate/40 hover:text-slate'}`}
                                   aria-label="전일 대관 선택"
                                   title="전일 대관 선택"
                                 >
                                   전일 대관
                                 </button>
                               </div>
                            </div>

                            <div className={`space-y-2 flex-[2] w-full transition-all duration-300 relative ${avail.isAllDay ? 'opacity-40' : 'opacity-100'}`}>
                              <Label className="text-[10px] font-black text-slate uppercase ml-1 flex items-center gap-1">
                                <Clock size={12} /> 가능 시간 슬롯 (쉼표 구분)
                              </Label>
                              <div className="relative">
                                <Input 
                                  value={avail.slots.join(', ')} 
                                  onChange={(e) => updateAvailability(idx, 'slots', e.target.value.split(',').map(s => s.trim()))}
                                  placeholder="예: 09:00, 11:00, 14:00" 
                                  disabled={avail.isAllDay}
                                  className={`h-12 rounded-xl bg-white border-none shadow-sm font-bold pr-10 ${avail.isAllDay ? 'cursor-not-allowed' : ''}`}
                                />
                                {avail.isAllDay && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px] rounded-xl border border-dashed border-amber-200">
                                    <span className="text-[9px] font-black text-amber-700 tracking-tighter">전일 예약 활성화됨</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                       </div>
                     ))
                   ) : (
                     <div className="py-12 text-center bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-100 text-slate/40">
                        <Calendar size={32} className="mx-auto mb-2 opacity-20" />
                        <p className="text-sm font-bold">오픈된 스케줄이 없습니다.</p>
                     </div>
                   )}
                   <p className="text-[10px] text-slate/40 text-center font-bold mt-4 flex items-center justify-center gap-1">
                     <AlertCircle size={10} /> {labels.scheduleFooter}
                   </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="video" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <Card className="border-none shadow-xl rounded-[40px] bg-white border border-slate-100/50 max-w-3xl mx-auto overflow-hidden">
                <CardHeader className="p-10 pb-6 text-center">
                  <div className="w-16 h-16 rounded-[28px] bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
                    <Video size={32} />
                  </div>
                  <CardTitle className="text-2xl font-black tracking-tight">{labels.socialMediaLabel}</CardTitle>
                  <CardDescription className="text-sm font-bold">{labels.socialMediaDesc}</CardDescription>
                </CardHeader>
                <CardContent className="p-10 pt-0 space-y-8">
                  <div className="space-y-6">
                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                         <Label className="text-xs font-black text-slate uppercase flex items-center gap-2">
                           <Youtube size={16} className="text-[#FF0000]" /> 유튜브 채널 / 영상
                         </Label>
                         {coachProfile.socialMedia?.youtube && (
                           <a href={coachProfile.socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-chapter-accent flex items-center gap-1 hover:underline">
                             <ExternalLink size={10} /> 미리보기
                           </a>
                         )}
                       </div>
                       <Input 
                        value={coachProfile.socialMedia?.youtube || ''}
                        onChange={(e) => setCoachProfile((prev: any) => ({ ...prev, socialMedia: { ...prev.socialMedia, youtube: e.target.value } }))}
                        placeholder="https://youtube.com/..." 
                        className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold px-6"
                       />
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                         <Label className="text-xs font-black text-slate uppercase flex items-center gap-2">
                           <Instagram size={16} className="text-[#E4405F]" /> 인스타그램 프로필
                         </Label>
                         {coachProfile.socialMedia?.instagram && (
                           <a href={coachProfile.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-chapter-accent flex items-center gap-1 hover:underline">
                             <ExternalLink size={10} /> 미리보기
                           </a>
                         )}
                       </div>
                       <Input 
                        value={coachProfile.socialMedia?.instagram || ''}
                        onChange={(e) => setCoachProfile((prev: any) => ({ ...prev, socialMedia: { ...prev.socialMedia, instagram: e.target.value } }))}
                        placeholder="https://instagram.com/..." 
                        className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold px-6"
                       />
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                         <Label className="text-xs font-black text-slate uppercase flex items-center gap-2">
                           <SmartphoneIcon className="h-4 w-4 text-black" /> 틱톡 프로필
                         </Label>
                         {coachProfile.socialMedia?.tiktok && (
                           <a href={coachProfile.socialMedia.tiktok} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-chapter-accent flex items-center gap-1 hover:underline">
                             <ExternalLink size={10} /> 미리보기
                           </a>
                         )}
                       </div>
                       <Input 
                        value={coachProfile.socialMedia?.tiktok || ''}
                        onChange={(e) => setCoachProfile((prev: any) => ({ ...prev, socialMedia: { ...prev.socialMedia, tiktok: e.target.value } }))}
                        placeholder="https://tiktok.com/@..." 
                        className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold px-6"
                       />
                    </div>
                  </div>

                  <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex gap-4">
                    <div className="shrink-0 mt-0.5">
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-amber-700">{labels.mediaPolicyHeader}</p>
                      <p className="text-[11px] font-bold text-amber-800/60 leading-relaxed">
                        {labels.mediaPolicyBody}
                      </p>
                    </div>
                  </div>
                </CardContent>
             </Card>
          </TabsContent>
        </Tabs>

        {/* Reflection Notification */}
        <div className="p-8 bg-chapter-accent/5 rounded-[48px] border border-chapter-accent/10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-chapter-accent/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
          <div className="w-20 h-20 bg-white rounded-[28px] shadow-sm flex items-center justify-center shrink-0 border border-chapter-accent/10 relative z-10">
            <CheckCircle2 className="h-10 w-10 text-chapter-accent" />
          </div>
          <div className="space-y-2 text-center md:text-left relative z-10">
            <h4 className="text-2xl font-black text-obsidian tracking-tighter">{labels.syncHeader}</h4>
            <p className="text-slate/70 font-medium text-sm leading-relaxed max-w-lg">
              {labels.syncBody}
            </p>
          </div>
        </div>
      </div>
    </PartnerLayout>
  );
}

function SmartphoneIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <path d="M12 18h.01" />
    </svg>
  );
}
