'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp } from 'lucide-react';

const categories = [
  { name: '전체', value: '' },
  { name: '신선식품', value: 'fresh-food' },
  { name: '의류', value: 'clothing' },
  { name: '신발', value: 'shoes' },
  { name: '가방', value: 'bags' },
  { name: '액세서리', value: 'accessories' },
  { name: '생활용품', value: 'lifestyle' },
  { name: '전자제품', value: 'electronics' },
];

const sortOptions = [
  { name: '최신순', value: 'newest' },
  { name: '가격 낮은순', value: 'price_asc' },
  { name: '가격 높은순', value: 'price_desc' },
  { name: '인기순', value: 'popular' },
];

interface ProductFiltersProps {
  searchParams?: {
    q?: string;
    category?: string;
    sort?: string;
  };
}

export default function ProductFilters({ searchParams }: ProductFiltersProps) {
  const [showCategories, setShowCategories] = useState(true);
  const [showSort, setShowSort] = useState(true);

  const createFilterUrl = (key: string, value: string) => {
    const params = new URLSearchParams();
    
    // Preserve existing search params
    if (searchParams?.q) params.set('q', searchParams.q);
    if (searchParams?.category) params.set('category', searchParams.category);
    if (searchParams?.sort) params.set('sort', searchParams.sort);
    
    // Update the specific filter
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    return `/products?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">필터</h3>
      
      {/* Categories */}
      <div>
        <Button
          variant="ghost"
          className="w-full justify-between p-0 h-auto font-medium"
          onClick={() => setShowCategories(!showCategories)}
        >
          카테고리
          {showCategories ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        
        {showCategories && (
          <div className="mt-3 space-y-2">
            {categories.map((category) => (
              <Link
                key={category.value}
                href={createFilterUrl('category', category.value)}
                className="block"
              >
                <Badge
                  variant={searchParams?.category === category.value ? 'default' : 'outline'}
                  className="w-full justify-start cursor-pointer hover:bg-primary/10 transition-colors"
                >
                  {category.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Sort Options */}
      <div>
        <Button
          variant="ghost"
          className="w-full justify-between p-0 h-auto font-medium"
          onClick={() => setShowSort(!showSort)}
        >
          정렬
          {showSort ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        
        {showSort && (
          <div className="mt-3 space-y-2">
            {sortOptions.map((option) => (
              <Link
                key={option.value}
                href={createFilterUrl('sort', option.value)}
                className="block"
              >
                <Badge
                  variant={searchParams?.sort === option.value ? 'default' : 'outline'}
                  className="w-full justify-start cursor-pointer hover:bg-primary/10 transition-colors"
                >
                  {option.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Clear Filters */}
      {(searchParams?.category || searchParams?.sort) && (
        <div className="pt-4 border-t">
          <Button variant="outline" size="sm" asChild>
            <Link href="/products">필터 초기화</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

