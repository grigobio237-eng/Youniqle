'use client';

import { useState, useEffect } from 'react';
import PartnerLayout from '@/components/partner/PartnerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    MessageSquare,
    Search,
    Filter,
    Clock,
    CheckCircle,
    User,
    Send,
    RefreshCw,
    ChevronRight,
    AlertCircle,
    MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface CustomerInquiry {
    _id: string;
    customerName: string;
    customerEmail: string;
    subject: string;
    message: string;
    status: 'pending' | 'in_progress' | 'resolved';
    createdAt: string;
    productName?: string;
    orderNumber?: string;
    replies: Array<{
        message: string;
        sentAt: string;
        sentBy: 'partner' | 'customer';
    }>;
}

const statusLabels = {
    pending: '답변 대기',
    in_progress: '처리 중',
    resolved: '해결됨'
};

const statusColors = {
    pending: 'bg-primary-container/50 text-amber-800',
    in_progress: 'bg-primary-container text-blue-800',
    resolved: 'bg-green-100 text-green-800'
};

// Mock data
const mockInquiries: CustomerInquiry[] = [
    {
        _id: '1',
        customerName: '김철수',
        customerEmail: 'kim@email.com',
        subject: '상품 배송 문의',
        message: '주문한 상품의 배송이 언제 완료되나요? 주문 후 3일이 지났는데 아직 배송 정보가 없습니다.',
        status: 'pending',
        createdAt: new Date().toISOString(),
        orderNumber: 'ORD-2024012301',
        replies: []
    },
    {
        _id: '2',
        customerName: '이영희',
        customerEmail: 'lee@email.com',
        subject: '상품 교환 요청',
        message: '사이즈가 맞지 않아 교환을 원합니다. 어떻게 진행하면 될까요?',
        status: 'in_progress',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        productName: '프리미엄 코치 상품',
        replies: [
            {
                message: '안녕하세요, 교환 요청 접수되었습니다. 택배 수거 예정입니다.',
                sentAt: new Date(Date.now() - 43200000).toISOString(),
                sentBy: 'partner'
            }
        ]
    },
    {
        _id: '3',
        customerName: '박민수',
        customerEmail: 'park@email.com',
        subject: '상품 문의',
        message: '이 상품은 어떤 재질로 만들어졌나요?',
        status: 'resolved',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        productName: '힐링 명상 키트',
        replies: [
            {
                message: '안녕하세요! 해당 상품은 천연 소재로 제작되었습니다.',
                sentAt: new Date(Date.now() - 86400000).toISOString(),
                sentBy: 'partner'
            },
            {
                message: '감사합니다! 구매 결정에 도움이 되었어요.',
                sentAt: new Date(Date.now() - 72000000).toISOString(),
                sentBy: 'customer'
            }
        ]
    }
];

