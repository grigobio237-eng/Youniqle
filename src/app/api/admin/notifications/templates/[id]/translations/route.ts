import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NotificationI18n } from '@/lib/notificationI18n';
import { connectDB } from '@/lib/db';

export async function GET(
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
    const translations = await NotificationI18n.getTemplateTranslations(templateId);
    
    return NextResponse.json(translations);
  } catch (error) {
    console.error('Get template translations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template translations' },
      { status: 500 }
    );
  }
}

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
    const { language, translation } = await request.json();
    
    if (!language || !translation) {
      return NextResponse.json(
        { error: 'Language and translation are required' },
        { status: 400 }
      );
    }
    
    if (!NotificationI18n.isLanguageSupported(language)) {
      return NextResponse.json(
        { error: 'Unsupported language' },
        { status: 400 }
      );
    }
    
    // 번역 품질 검증
    const validation = NotificationI18n.validateTranslation({
      language,
      ...translation
    });
    
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Invalid translation', details: validation.errors },
        { status: 400 }
      );
    }
    
    await NotificationI18n.createTemplateTranslation(templateId, language, translation);
    
    return NextResponse.json({ message: 'Translation created successfully' });
  } catch (error) {
    console.error('Create template translation error:', error);
    return NextResponse.json(
      { error: 'Failed to create template translation' },
      { status: 500 }
    );
  }
}













