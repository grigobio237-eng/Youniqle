'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Store,
  Bell,
  Search,
  Warehouse
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import CharacterImage from '@/components/ui/CharacterImage';

interface PartnerLayoutProps {
  children: ReactNode;
}

interface Partner {
  id: string;
  email: string;
  name: string;
  role: string;
  partnerStatus: string;
  businessName?: string;
  commissionRate: number;
  partnerStats?: {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    totalCommission: number;
  };
  avatar?: string;
}

const navigationItems = [
  {
    name: '대시보드',
    href: '/partner/dashboard',
    icon: LayoutDashboard,
    description: '매출 통계 및 현황'
  },
  {
    name: '상품 관리',
    href: '/partner/products',
    icon: Package,
    description: '내 상품 등록 및 관리'
  },
  {
    name: '주문 관리',
    href: '/partner/orders',
    icon: ShoppingCart,
    description: '주문 처리 및 배송 관리'
  },
  {
    name: '재고 관리',
    href: '/partner/inventory',
    icon: Warehouse,
    description: '상품 재고 현황 및 관리'
  },
  {
    name: '콘텐츠 관리',
    href: '/partner/content',
    icon: FileText,
    description: '커뮤니티 글 및 동영상'
  },
  {
    name: '매출 분석',
    href: '/partner/analytics',
    icon: BarChart3,
    description: '상세 매출 분석'
  },
  {
    name: '설정',
    href: '/partner/settings',
    icon: Settings,
    description: '파트너 설정'
  }
];

export default function PartnerLayout({ children }: PartnerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkPartnerAuth();
  }, []);

  const checkPartnerAuth = async () => {
    try {
      const response = await fetch('/api/partner/auth/verify');
      
      if (response.ok) {
        const data = await response.json();
        setPartner(data.partner);
      } else {
        // 파트너 권한이 없으면 로그인 페이지로 리다이렉트
        router.push('/partner/login');
      }
    } catch (error) {
      console.error('Partner auth check failed:', error);
      router.push('/partner/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/partner/auth/logout', { method: 'POST' });
      setPartner(null);
      router.push('/partner/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // 검색 기능 구현 (추후 확장)
      console.log('Search:', searchQuery);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="h-8 w-8 text-secondary animate-spin" />
          </div>
          <p className="text-text-secondary">파트너 권한 확인 중...</p>
        </div>
      </div>
    );
  }

  if (!partner) {
    return null; // 리다이렉트 중
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b">
            <Link href="/partner/dashboard" className="flex items-center space-x-3">
              <div className="relative h-8 w-8">
                <CharacterImage
                  src="/character/youniqle-4.png"
                  alt="파트너 로고"
                  fill
                  className="object-contain"
                  sizes="32px"
                />
              </div>
              <div>
                <span className="text-lg font-bold text-text-primary">Partner</span>
                <div className="text-xs text-text-secondary">grigobio.co.kr</div>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Partner Info */}
          <div className="p-4 border-b bg-secondary/5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                {partner.avatar ? (
                  <img 
                    src={partner.avatar} 
                    alt={partner.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <Store className="h-5 w-5 text-secondary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {partner.name}
                </p>
                <p className="text-xs text-text-secondary truncate">
                  {partner.businessName || partner.email}
                </p>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                수수료 {partner.commissionRate}%
              </Badge>
              <Badge variant="default" className="text-xs">
                파트너
              </Badge>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-secondary text-white'
                      : 'text-text-secondary hover:text-text-primary hover:bg-gray-100'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <div className="flex-1">
                    <div>{item.name}</div>
                    <div className={`text-xs ${
                      isActive ? 'text-white/80' : 'text-text-secondary'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-text-secondary hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-5 w-5 mr-3" />
              로그아웃
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="bg-white border-b px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              {/* Search */}
              <form onSubmit={handleSearch} className="hidden sm:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="파트너 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </form>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
                >
                  5
                </Badge>
              </Button>

              {/* Partner Stats */}
              <div className="hidden sm:flex items-center space-x-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-text-primary">
                    {partner.partnerStats?.totalProducts || 0}
                  </div>
                  <div className="text-xs text-text-secondary">상품</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-text-primary">
                    {partner.partnerStats?.totalOrders || 0}
                  </div>
                  <div className="text-xs text-text-secondary">주문</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-primary">
                    ₩{(partner.partnerStats?.totalRevenue || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-text-secondary">매출</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}



