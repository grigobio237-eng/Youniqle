'use client';

import InquiryList from '@/components/admin/InquiryList';

export default function AdminInquiriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">문의 관리</h1>
          <p className="text-obsidian mt-1">고객 문의를 관리하고 답변하세요</p>
        </div>
      </div>

      <InquiryList />
    </div>
  );
}

