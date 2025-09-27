'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Star, Gift, Crown, Zap } from 'lucide-react';
import { modalState, MEMBERSHIP_MODAL_ID } from '@/lib/modal-state';

interface MembershipInfoProps {
  currentGrade: string;
  currentPoints: number;
}

const gradeInfo = {
  cedar: {
    name: 'CEDAR',
    emoji: '🌲',
    color: 'amber',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    description: '새싹이 돋아나는 첫 걸음',
    benefits: [
      '기본 포인트 적립 (1%)',
      '무료 배송 (5만원 이상)',
      '회원 전용 혜택',
    ],
    nextGrade: 'ROOTER',
    requiredPoints: 0, // CEDAR는 시작 등급이므로 0
  },
  rooter: {
    name: 'ROOTER',
    emoji: '🌱',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    description: '뿌리를 내리며 성장하는 단계',
    benefits: [
      '포인트 적립 (1.5%)',
      '무료 배송 (3만원 이상)',
      '생일 쿠폰',
      '회원 전용 상품',
    ],
    nextGrade: 'BLOOMER',
    requiredPoints: 5000,
  },
  bloomer: {
    name: 'BLOOMER',
    emoji: '🌺',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    description: '꽃을 피우며 아름다워지는 단계',
    benefits: [
      '포인트 적립 (2%)',
      '무료 배송 (2만원 이상)',
      '생일 쿠폰 + 특별 선물',
      '우선 주문 처리',
      '회원 전용 이벤트',
    ],
    nextGrade: 'GLOWER',
    requiredPoints: 15000,
  },
  glower: {
    name: 'GLOWER',
    emoji: '🌸',
    color: 'pink',
    bgColor: 'bg-pink-100',
    textColor: 'text-pink-800',
    description: '빛을 발하며 눈부신 단계',
    benefits: [
      '포인트 적립 (2.5%)',
      '무료 배송 (1만원 이상)',
      'VIP 고객 서비스',
      '신상품 우선 구매',
      '개인 맞춤 상품 추천',
    ],
    nextGrade: 'ECOSOUL',
    requiredPoints: 50000,
  },
  ecosoul: {
    name: 'ECOSOUL',
    emoji: '🌿',
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    description: '자연과 하나된 최고의 단계',
    benefits: [
      '포인트 적립 (3%)',
      '무료 배송 (전체)',
      'VIP 전용 라운지',
      '신상품 최우선 구매',
      '개인 상담 서비스',
      '특별 이벤트 초대',
    ],
    nextGrade: null,
    requiredPoints: null,
  },
};

export default function MembershipInfo({ currentGrade, currentPoints }: MembershipInfoProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const currentInfo = gradeInfo[currentGrade as keyof typeof gradeInfo] || gradeInfo.cedar;

  // 컴포넌트가 마운트되었는지 확인
  useEffect(() => {
    setMounted(true);
    
    // 컴포넌트 언마운트 시 모달 상태 정리
    return () => {
      modalState.closeModal(MEMBERSHIP_MODAL_ID);
    };
  }, []);

  // 모달이 열릴 때 body 스크롤 막기
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // 모달 열기/닫기 함수들
  const handleOpenModal = () => {
    if (!isOpen && modalState.openModal(MEMBERSHIP_MODAL_ID)) {
      setIsOpen(true);
    }
  };

  const handleCloseModal = () => {
    if (isOpen) {
      setIsOpen(false);
      modalState.closeModal(MEMBERSHIP_MODAL_ID);
    }
  };

  // 다음 등급까지의 진행률 계산
  const getNextGradeInfo = (grade: string) => {
    const gradeKeys = Object.keys(gradeInfo);
    const currentIndex = gradeKeys.indexOf(grade);
    if (currentIndex < gradeKeys.length - 1) {
      return gradeInfo[gradeKeys[currentIndex + 1] as keyof typeof gradeInfo];
    }
    return null;
  };
  
  const nextGradeInfo = getNextGradeInfo(currentGrade);
  const progress = nextGradeInfo && nextGradeInfo.requiredPoints
    ? Math.min((currentPoints / nextGradeInfo.requiredPoints) * 100, 100)
    : 100;

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleCloseModal();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const modalContent = isOpen && mounted ? (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleCloseModal();
        }
      }}
    >
      <Card 
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">멤버십 등급 정보</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseModal}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 현재 등급 */}
              <div className="text-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${currentInfo.bgColor}`}>
                  <span className="text-3xl">{currentInfo.emoji}</span>
                </div>
                <h3 className={`text-2xl font-bold mb-2 ${currentInfo.textColor}`}>
                  {currentInfo.name}
                </h3>
                <p className="text-gray-600 mb-4">{currentInfo.description}</p>
                <p className="text-sm text-gray-500">현재 포인트: {currentPoints.toLocaleString()}P</p>
              </div>

              {/* 다음 등급까지 진행률 */}
              {nextGradeInfo && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>다음 등급: {nextGradeInfo.name}</span>
                    <span>{currentPoints.toLocaleString()}P / {nextGradeInfo.requiredPoints?.toLocaleString()}P</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    {nextGradeInfo.requiredPoints && nextGradeInfo.requiredPoints > currentPoints
                      ? `${(nextGradeInfo.requiredPoints - currentPoints).toLocaleString()}P 더 필요`
                      : '최고 등급 달성!'
                    }
                  </p>
                </div>
              )}

              {/* 현재 등급 혜택 */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Gift className="h-4 w-4 mr-2" />
                  현재 등급 혜택
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {currentInfo.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 전체 등급 시스템 */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Crown className="h-4 w-4 mr-2" />
                  전체 등급 시스템
                </h4>
                <div className="space-y-3">
                  {Object.entries(gradeInfo).map(([grade, info]) => (
                    <div 
                      key={grade}
                      className={`p-3 rounded-lg border-2 ${
                        grade === currentGrade 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${info.bgColor}`}>
                          <span className="text-lg">{info.emoji}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className={`font-semibold ${info.textColor}`}>
                              {info.name}
                            </span>
                            {grade === currentGrade && (
                              <Badge variant="secondary" className="text-xs">
                                현재 등급
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{info.description}</p>
                          {info.requiredPoints && info.requiredPoints > 0 && (
                            <p className="text-xs text-gray-500">
                              필요 포인트: {info.requiredPoints.toLocaleString()}P
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 포인트 적립 안내 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center">
                  <Zap className="h-4 w-4 mr-2" />
                  포인트 적립 방법
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>• 상품 구매</div>
                  <div>• 상품 리뷰 작성</div>
                  <div>• 댓글 작성</div>
                  <div>• 로그인 (일일)</div>
                  <div>• 이벤트 참여</div>
                  <div>• 친구 추천</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
  ) : null;

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full"
        onClick={handleOpenModal}
        disabled={isOpen}
      >
        등급 혜택 보기
      </Button>

      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}
