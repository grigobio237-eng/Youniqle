'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  Star, 
  Calendar, 
  Clock, 
  Award, 
  ShieldCheck, 
  User,
  X,
  Send,
  CheckCircle2,
  Youtube,
  Instagram,
  ExternalLink,
  MessageSquare,
  BadgeCent
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export default function TrainerPage() {
  const [coaches, setCoaches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrainer, setSelectedTrainer] = useState<any | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'trainers' | 'programs'>('trainers');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    try {
      const res = await fetch('/api/coaches');
      if (res.ok) {
        const data = await res.json();
        setCoaches(data.coaches || []);
      }
    } catch (error) {
      console.error('Failed to fetch coaches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram || !selectedDate || !selectedSlot) {
      toast.error('프로그램과 날짜, 시간을 모두 선택해주세요.');
      return;
    }

    setBookingLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('코칭 예약 요청이 성공적으로 전송되었습니다.', {
        description: `${selectedTrainer?.name} 마스터가 곧 연락드릴 예정입니다.`
      });
      setIsBookingOpen(false);
      setSelectedProgram('');
      setSelectedDate('');
      setSelectedSlot('');
    } catch (error) {
      toast.error('오류가 발생했습니다.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-32">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <Badge variant="outline" className="px-4 py-1 border-obsidian/20 text-obsidian/60 font-medium tracking-[0.2em] uppercase rounded-full">
              Recovery Experts
            </Badge>
            <h1 className="font-serif text-obsidian tracking-tight text-xl md:text-4xl">
              Meet Our <br /> <span className="italic">Master Curators</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-slate font-medium leading-relaxed">
              유니클의 트레이너는 단순한 지도자가 아닌, 당신의 회복 데이터를 정밀하게 조율하는 큐레이터입니다. 
              국내외 최고 수준의 전문가그룹이 제안하는 개인화된 프로토콜을 만나보세요.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="sticky top-20 z-40 bg-[#FDFBF7]/80 backdrop-blur-md border-y border-line/10 mb-16">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <div className="flex justify-center gap-12">
            <button 
              onClick={() => setActiveTab('trainers')}
              className={`text-sm font-black uppercase tracking-widest transition-all relative py-2 ${activeTab === 'trainers' ? 'text-obsidian' : 'text-slate/40'}`}
            >
              Curators
              {activeTab === 'trainers' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-obsidian" />}
            </button>
            <button 
              onClick={() => setActiveTab('programs')}
              className={`text-sm font-black uppercase tracking-widest transition-all relative py-2 ${activeTab === 'programs' ? 'text-obsidian' : 'text-slate/40'}`}
            >
              Programs
              {activeTab === 'programs' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-obsidian" />}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4">
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-obsidian"></div>
            </div>
          ) : activeTab === 'trainers' ? (
            <motion.div 
              key="trainers-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
            >
              {coaches.length > 0 ? coaches.map((trainer) => (
                <TrainerCard 
                  key={trainer.id || trainer._id} 
                  trainer={trainer} 
                  onViewDetail={() => setSelectedTrainer(trainer)} 
                />
              )) : (
                <div className="col-span-full text-center py-20 text-slate">
                  등록된 트레이너가 없습니다.
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="programs-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {coaches.flatMap(c => (c.coachProfile?.programs || []).map((p: any) => ({ ...p, coach: c.name, coachImage: c.image }))).map((program, idx) => (
                <ProgramCard key={idx} program={program} />
              ))}
              {coaches.every(c => !c.programs || (c.coachProfile?.programs?.length === 0)) && (
                <div className="col-span-full text-center py-20 text-slate">
                  등록된 프로그램이 없습니다.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Trainer Detail Modal */}
      <AnimatePresence>
        {selectedTrainer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto py-20">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTrainer(null)}
              className="fixed inset-0 bg-obsidian/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl bg-white rounded-[40px] overflow-hidden shadow-2xl flex flex-col lg:flex-row max-h-none lg:max-h-[85vh]"
            >
              <button 
                onClick={() => setSelectedTrainer(null)}
                className="absolute top-6 right-6 z-10 p-2 bg-white/20 backdrop-blur-md rounded-full text-obsidian hover:bg-mist transition-all"
                aria-label="마스터 상세 닫기"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="lg:w-2/5 relative h-80 lg:h-auto">
                <Image 
                  src={selectedTrainer.image || '/images/trainers/placeholder.png'} 
                  alt={selectedTrainer.name} 
                  fill 
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 to-transparent lg:hidden" />
                <div className="absolute bottom-8 left-8 text-white lg:hidden">
                  <h2 className="font-serif text-4xl">{selectedTrainer.name}</h2>
                  <p className="text-sm font-black uppercase tracking-widest opacity-80">{selectedTrainer.title}</p>
                </div>
                
                <div className="absolute bottom-8 left-8 hidden lg:flex gap-3">
                  {selectedTrainer.coachProfile?.socialMedia?.youtube && (
                    <a 
                      href={selectedTrainer.coachProfile.socialMedia.youtube} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-chapter-accent transition-colors"
                      aria-label="유튜브 채널 열기"
                      title="유튜브 채널 열기"
                    >
                      <Youtube size={20} />
                    </a>
                  )}
                  {selectedTrainer.coachProfile?.socialMedia?.instagram && (
                    <a 
                      href={selectedTrainer.coachProfile.socialMedia.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-chapter-accent transition-colors"
                      aria-label="인스타그램 프로필 열기"
                      title="인스타그램 프로필 열기"
                    >
                      <Instagram size={20} />
                    </a>
                  )}
                </div>
              </div>

              <div className="lg:w-3/5 p-8 lg:p-14 overflow-y-auto space-y-12">
                <div className="hidden lg:block space-y-2">
                  <p className="text-xs font-black text-chapter-accent uppercase tracking-widest">{selectedTrainer.title}</p>
                  <h2 className="font-serif text-obsidian tracking-tight text-xl">{selectedTrainer.name}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                     <div className="space-y-4">
                      <h3 className="text-[10px] font-black text-obsidian uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-secondary" /> 코치 철학
                      </h3>
                      <p className="text-slate/80 leading-relaxed font-medium italic text-sm">
                        &quot;{selectedTrainer.description || 'The philosophy of this curator is being synthesized.'}&quot;
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black text-obsidian uppercase tracking-widest">주요 전문 분야</h3>
                      <p className="text-sm font-black text-obsidian bg-mist/30 px-4 py-3 rounded-xl border border-line/5">
                        {selectedTrainer.specialty}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black text-obsidian uppercase tracking-widest">운영 중인 코칭 프로그램</h3>
                      <div className="space-y-3">
                        {selectedTrainer.coachProfile?.programs?.length > 0 ? (
                          selectedTrainer.coachProfile.programs.map((prog: any, i: number) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-surface rounded-xl border border-line hover:border-chapter-accent/20 transition-colors group">
                               <div className="space-y-0.5">
                                 <p className="text-xs font-black text-obsidian">{prog.title}</p>
                                 <p className="text-[9px] font-bold text-slate/50">{prog.duration} / {prog.intensity}</p>
                               </div>
                               <p className="text-xs font-black text-chapter-accent">{prog.price}₩</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-[11px] font-bold text-slate/40 italic">준비된 프로그램이 없습니다.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                   <h3 className="text-[10px] font-black text-obsidian uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-chapter-accent" /> 예약 가능한 세션 (캘린더)
                  </h3>
                   <div className="bg-mist/10 p-6 rounded-[32px] border border-line/5">
                    <TrainerCalendar 
                      availability={selectedTrainer.coachProfile?.availability || []} 
                      onDateSelect={(avail) => {
                        setSelectedDate(avail.date);
                        if (!avail.isAllDay && avail.slots?.length > 0) {
                          setSelectedSlot(avail.slots[0]);
                        }
                        setIsBookingOpen(true);
                      }}
                    />
                  </div>
                </div>

                {/* Digital Feed Section */}
                <div className="space-y-8 pt-6 border-t border-line/5">
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-black text-obsidian uppercase tracking-widest flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-chapter-accent" /> Curator&apos;s Digital Feed
                    </h3>
                    <p className="text-xs font-bold text-slate/40">마스터의 최신 소셜 활동과 회복 큐레이션 영상입니다.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* YouTube Embed */}
                    {selectedTrainer.coachProfile?.socialMedia?.youtube && (
                      <div className="col-span-1 md:col-span-2 aspect-video w-full rounded-[32px] overflow-hidden border border-line/10 bg-black shadow-lg">
                        <iframe
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${getYouTubeID(selectedTrainer.coachProfile.socialMedia.youtube)}`}
                          title="YouTube video player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    )}

                    {/* Social Cards */}
                    {selectedTrainer.coachProfile?.socialMedia?.instagram && (
                      <a 
                        href={selectedTrainer.coachProfile.socialMedia.instagram} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group flex items-center gap-4 p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border border-pink-100 hover:shadow-xl transition-all hover:-translate-y-1"
                        aria-label="인스타그램 프로필 보기"
                        title="인스타그램 프로필 보기"
                      >
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-pink-500 shadow-sm group-hover:scale-110 transition-transform">
                          <Instagram size={24} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-pink-400 uppercase tracking-widest">Instagram</p>
                          <p className="text-sm font-black text-obsidian">View Profile</p>
                        </div>
                        <ExternalLink className="w-4 h-4 ml-auto text-pink-200 group-hover:text-pink-400" />
                      </a>
                    )}

                    {selectedTrainer.coachProfile?.socialMedia?.tiktok && (
                      <a 
                        href={selectedTrainer.coachProfile.socialMedia.tiktok} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group flex items-center gap-4 p-5 bg-[#fafafa] rounded-3xl border border-line hover:shadow-xl transition-all hover:-translate-y-1"
                        aria-label="틱톡 피드 보기"
                        title="틱톡 피드 보기"
                      >
                        <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.03 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 2.89 3.46 2.84 1.53-.14 2.89-1.35 3.1-2.86.04-.46.03-.93.03-1.39V.02z"/>
                          </svg>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-foreground/70 uppercase tracking-widest">TikTok</p>
                          <p className="text-sm font-black text-obsidian">View Feed</p>
                        </div>
                        <ExternalLink className="w-4 h-4 ml-auto text-slate-200 group-hover:text-foreground/70" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Booking Modal */}
      <AnimatePresence>
        {isBookingOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-10 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBookingOpen(false)}
              className="fixed inset-0 bg-obsidian/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] p-10 md:p-12 shadow-2xl space-y-8"
            >
              <div className="space-y-2">
                <Badge className="bg-chapter-accent/10 text-chapter-accent border-none font-black text-[10px] uppercase tracking-widest rounded-full px-3 py-1">
                  Reservation Form
                </Badge>
                <h2 className="font-serif text-obsidian text-4xl">Request Session</h2>
                <p className="text-slate/60 text-sm font-medium">선택하신 일정으로 {selectedTrainer?.name} 마스터에게 코칭을 의뢰합니다.</p>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="program-select" className="text-[10px] font-black text-obsidian uppercase tracking-widest ml-1">상담 프로그램 선택</label>
                    <select 
                      id="program-select"
                      value={selectedProgram}
                      onChange={(e) => setSelectedProgram(e.target.value)}
                      className="w-full h-14 bg-mist/30 border border-line/5 rounded-2xl px-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-chapter-accent/20 appearance-none transition-all"
                      aria-label="상담 프로그램 선택"
                      title="상담 프로그램 선택"
                    >
                      <option value="">프로그램을 선택해주세요</option>
                      {selectedTrainer?.coachProfile?.programs?.map((p: any, i: number) => (
                        <option key={i} value={p.title}>{p.title} ({p.price}₩)</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="date-input" className="text-[10px] font-black text-obsidian uppercase tracking-widest ml-1">예약 희망 날짜</label>
                      <input 
                        id="date-input"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full h-14 bg-mist/30 border border-line/5 rounded-2xl px-6 text-sm font-bold focus:outline-none transition-all"
                        aria-label="예약 희망 날짜 선택"
                        title="예약 희망 날짜 선택"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="slot-select" className="text-[10px] font-black text-obsidian uppercase tracking-widest ml-1">희망 시간</label>
                      {selectedDate && selectedTrainer?.coachProfile?.availability?.find((a: any) => a.date === selectedDate)?.isAllDay ? (
                        <div className="w-full h-14 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center text-[11px] font-black text-primary uppercase tracking-tighter">
                          <Star className="w-3 h-3 mr-1 fill-current" /> 전일 예약 가능
                        </div>
                      ) : (
                        <select 
                          id="slot-select"
                          value={selectedSlot}
                          onChange={(e) => setSelectedSlot(e.target.value)}
                          className="w-full h-14 bg-mist/30 border border-line/5 rounded-2xl px-6 text-sm font-bold focus:outline-none appearance-none transition-all"
                          aria-label="희망 시간 선택"
                          title="희망 시간 선택"
                        >
                          <option value="">시간 선택</option>
                          {selectedDate && selectedTrainer?.coachProfile?.availability?.find((a: any) => a.date === selectedDate)?.slots?.map((s: string) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <Button 
                    type="button"
                    variant="ghost"
                    onClick={() => setIsBookingOpen(false)}
                    className="flex-1 h-16 rounded-2xl text-slate/40 font-black text-sm uppercase tracking-widest"
                  >
                    Cancel
                  </Button>
                  <Button 
                    disabled={bookingLoading}
                    className="flex-3 h-16 rounded-2xl bg-obsidian text-white font-black text-sm uppercase tracking-widest gap-2 shadow-xl shadow-obsidian/20 hover:scale-[1.02] transform transition-all"
                  >
                    {bookingLoading ? "Sychronizing..." : "Submit Request"} <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Internal Components ---

function TrainerCalendar({ availability, onDateSelect }: { availability: any[], onDateSelect?: (avail: any) => void }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const getAvailForDay = (day: number) => {
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return availability.find(a => a.date === formattedDate);
  };

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-black text-obsidian tracking-tighter uppercase mb-0">
          {monthNames[month]} {year}
        </h4>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-mist rounded-full transition-colors" aria-label="이전 달" title="이전 달"><ChevronRight className="w-4 h-4 rotate-180" /></button>
          <button onClick={nextMonth} className="p-2 hover:bg-mist rounded-full transition-colors" aria-label="다음 달" title="다음 달"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {dayNames.map(d => (
          <div key={d} className="text-[9px] font-black text-slate/40 uppercase text-center py-2">{d}</div>
        ))}
        {calendarDays.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} className="aspect-square" />;
          
          const avail = getAvailForDay(day);
          const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;

          return (
            <div key={day} className="relative group">
              <div 
                onClick={() => avail && onDateSelect?.(avail)}
                className={`
                  aspect-square flex flex-col items-center justify-center rounded-xl text-[10px] font-black transition-all
                  ${avail 
                    ? (avail.isAllDay ? 'bg-primary text-white shadow-lg shadow-amber-500/20 cursor-pointer hover:scale-105 active:scale-95' : 'bg-obsidian text-white shadow-lg shadow-obsidian/20 cursor-pointer hover:scale-105 active:scale-95') 
                    : 'text-slate/40 hover:bg-mist/50 cursor-default'}
                  ${isToday && !avail ? 'border border-chapter-accent text-chapter-accent' : ''}
                `}
              >
                {day}
                {avail && <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-white/40" />}
              </div>

              {/* Popover */}
              {avail && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-36 pointer-events-none opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-y-0 translate-y-2 z-20">
                  <div className="bg-obsidian text-white p-3 rounded-2xl shadow-2xl text-[9px] font-medium leading-relaxed relative border border-white/10">
                    <p className="font-black mb-1 text-mist/60 border-b border-white/5 pb-1">{avail.date}</p>
                    {avail.isAllDay ? (
                      <p className="text-amber-400 font-black flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-current" /> 전일 예약 가능
                      </p>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-mist/40 font-bold uppercase tracking-tighter">Available Slots</p>
                        <ul className="flex flex-wrap gap-1">
                          {avail.slots.map((s: string) => <li key={s} className="px-1.5 py-0.5 bg-white/5 rounded-md text-white/80">• {s}</li>)}
                        </ul>
                      </div>
                    )}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-obsidian" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="flex items-center gap-4 pt-4 border-t border-line/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-obsidian" />
          <span className="text-[9px] font-black text-obsidian/40 uppercase tracking-widest">슬롯 예약</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-[9px] font-black text-obsidian/40 uppercase tracking-widest">전일 가능</span>
        </div>
      </div>
    </div>
  );
}

function TrainerCard({ trainer, onViewDetail }: { trainer: any, onViewDetail: () => void }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="group bg-white rounded-[32px] overflow-hidden border border-line/5 shadow-sm hover:shadow-xl transition-all"
    >
      <div className="relative h-64 overflow-hidden" onClick={onViewDetail}>
        <Image 
          src={trainer.image || '/images/trainers/placeholder.png'} 
          alt={trainer.name} 
          fill 
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
          <Badge className="bg-white/20 backdrop-blur-md text-white border-none px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest">
            View Detail
          </Badge>
        </div>
      </div>
      <div className="p-8 space-y-4">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-chapter-accent uppercase tracking-widest">{trainer.title}</p>
          <h3 className="text-2xl font-serif text-obsidian">{trainer.name}</h3>
        </div>
        <p className="text-sm text-slate/70 line-clamp-2 font-medium leading-relaxed">
          {trainer.description}
        </p>
        <div className="pt-4 flex items-center justify-between border-t border-line/5">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400 fill-current" />
            <span className="text-sm font-black text-obsidian">{trainer.rating}</span>
            <span className="text-xs font-bold text-slate/40">({trainer.reviews})</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onViewDetail} className="rounded-full font-black text-[10px] uppercase tracking-widest gap-2">
            Details <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function ProgramCard({ program }: { program: any }) {
  return (
    <Card className="group bg-white rounded-[40px] overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-500">
      <CardContent className="p-0">
        <div className="relative h-72 overflow-hidden">
          <Image 
            src={program.image || program.coachImage || '/images/programs/placeholder.png'} 
            alt={program.title} 
            fill 
            className="object-cover group-hover:scale-110 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
            <div className="space-y-1">
               <Badge className="bg-chapter-accent text-white border-none px-3 py-1 rounded-full text-[9px] uppercase font-black tracking-widest">
                {program.tags?.[0] || 'RECOVERY'}
               </Badge>
               <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Curated by {program.coach}</p>
            </div>
          </div>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-chapter-accent uppercase tracking-[0.2em]">{program.intensity} Session</span>
            </div>
            <h3 className="text-2xl font-serif text-obsidian leading-tight">{program.title}</h3>
          </div>
          
          <div className="flex justify-between items-center py-4 border-y border-line/5">
            <div className="flex flex-col gap-1">
               <span className="text-[9px] font-black text-slate uppercase opacity-40">Duration</span>
               <span className="text-xs font-bold text-obsidian flex items-center gap-1"><Clock className="w-3 h-3" /> {program.duration}</span>
            </div>
            <div className="flex flex-col gap-1 text-right">
               <span className="text-[9px] font-black text-slate uppercase opacity-40">Price</span>
               <span className="text-xs font-black text-chapter-accent">{program.price}₩</span>
            </div>
          </div>

          <Button variant="ghost" className="w-full h-14 rounded-2xl text-xs font-black text-obsidian uppercase tracking-[0.2em] group-hover:gap-4 transition-all gap-2 bg-mist/30">
            Reserve Session <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Helper Functions ---

function getYouTubeID(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}
