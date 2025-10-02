'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Shield,
  Bell,
  Search,
  Store,
  ShoppingCart,
  Globe
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import CharacterImage from '@/components/ui/CharacterImage';

interface AdminLayoutProps {
  children: ReactNode;
}

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  grade: string;
  avatar?: string;
}

const navigationItems = [
  {
    name: '대시보드',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    description: '전체 현황 및 통계'
  },
  {
    name: '회원 관리',
    href: '/admin/users',
    icon: Users,
    description: '사용자 정보 및 활동 모니터링'
  },
  {
    name: '파트너 관리',
    href: '/admin/partners',
    icon: Store,
    description: '파트너 승인 및 관리'
  },
  {
    name: '주문 관리',
    href: '/admin/orders',
    icon: ShoppingCart,
    description: '전체 주문 관리 및 처리'
  },
  {
    name: '상품 관리',
    href: '/admin/products',
    icon: Package,
    description: '상품 등록 및 관리'
  },
  {
    name: '콘텐츠 관리',
    href: '/admin/content',
    icon: FileText,
    description: '커뮤니티 글 및 동영상 관리'
  },
  {
    name: '분석',
    href: '/admin/analytics',
    icon: BarChart3,
    description: '사용자 활동 분석'
  },
  {
    name: '설정',
    href: '/admin/settings',
    icon: Settings,
    description: '시스템 설정'
  }
];

interface NotificationData {
  pendingPartners: number;
  total: number;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<NotificationData>({ pendingPartners: 0, total: 0 });
  const [language, setLanguage] = useState('ko');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAdminAuth();
  }, []);

  useEffect(() => {
    if (admin) {
      fetchNotifications();
      // 30초마다 알림 업데이트
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [admin]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/admin/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const checkAdminAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth/verify');
      
      if (response.ok) {
        const data = await response.json();
        setAdmin(data.user);
      } else {
        // 관리자 권한이 없으면 로그인 페이지로 리다이렉트
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('Admin auth check failed:', error);
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      setAdmin(null);
      router.push('/admin/login');
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

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    // 언어 변경 로직을 여기에 추가할 수 있습니다
    console.log('Language changed to:', newLanguage);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-primary animate-spin" />
          </div>
          <p className="text-text-secondary">관리자 권한 확인 중...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
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
            <Link href="/admin/dashboard" className="flex items-center space-x-3">
              <div className="relative h-8 w-8">
                <CharacterImage
                  src="/character/youniqle-1.png"
                  alt="관리자 로고"
                  fill
                  className="object-contain"
                  sizes="32px"
                />
              </div>
              <div>
                <span className="text-lg font-bold text-text-primary">Admin</span>
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

          {/* Admin Info */}
          <div className="p-4 border-b bg-primary/5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                {admin.avatar ? (
                  <img 
                    src={admin.avatar} 
                    alt={admin.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <Shield className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {admin.name}
                </p>
                <p className="text-xs text-text-secondary truncate">
                  {admin.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const isPartnersMenu = item.href === '/admin/partners';
              const showNotification = isPartnersMenu && notifications.pendingPartners > 0;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:text-text-primary hover:bg-gray-100'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="relative">
                    <Icon className="h-5 w-5" />
                    {showNotification && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-[20px]"
                      >
                        {notifications.pendingPartners}
                      </Badge>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span>{item.name}</span>
                      {showNotification && (
                        <Badge 
                          variant="destructive" 
                          className={`text-xs ${
                            isActive ? 'bg-red-500 text-white' : 'bg-red-500 text-white'
                          }`}
                        >
                          {notifications.pendingPartners}
                        </Badge>
                      )}
                    </div>
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

          {/* Language Selection */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-3 mb-3">
              <Globe className="h-4 w-4 text-text-secondary" />
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="flex-1 text-sm bg-transparent border-none outline-none text-text-secondary focus:text-text-primary"
              >
                <option value="ko">한국어</option>
                <option value="en">English</option>
                <option value="zh">中文</option>
              </select>
            </div>
            
            {/* Logout */}
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
        {/* Mobile menu button */}
        <div className="lg:hidden p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
