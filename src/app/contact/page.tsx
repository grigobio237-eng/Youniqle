'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Mail, User, FileText, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ContactPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    type: '',
    subject: '',
    content: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.userName || !formData.userEmail || !formData.type || !formData.subject || !formData.content) {
      setSubmitMessage(t('contact.fillAllFields'));
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const inquiryId = `inquiry-${Date.now()}`;
      
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inquiryId,
          userName: formData.userName,
          userEmail: formData.userEmail,
          type: formData.type,
          subject: formData.subject,
          content: formData.content,
          source: 'website'
        }),
      });

      const data = await response.json();

      if (data.success) {
        // n8n 워크플로우 트리거
        try {
          await fetch('http://localhost:5678/webhook/inquiry-monitor', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inquiryId,
              userName: formData.userName,
              userEmail: formData.userEmail,
              type: formData.type,
              subject: formData.subject,
              content: formData.content,
              source: 'webhook'
            }),
          });
          console.log('n8n 워크플로우 트리거 성공');
        } catch (error) {
          console.error('n8n 워크플로우 트리거 실패:', error);
        }

        setSubmitMessage(t('contact.submitSuccess'));
        setFormData({
          userName: '',
          userEmail: '',
          type: '',
          subject: '',
          content: ''
        });
      } else {
        setSubmitMessage(t('contact.submitFailed', { error: data.error }));
      }
    } catch (error) {
      console.error('문의 접수 오류:', error);
      setSubmitMessage(t('contact.submitError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-surface py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-obsidian mb-4">{t('contact.title')}</h1>
          <p className="text-obsidian">
            {t('contact.subtitle')}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              {t('contact.formTitle')}
            </CardTitle>
            <CardDescription>
              {t('contact.formDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="userName" className="block text-sm font-medium text-obsidian mb-2">
                    <User className="h-4 w-4 inline mr-1" />
                    {t('contact.name')} *
                  </label>
                  <Input
                    id="userName"
                    type="text"
                    value={formData.userName}
                    onChange={(e) => handleInputChange('userName', e.target.value)}
                    placeholder={t('contact.namePlaceholder')}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="userEmail" className="block text-sm font-medium text-obsidian mb-2">
                    <Mail className="h-4 w-4 inline mr-1" />
                    {t('contact.email')} *
                  </label>
                  <Input
                    id="userEmail"
                    type="email"
                    value={formData.userEmail}
                    onChange={(e) => handleInputChange('userEmail', e.target.value)}
                    placeholder={t('contact.emailPlaceholder')}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-obsidian mb-2">
                  {t('contact.type')} *
                </label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('contact.typePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">{t('contact.general')}</SelectItem>
                    <SelectItem value="delivery">{t('contact.delivery')}</SelectItem>
                    <SelectItem value="payment">{t('contact.payment')}</SelectItem>
                    <SelectItem value="product">{t('contact.product')}</SelectItem>
                    <SelectItem value="technical">{t('contact.technical')}</SelectItem>
                    <SelectItem value="refund">{t('contact.refund')}</SelectItem>
                    <SelectItem value="partnership">{t('contact.partnership')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-obsidian mb-2">
                  <FileText className="h-4 w-4 inline mr-1" />
                  {t('contact.subject')} *
                </label>
                <Input
                  id="subject"
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder={t('contact.subjectPlaceholder')}
                  required
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-obsidian mb-2">
                  {t('contact.content')} *
                </label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder={t('contact.contentPlaceholder')}
                  rows={6}
                  required
                />
              </div>

              {submitMessage && (
                <div className={`p-4 rounded-md ${
                  submitMessage.includes('성공') 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  <div className="flex items-center">
                    {submitMessage.includes('성공') ? (
                      <CheckCircle className="h-5 w-5 mr-2" />
                    ) : (
                      <MessageCircle className="h-5 w-5 mr-2" />
                    )}
                    {submitMessage}
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? t('contact.submitting') : t('contact.submit')}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-foreground/70">
          <p>{t('contact.responseTime')}</p>
          <p>{t('contact.urgentContact')}</p>
        </div>
      </div>
    </div>
  );
}
