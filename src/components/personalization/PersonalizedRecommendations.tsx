'use client';

import { useState, useEffect } from 'react';
import { usePersonalization } from '@/hooks/usePersonalization';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, ThumbsUp, ThumbsDown, ShoppingCart, Eye } from 'lucide-react';

interface PersonalizedRecommendationsProps {
  title?: string;
  itemType?: 'product' | 'content' | 'category' | 'brand';
  limit?: number;
  algorithms?: string[];
  showAlgorithm?: boolean;
  showReason?: boolean;
  onItemClick?: (item: any) => void;
  onItemPurchase?: (item: any) => void;
}

export default function PersonalizedRecommendations({
  title = '당신을 위한 추천',
  itemType = 'product',
  limit = 6,
  algorithms = ['collaborative', 'content_based', 'popular'],
  showAlgorithm = false,
  showReason = true,
  onItemClick,
  onItemPurchase
}: PersonalizedRecommendationsProps) {
  const { 
    recommendations, 
    loading, 
    error, 
    generateRecommendations,
    recordRecommendationFeedback 
  } = usePersonalization();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    generateRecommendations({
      itemType,
      limit,
      algorithms
    });
  }, [itemType, limit, algorithms, generateRecommendations]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await generateRecommendations({
      itemType,
      limit,
      algorithms
    });
    setRefreshing(false);
  };

  const handleItemClick = async (item: any) => {
    if (onItemClick) {
      onItemClick(item);
    }
    
    // 클릭 피드백 기록
    await recordRecommendationFeedback(
      item.itemId,
      'positive',
      true,
      false
    );
  };

  const handleItemPurchase = async (item: any) => {
    if (onItemPurchase) {
      onItemPurchase(item);
    }
    
    // 구매 피드백 기록
    await recordRecommendationFeedback(
      item.itemId,
      'positive',
      true,
      true
    );
  };

  const handleFeedback = async (itemId: string, feedback: 'positive' | 'negative') => {
    await recordRecommendationFeedback(itemId, feedback);
  };

  if (loading && recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {title}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              새로고침
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">추천을 생성하는 중...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {title}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              다시 시도
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={handleRefresh} disabled={refreshing}>
              다시 시도
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {title}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              새로고침
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">추천할 상품이 없습니다</p>
            <Button onClick={handleRefresh} disabled={refreshing}>
              새로고침
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
        </CardTitle>
        <CardDescription>
          AI가 분석한 당신의 취향에 맞는 상품들입니다
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((item, index) => (
            <div
              key={`${item.itemId}_${index}`}
              className="group relative border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleItemClick(item)}
            >
              {/* 상품 이미지 (더미) */}
              <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                <div className="text-gray-400 text-sm">상품 이미지</div>
              </div>

              {/* 상품 정보 */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm line-clamp-2">
                  {item.itemType === 'product' ? `상품 ${item.itemId}` : 
                   item.itemType === 'content' ? `콘텐츠 ${item.itemId}` :
                   item.itemType === 'category' ? `카테고리 ${item.itemId}` :
                   `브랜드 ${item.itemId}`}
                </h4>

                {/* 추천 점수 */}
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${item.score * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {(item.score * 100).toFixed(0)}%
                  </span>
                </div>

                {/* 추천 이유 */}
                {showReason && (
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {item.reason}
                  </p>
                )}

                {/* 알고리즘 태그 */}
                {showAlgorithm && (
                  <Badge variant="outline" className="text-xs">
                    {item.algorithm}
                  </Badge>
                )}

                {/* 액션 버튼들 */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFeedback(item.itemId, 'positive');
                      }}
                    >
                      <ThumbsUp className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFeedback(item.itemId, 'negative');
                      }}
                    >
                      <ThumbsDown className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleItemClick(item);
                      }}
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleItemPurchase(item);
                      }}
                    >
                      <ShoppingCart className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* 호버 효과 */}
              <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
            </div>
          ))}
        </div>

        {/* 더 많은 추천 보기 */}
        {recommendations.length >= limit && (
          <div className="text-center mt-6">
            <Button variant="outline" onClick={handleRefresh}>
              더 많은 추천 보기
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}













