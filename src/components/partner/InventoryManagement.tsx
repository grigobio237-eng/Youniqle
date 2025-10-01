'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  TrendingDown,
  Edit,
  Save,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface InventoryItem {
  productId: string;
  productName: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  minStock: number;
  maxStock: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstocked';
  productStatus: string;
  category: string;
  image: string;
}

interface InventoryStats {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  overstocked: number;
  totalValue: number;
}

const statusLabels = {
  in_stock: '재고 충분',
  low_stock: '재고 부족',
  out_of_stock: '품절',
  overstocked: '재고 과다'
};

const statusColors = {
  in_stock: 'bg-green-100 text-green-800',
  low_stock: 'bg-yellow-100 text-yellow-800',
  out_of_stock: 'bg-red-100 text-red-800',
  overstocked: 'bg-blue-100 text-blue-800'
};

export default function InventoryManagement() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editData, setEditData] = useState<{
    adjustment: string;
    reason: string;
    minStock: string;
    maxStock: string;
  }>({
    adjustment: '',
    reason: '',
    minStock: '',
    maxStock: ''
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/partner/inventory', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setInventory(data.inventory || []);
        setStats(data.stats);
      } else {
        toast.error('재고 정보 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('재고 조회 오류:', error);
      toast.error('재고 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item.productId);
    setEditData({
      adjustment: '',
      reason: '',
      minStock: item.minStock.toString(),
      maxStock: item.maxStock.toString()
    });
  };

  const handleSave = async (productId: string) => {
    try {
      const adjustment = editData.adjustment ? parseInt(editData.adjustment) : undefined;
      const minStock = parseInt(editData.minStock);
      const maxStock = parseInt(editData.maxStock);

      if (isNaN(minStock) || isNaN(maxStock) || minStock < 0 || maxStock < 0) {
        toast.error('유효한 숫자를 입력해주세요.');
        return;
      }

      if (minStock > maxStock) {
        toast.error('최소 재고는 최대 재고보다 작아야 합니다.');
        return;
      }

      const response = await fetch(`/api/partner/inventory/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          adjustment,
          reason: editData.reason || '파트너 조정',
          minStock,
          maxStock
        }),
      });

      if (response.ok) {
        toast.success('재고가 업데이트되었습니다.');
        setEditingItem(null);
        fetchInventory();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || '재고 업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('재고 업데이트 오류:', error);
      toast.error('재고 업데이트 중 오류가 발생했습니다.');
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setEditData({
      adjustment: '',
      reason: '',
      minStock: '',
      maxStock: ''
    });
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h2 className="text-2xl font-bold">재고 관리</h2>
        <p className="text-gray-600">상품 재고 현황을 모니터링하고 관리하세요</p>
      </div>

      {/* 통계 카드 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">총 상품</p>
                  <p className="text-2xl font-bold">{stats.totalProducts}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">재고 충분</p>
                  <p className="text-2xl font-bold text-green-600">{stats.inStock}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">재고 부족</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">품절</p>
                  <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 필터 및 검색 */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="상품명으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">전체 상태</option>
          <option value="in_stock">재고 충분</option>
          <option value="low_stock">재고 부족</option>
          <option value="out_of_stock">품절</option>
          <option value="overstocked">재고 과다</option>
        </select>
        <Button onClick={fetchInventory} variant="outline">
          새로고침
        </Button>
      </div>

      {/* 재고 목록 */}
      <div className="space-y-4">
        {filteredInventory.map((item) => (
          <Card key={item.productId}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-medium">{item.productName}</h3>
                    <p className="text-sm text-gray-600">{item.category}</p>
                    <Badge className={statusColors[item.status]}>
                      {statusLabels[item.status]}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* 재고 정보 */}
                  <div className="text-right">
                    <p className="text-sm text-gray-600">현재 재고</p>
                    <p className="font-medium">{item.currentStock}개</p>
                    <p className="text-sm text-gray-600">
                      예약: {item.reservedStock}개 | 가용: {item.availableStock}개
                    </p>
                  </div>

                  {/* 재고 설정 */}
                  {editingItem === item.productId ? (
                    <div className="flex items-center gap-2">
                      <div className="text-sm">
                        <Label htmlFor={`adjustment-${item.productId}`}>조정량</Label>
                        <Input
                          id={`adjustment-${item.productId}`}
                          type="number"
                          value={editData.adjustment}
                          onChange={(e) => setEditData(prev => ({ ...prev, adjustment: e.target.value }))}
                          placeholder="+/- 수량"
                          className="w-20"
                        />
                      </div>
                      <div className="text-sm">
                        <Label htmlFor={`minStock-${item.productId}`}>최소</Label>
                        <Input
                          id={`minStock-${item.productId}`}
                          type="number"
                          value={editData.minStock}
                          onChange={(e) => setEditData(prev => ({ ...prev, minStock: e.target.value }))}
                          className="w-16"
                        />
                      </div>
                      <div className="text-sm">
                        <Label htmlFor={`maxStock-${item.productId}`}>최대</Label>
                        <Input
                          id={`maxStock-${item.productId}`}
                          type="number"
                          value={editData.maxStock}
                          onChange={(e) => setEditData(prev => ({ ...prev, maxStock: e.target.value }))}
                          className="w-16"
                        />
                      </div>
                      <Button size="sm" onClick={() => handleSave(item.productId)}>
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancel}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-right">
                      <p className="text-sm text-gray-600">재고 설정</p>
                      <p className="text-sm">
                        최소: {item.minStock}개 | 최대: {item.maxStock}개
                      </p>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                        <Edit className="h-4 w-4 mr-1" />
                        수정
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredInventory.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">검색 조건에 맞는 상품이 없습니다.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


