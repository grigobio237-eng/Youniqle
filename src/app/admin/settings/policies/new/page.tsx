'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Save, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';

// react-quill-new은 SSR 환경(Next.js)에서 document 객체 오류를 뿜을 수 있으므로 클라이언트 로드 처리
const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false, 
  loading: () => <div className="h-96 w-full flex items-center justify-center bg-gray-50 border rounded-xl animate-pulse text-gray-400 font-bold">에디터를 불러오는 중입니다...</div>
});
import 'react-quill-new/dist/quill.snow.css';

function PolicyEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editType = searchParams.get('type');
  
  const [loading, setLoading] = useState(editType ? true : false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    type: editType || '',
    title: searchParams.get('title') || '',
    content: '',
    isRequired: false
  });

  // 에디터 툴바 활성화 항목
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'clean']
    ]
  };

  useEffect(() => {
    if (editType) {
      // 기존에 존재하는 타입의 경우 (새 버전 갱신), 이전 내용을 불러온다
      fetchExistingPolicy(editType);
    }
  }, [editType]);

  const fetchExistingPolicy = async (type: string) => {
    try {
      const res = await fetch(`/api/admin/policies/${type}`, { credentials: 'include' });
      if (!res.ok) throw new Error();
      const json = await res.json();
      if (json.success && json.data.policy) {
        setFormData({
           type: json.data.policy.type,
           title: json.data.policy.title,
           content: json.data.policy.content,
           isRequired: json.data.policy.isRequired,
        });
      }
    } catch (err) {
      toast.error('기존 정책 내용을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.type.trim() || !formData.title.trim() || !formData.content.trim()) {
      toast.error('식별 코드, 약관명, 에디터 내용은 모두 필수입니다.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      
      const json = await res.json();
      
      if (res.ok && json.success) {
        toast.success(json.message);
        router.push('/admin/settings/policies');
      } else {
        throw new Error(json.error?.message || '저장 실패');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild className="mr-4 h-10 w-10 shrink-0">
            <Link href="/admin/settings/policies">
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              {editType ? '새로운 버전 발급' : '신규 약관 생성'}
            </h1>
            <p className="text-gray-500 mt-1">
              {editType 
                ? '워드(Word)에서 수정된 최신 버전을 붙여넣고 저장하면 버전이 자동으로 스펙업됩니다.'
                : '새로 필요한 동의서나 약관을 타입에 맞게 생성할 수 있습니다.'
              }
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={loading || saving} className="bg-indigo-600 hover:bg-indigo-700 h-12 px-6 rounded-xl font-bold">
          {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
          저장하고 실시간 반영
        </Button>
      </div>

      <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-3">
               <Label className="text-sm font-bold text-gray-700">식별 코드 (Type) <span className="text-red-500">*</span></Label>
               <Input 
                 placeholder="예: EVENT_CONSENT" 
                 value={formData.type}
                 onChange={(e) => setFormData({...formData, type: e.target.value.toUpperCase()})}
                 disabled={!!editType} // 수정 시 타입 변경 불가
                 className="h-12 uppercase font-mono bg-gray-50 text-gray-800 rounded-xl"
               />
               {!editType && (
                 <p className="text-xs text-gray-500 font-medium flex items-center">
                   <Info className="w-3 h-3 mr-1" /> 영문자와 언더바(_)만 사용. 시스템이 이 코드로 프론트엔드와 연결합니다.
                 </p>
               )}
             </div>

             <div className="space-y-3">
               <Label className="text-sm font-bold text-gray-700">약관 표시명 <span className="text-red-500">*</span></Label>
               <Input 
                 placeholder="예: 2026 프로모션 수집동의서" 
                 value={formData.title}
                 onChange={(e) => setFormData({...formData, title: e.target.value})}
                 className="h-12 rounded-xl"
               />
             </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-orange-50 border border-orange-100 rounded-xl">
             <Checkbox 
                id="isRequired" 
                checked={formData.isRequired}
                onCheckedChange={(c) => setFormData({...formData, isRequired: !!c})}
                className="w-5 h-5 rounded-md border-orange-300 text-orange-600 focus:ring-orange-600"
             />
             <Label htmlFor="isRequired" className="text-sm font-bold text-orange-900 cursor-pointer flex-1">
                이 항목을 "필수 동의" 문서로 취급합니다. (체크 해제 시 "선택 동의"로 취급)
             </Label>
          </div>

          <div className="space-y-3 pt-2">
             <div className="flex justify-between items-end">
               <Label className="text-sm font-bold text-gray-700">내용 에디터 <span className="text-red-500">*</span></Label>
               <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">WYSIWYG Word 호환</span>
             </div>
             
             {loading ? (
                <div className="h-96 w-full flex items-center justify-center bg-gray-50 border rounded-xl">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
             ) : (
                <div className="bg-white rounded-xl overflow-hidden [&_.ql-toolbar]:rounded-t-xl [&_.ql-toolbar]:border-gray-200 [&_.ql-toolbar]:bg-gray-50/50 [&_.ql-container]:rounded-b-xl [&_.ql-container]:border-gray-200 [&_.ql-container]:text-base [&_.ql-editor]:min-h-[500px]">
                  <ReactQuill 
                    theme="snow" 
                    value={formData.content} 
                    onChange={(val) => setFormData({...formData, content: val})} 
                    modules={modules}
                    placeholder="워드 등에서 복사한 내용을 붙여넣으세요..."
                  />
                </div>
             )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewPolicyPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center"><Loader2 className="w-8 h-8 mx-auto animate-spin" /></div>}>
      <PolicyEditor />
    </Suspense>
  );
}