function CustomerInquiryManagement() {
    const [inquiries, setInquiries] = useState<CustomerInquiry[]>(mockInquiries);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedInquiry, setSelectedInquiry] = useState<CustomerInquiry | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [replyMessage, setReplyMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    const fetchInquiries = async () => {
        setLoading(true);
        // API call would go here
        setTimeout(() => setLoading(false), 500);
    };

    const filteredInquiries = inquiries.filter(inquiry => {
        const matchesSearch =
            inquiry.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inquiry.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inquiry.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleViewInquiry = (inquiry: CustomerInquiry) => {
        setSelectedInquiry(inquiry);
        setIsDialogOpen(true);
        setReplyMessage('');
    };

    const handleSendReply = async () => {
        if (!selectedInquiry || !replyMessage.trim()) return;

        setIsSending(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update inquiry with new reply
        const updatedInquiries = inquiries.map(inquiry => {
            if (inquiry._id === selectedInquiry._id) {
                return {
                    ...inquiry,
                    status: 'in_progress' as const,
                    replies: [...inquiry.replies, {
                        message: replyMessage,
                        sentAt: new Date().toISOString(),
                        sentBy: 'partner' as const
                    }]
                };
            }
            return inquiry;
        });

        setInquiries(updatedInquiries);
        setSelectedInquiry(updatedInquiries.find(i => i._id === selectedInquiry._id) || null);
        setReplyMessage('');
        setIsSending(false);
        toast.success('답변이 전송되었습니다.');
    };

    const handleUpdateStatus = async (inquiryId: string, newStatus: CustomerInquiry['status']) => {
        const updatedInquiries = inquiries.map(inquiry => {
            if (inquiry._id === inquiryId) {
                return { ...inquiry, status: newStatus };
            }
            return inquiry;
        });
        setInquiries(updatedInquiries);
        setSelectedInquiry(updatedInquiries.find(i => i._id === inquiryId) || null);
        toast.success('상태가 변경되었습니다.');
    };

    const stats = {
        total: inquiries.length,
        pending: inquiries.filter(i => i.status === 'pending').length,
        inProgress: inquiries.filter(i => i.status === 'in_progress').length,
        resolved: inquiries.filter(i => i.status === 'resolved').length
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">고객 문의 관리</h1>
                    <p className="text-obsidian mt-1">고객들의 문의사항을 확인하고 답변하세요</p>
                </div>
                <Button onClick={fetchInquiries} variant="outline" className="rounded-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    새로고침
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-md">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-foreground/70">전체 문의</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <MessageSquare className="h-8 w-8 text-foreground/70" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-md bg-amber-50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-primary">답변 대기</p>
                                <p className="text-2xl font-bold text-amber-800">{stats.pending}</p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-primary" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-md bg-blue-50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-primary">처리 중</p>
                                <p className="text-2xl font-bold text-blue-800">{stats.inProgress}</p>
                            </div>
                            <MessageCircle className="h-8 w-8 text-primary" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-md bg-green-50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700">해결됨</p>
                                <p className="text-2xl font-bold text-green-800">{stats.resolved}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-md">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/70 h-4 w-4" />
                                <Input
                                    placeholder="고객명, 제목, 이메일로 검색..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 rounded-full"
                                />
                            </div>
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="상태 필터" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">전체</SelectItem>
                                <SelectItem value="pending">답변 대기</SelectItem>
                                <SelectItem value="in_progress">처리 중</SelectItem>
                                <SelectItem value="resolved">해결됨</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Inquiry List */}
            <div className="space-y-4">
                {loading ? (
                    <Card className="border-0 shadow-md">
                        <CardContent className="p-12 text-center">
                            <RefreshCw className="h-8 w-8 animate-spin text-foreground/70 mx-auto mb-4" />
                            <p className="text-foreground/70">문의를 불러오는 중...</p>
                        </CardContent>
                    </Card>
                ) : filteredInquiries.length === 0 ? (
                    <Card className="border-0 shadow-md">
                        <CardContent className="p-12 text-center">
                            <MessageSquare className="h-12 w-12 text-foreground/70 mx-auto mb-4" />
                            <p className="text-foreground/70">검색 조건에 맞는 문의가 없습니다.</p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredInquiries.map((inquiry) => (
                        <Card
                            key={inquiry._id}
                            className={`border-0 shadow-md cursor-pointer hover:shadow-lg transition-all ${inquiry.status === 'pending' ? 'border-l-4 border-l-amber-500' : ''
                                }`}
                            onClick={() => handleViewInquiry(inquiry)}
                        >
                            <CardContent className="p-6">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Badge className={statusColors[inquiry.status]}>
                                                {statusLabels[inquiry.status]}
                                            </Badge>
                                            {inquiry.replies.length > 0 && (
                                                <span className="text-xs text-foreground/70">
                                                    {inquiry.replies.length}개 답변
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-semibold text-lg">{inquiry.subject}</h3>
                                        <p className="text-obsidian text-sm line-clamp-2 mt-1">{inquiry.message}</p>
                                        <div className="flex items-center gap-4 mt-3 text-sm text-foreground/70">
                                            <span className="flex items-center gap-1">
                                                <User className="h-4 w-4" />
                                                {inquiry.customerName}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                {new Date(inquiry.createdAt).toLocaleDateString('ko-KR')}
                                            </span>
                                            {inquiry.orderNumber && (
                                                <span className="text-primary">주문 #{inquiry.orderNumber}</span>
                                            )}
                                            {inquiry.productName && (
                                                <span className="text-secondary">{inquiry.productName}</span>
                                            )}
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-foreground/70 hidden lg:block" />
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Inquiry Detail Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{selectedInquiry?.subject}</DialogTitle>
                        <DialogDescription>
                            {selectedInquiry?.customerName} ({selectedInquiry?.customerEmail})
                        </DialogDescription>
                    </DialogHeader>

                    {selectedInquiry && (
                        <div className="flex-1 overflow-y-auto space-y-4">
                            {/* Status Change */}
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-foreground/70">상태:</span>
                                <Select
                                    value={selectedInquiry.status}
                                    onValueChange={(value) => handleUpdateStatus(selectedInquiry._id, value as CustomerInquiry['status'])}
                                >
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">답변 대기</SelectItem>
                                        <SelectItem value="in_progress">처리 중</SelectItem>
                                        <SelectItem value="resolved">해결됨</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Original Message */}
                            <div className="bg-surface rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <User className="h-4 w-4 text-foreground/70" />
                                    <span className="font-medium">{selectedInquiry.customerName}</span>
                                    <span className="text-xs text-foreground/70">
                                        {new Date(selectedInquiry.createdAt).toLocaleString('ko-KR')}
                                    </span>
                                </div>
                                <p className="text-obsidian whitespace-pre-wrap">{selectedInquiry.message}</p>
                                {selectedInquiry.orderNumber && (
                                    <p className="text-sm text-primary mt-2">주문번호: {selectedInquiry.orderNumber}</p>
                                )}
                                {selectedInquiry.productName && (
                                    <p className="text-sm text-secondary mt-1">관련 상품: {selectedInquiry.productName}</p>
                                )}
                            </div>

                            {/* Replies */}
                            {selectedInquiry.replies.map((reply, index) => (
                                <div
                                    key={index}
                                    className={`rounded-xl p-4 ${reply.sentBy === 'partner'
                                            ? 'bg-blue-50 ml-8'
                                            : 'bg-surface mr-8'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-medium">
                                            {reply.sentBy === 'partner' ? '나' : selectedInquiry.customerName}
                                        </span>
                                        <span className="text-xs text-foreground/70">
                                            {new Date(reply.sentAt).toLocaleString('ko-KR')}
                                        </span>
                                    </div>
                                    <p className="text-obsidian whitespace-pre-wrap">{reply.message}</p>
                                </div>
                            ))}

                            {/* Reply Input */}
                            <div className="space-y-3 pt-4 border-t">
                                <Textarea
                                    placeholder="답변을 입력하세요..."
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                    rows={4}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="pt-4 border-t">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            닫기
                        </Button>
                        <Button
                            onClick={handleSendReply}
                            disabled={!replyMessage.trim() || isSending}
                        >
                            {isSending ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    전송 중...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    답변 전송
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function PartnerCustomerInquiryPage() {
    return (
        <PartnerLayout>
            <CustomerInquiryManagement />
        </PartnerLayout>
    );
}
