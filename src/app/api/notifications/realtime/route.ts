import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getWebSocketServer } from '@/lib/websocketServer';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    await connectDB();

    const { 
      type, 
      title, 
      message, 
      data, 
      actions, 
      priority = 'medium',
      targetType = 'user',
      targetId,
      expiresAt 
    } = await request.json();

    // 필수 필드 검증
    if (!type || !title || !message) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const wsServer = getWebSocketServer();
    if (!wsServer) {
      return NextResponse.json(
        { error: 'WebSocket 서버가 초기화되지 않았습니다.' },
        { status: 500 }
      );
    }

    const notification = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      data,
      actions,
      priority,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      createdAt: new Date()
    };

    // 대상에 따라 알림 전송
    if (targetType === 'user' && targetId) {
      wsServer.sendToUser(targetId, notification);
    } else if (targetType === 'admin') {
      wsServer.sendToAdmins(notification);
    } else if (targetType === 'partner') {
      wsServer.sendToPartners(notification);
    } else if (targetType === 'all') {
      wsServer.sendToAll(notification);
    } else {
      // 기본적으로 요청한 사용자에게 전송
      wsServer.sendToUser(decoded.userId, notification);
    }

    return NextResponse.json({
      success: true,
      data: notification,
      message: '알림이 전송되었습니다.'
    });

  } catch (error) {
    console.error('Realtime notification send error:', error);
    return NextResponse.json(
      { error: '알림 전송에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const token = request.cookies.get('admin-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: '관리자 인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.type !== 'admin') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const wsServer = getWebSocketServer();
    if (!wsServer) {
      return NextResponse.json(
        { error: 'WebSocket 서버가 초기화되지 않았습니다.' },
        { status: 500 }
      );
    }

    const connectedUsers = wsServer.getConnectedUsers();
    const connectionCount = wsServer.getConnectionCount();

    return NextResponse.json({
      success: true,
      data: {
        connectedUsers,
        connectionCount,
        isServerRunning: true
      }
    });

  } catch (error) {
    console.error('Realtime notification status error:', error);
    return NextResponse.json(
      { error: '알림 상태를 가져올 수 없습니다.' },
      { status: 500 }
    );
  }
}















