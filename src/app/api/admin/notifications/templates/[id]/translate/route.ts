import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NotificationI18n } from '@/lib/notificationI18n';
import { connectDB } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id: templateId } = await params;
    const { sourceLanguage, targetLanguages, sourceTranslation } = await request.json();
    
    if (!sourceLanguage || !targetLanguages || !Array.isArray(targetLanguages)) {
      return NextResponse.json(
        { error: 'Source language and target languages are required' },
        { status: 400 }
      );
    }
    
    if (!NotificationI18n.isLanguageSupported(sourceLanguage)) {
      return NextResponse.json(
        { error: 'Unsupported source language' },
        { status: 400 }
      );
    }
    
    for (const targetLanguage of targetLanguages) {
      if (!NotificationI18n.isLanguageSupported(targetLanguage)) {
        return NextResponse.json(
          { error: `Unsupported target language: ${targetLanguage}` },
          { status: 400 }
        );
      }
    }
    
    await NotificationI18n.createBulkTranslations(
      templateId,
      sourceLanguage,
      sourceTranslation,
      targetLanguages
    );
    
    return NextResponse.json({ message: 'Translations created successfully' });
  } catch (error) {
    console.error('Create bulk translations error:', error);
    return NextResponse.json(
      { error: 'Failed to create bulk translations' },
      { status: 500 }
    );
  }
}















