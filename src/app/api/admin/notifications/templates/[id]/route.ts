import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NotificationTemplateEngine } from '@/lib/notificationTemplateEngine';
import { connectDB } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
      
      if (user.role !== 'admin' && user.role !== 'superadmin') {
        return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
      }
    } catch (error) {
      return NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 401 });
    }
    
    const { id } = await params;
    const template = await NotificationTemplateEngine.getTemplate(id);
    
    return NextResponse.json(template);
  } catch (error) {
    console.error('Get notification template error:', error);
    if (error instanceof Error && error.message === 'Template not found') {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Failed to fetch notification template' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // 관리자 토큰 검증 (쿠키 방식)
    const token = request.cookies.get('admin-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: '인증 토큰이 필요합니다.' }, { status: 401 });
    }

    let decoded: any;
    try {
      const jwt = require('jsonwebtoken');
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
      
      if (!decoded || decoded.type !== 'admin') {
        return NextResponse.json({ error: '유효하지 않은 관리자 토큰입니다.' }, { status: 401 });
      }

      // 관리자 권한 확인
      const User = (await import('@/models/User')).default;
      const user = await User.findById(decoded.id);
      
      if (user.role !== 'admin' && user.role !== 'superadmin') {
        return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
      }
    } catch (error) {
      return NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 401 });
    }
    
    const { id } = await params;
    const updateData = await request.json();
    
    const template = await NotificationTemplateEngine.updateTemplate(id, {
      ...updateData,
      updatedBy: decoded.id || decoded.email || ''
    });
    
    return NextResponse.json(template);
  } catch (error) {
    console.error('Update notification template error:', error);
    if (error instanceof Error && error.message === 'Template not found') {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Failed to update notification template' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
      
      if (user.role !== 'admin' && user.role !== 'superadmin') {
        return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
      }
    } catch (error) {
      return NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 401 });
    }
    
    const { id } = await params;
    const success = await NotificationTemplateEngine.deleteTemplate(id);
    
    if (!success) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Delete notification template error:', error);
    if (error instanceof Error && error.message.includes('active schedules')) {
      return NextResponse.json(
        { error: 'Cannot delete template with active schedules' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to delete notification template' },
      { status: 500 }
    );
  }
}
