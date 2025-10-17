import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NotificationTemplateEngine } from '@/lib/notificationTemplateEngine';
import { connectDB } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // 관리자 토큰 검증 (쿠키 방식)
    const token = request.cookies.get('admin-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: '인증 토큰이 필요합니다.' }, { status: 401 });
    }

    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      
      if (!decoded || decoded.type !== 'admin') {
        return NextResponse.json({ error: '유효하지 않은 관리자 토큰입니다.' }, { status: 401 });
      }

      // 관리자 권한 확인
      const User = (await import('@/models/User')).default;
      const user = await User.findById(decoded.id);
      
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
      }
    } catch (error) {
      return NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type') || undefined;
    const category = searchParams.get('category') || undefined;
    const status = searchParams.get('status') || undefined;
    const language = searchParams.get('language') || undefined;
    const tags = searchParams.get('tags')?.split(',') || undefined;
    const search = searchParams.get('search') || undefined;
    
    const filters = {
      type,
      category,
      status,
      language,
      tags,
      search
    };
    
    const result = await NotificationTemplateEngine.getTemplates(filters, page, limit);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Get notification templates error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // 관리자 토큰 검증 (쿠키 방식)
    const token = request.cookies.get('admin-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: '인증 토큰이 필요합니다.' }, { status: 401 });
    }

    let user: any;
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      
      if (!decoded || decoded.type !== 'admin') {
        return NextResponse.json({ error: '유효하지 않은 관리자 토큰입니다.' }, { status: 401 });
      }

      // 관리자 권한 확인
      const User = (await import('@/models/User')).default;
      user = await User.findById(decoded.id);
      
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
      }
    } catch (error) {
      return NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 401 });
    }
    
    const templateData = await request.json();
    
    // 필수 필드 검증
    if (!templateData.name || !templateData.type || !templateData.category || !templateData.title || !templateData.content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const template = await NotificationTemplateEngine.createTemplate({
      ...templateData,
      createdBy: user._id.toString(),
      updatedBy: user._id.toString()
    });
    
    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Create notification template error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create notification template', 
        details: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
}
