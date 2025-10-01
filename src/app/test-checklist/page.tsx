'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, Circle, ExternalLink } from 'lucide-react';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: string;
  url?: string;
}

const checklistItems: ChecklistItem[] = [
  // 기본 기능
  {
    id: 'homepage',
    title: '홈페이지 로드',
    description: '메인 페이지가 정상적으로 표시되고 상품 목록이 보임',
    category: '기본 기능',
    url: '/'
  },
  {
    id: 'auth-signup',
    title: '회원가입',
    description: '새 사용자 계정 생성 가능',
    category: '기본 기능',
    url: '/auth/signup'
  },
  {
    id: 'auth-signin',
    title: '로그인',
    description: '기존 사용자 로그인 가능',
    category: '기본 기능',
    url: '/auth/signin'
  },
  
  // 파트너 시스템
  {
    id: 'partner-apply',
    title: '파트너 신청',
    description: '일반 사용자가 마이페이지에서 파트너 신청 가능',
    category: '파트너 시스템',
    url: '/me'
  },
  {
    id: 'admin-partners',
    title: '관리자 파트너 관리',
    description: '관리자가 파트너 신청을 승인/거부 가능',
    category: '파트너 시스템',
    url: '/admin/partners'
  },
  {
    id: 'partner-login',
    title: '파트너 로그인',
    description: '승인된 파트너가 전용 로그인 페이지로 접근 가능',
    category: '파트너 시스템',
    url: '/partner/login'
  },
  {
    id: 'partner-dashboard',
    title: '파트너 대시보드',
    description: '파트너 전용 대시보드에서 통계 및 현황 확인',
    category: '파트너 시스템',
    url: '/partner/dashboard'
  },
  {
    id: 'partner-products',
    title: '파트너 상품 관리',
    description: '파트너가 상품 등록, 수정, 삭제 가능',
    category: '파트너 시스템',
    url: '/partner/products'
  },
  
  // 이미지 업로드
  {
    id: 'image-upload',
    title: '이미지 업로드',
    description: 'Vercel Blob에 이미지 파일 업로드 가능',
    category: '이미지 관리',
    url: '/partner/products'
  },
  {
    id: 'image-delete',
    title: '이미지 삭제',
    description: '업로드된 이미지 파일 삭제 가능',
    category: '이미지 관리',
    url: '/partner/products'
  },
  
  // 데이터베이스
  {
    id: 'mongodb-partner',
    title: 'MongoDB 파트너 데이터',
    description: '파트너 관련 데이터가 MongoDB에 정상 저장됨',
    category: '데이터베이스'
  },
  {
    id: 'mongodb-products',
    title: 'MongoDB 상품 데이터',
    description: '파트너 상품 정보가 MongoDB에 정상 저장됨',
    category: '데이터베이스'
  }
];

export default function TestChecklistPage() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleItem = (itemId: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(itemId)) {
      newChecked.delete(itemId);
    } else {
      newChecked.add(itemId);
    }
    setCheckedItems(newChecked);
  };

  const getCategoryItems = (category: string) => {
    return checklistItems.filter(item => item.category === category);
  };

  const getProgress = (category: string) => {
    const items = getCategoryItems(category);
    const checked = items.filter(item => checkedItems.has(item.id));
    return {
      completed: checked.length,
      total: items.length,
      percentage: Math.round((checked.length / items.length) * 100)
    };
  };

  const categories = [...new Set(checklistItems.map(item => item.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/10 via-background to-primary/10 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            ✅ 파트너 시스템 검증 체크리스트
          </h1>
          <p className="text-text-secondary text-lg">
            각 항목을 테스트하고 완료된 항목에 체크하세요
          </p>
        </div>

        <div className="grid gap-6">
          {categories.map(category => {
            const progress = getProgress(category);
            
            return (
              <Card key={category} className="shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{category}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant={progress.percentage === 100 ? "default" : "secondary"}>
                        {progress.completed}/{progress.total} 완료
                      </Badge>
                      <div className="text-sm text-text-secondary">
                        {progress.percentage}%
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-secondary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getCategoryItems(category).map(item => (
                      <div key={item.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                        <Checkbox
                          checked={checkedItems.has(item.id)}
                          onCheckedChange={() => toggleItem(item.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{item.title}</h4>
                            {item.url && (
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="h-6 px-2"
                              >
                                <a 
                                  href={item.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs"
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  테스트
                                </a>
                              </Button>
                            )}
                          </div>
                          <p className="text-sm text-text-secondary mt-1">
                            {item.description}
                          </p>
                        </div>
                        {checkedItems.has(item.id) && (
                          <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-6 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">전체 진행률</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary mb-2">
                {Math.round((checkedItems.size / checklistItems.length) * 100)}%
              </div>
              <p className="text-text-secondary">
                {checkedItems.size} / {checklistItems.length} 항목 완료
              </p>
              <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
                <div 
                  className="bg-secondary h-4 rounded-full transition-all duration-500"
                  style={{ width: `${(checkedItems.size / checklistItems.length) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}














