import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NotificationI18n } from '@/lib/notificationI18n';
import { connectDB } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; language: string }> }
) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id: templateId, language } = await params;
    
    if (!NotificationI18n.isLanguageSupported(language)) {
      return NextResponse.json(
        { error: 'Unsupported language' },
        { status: 400 }
      );
    }
    
    const translation = await NotificationI18n.getTemplateTranslation(templateId, language);
    
    if (!translation) {
      return NextResponse.json({ error: 'Translation not found' }, { status: 404 });
    }
    
    return NextResponse.json(translation);
  } catch (error) {
    console.error('Get template translation error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template translation' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; language: string }> }
) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id: templateId, language } = await params;
    const translation = await request.json();
    
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
    
    return NextResponse.json({ message: 'Translation updated successfully' });
  } catch (error) {
    console.error('Update template translation error:', error);
    return NextResponse.json(
      { error: 'Failed to update template translation' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; language: string }> }
) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id: templateId, language } = await params;
    
    if (!NotificationI18n.isLanguageSupported(language)) {
      return NextResponse.json(
        { error: 'Unsupported language' },
        { status: 400 }
      );
    }
    
    // MongoDB에서 번역 삭제
    const mongoose = await import('mongoose');
    if (!mongoose.default.connection.db) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      );
    }
    const collection = mongoose.default.connection.db.collection('notification_translations');
    await collection.deleteOne({ templateId, language });
    
    return NextResponse.json({ message: 'Translation deleted successfully' });
  } catch (error) {
    console.error('Delete template translation error:', error);
    return NextResponse.json(
      { error: 'Failed to delete template translation' },
      { status: 500 }
    );
  }
}
