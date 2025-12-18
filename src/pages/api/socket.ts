import { NextApiRequest, NextApiResponse } from 'next';
import { Server as NetServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '@/models/User';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userType?: 'user' | 'partner' | 'admin';
  isAuthenticated?: boolean;
}

interface NotificationData {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'order' | 'payment' | 'shipping' | 'promotion' | 'system';
  title: string;
  message: string;
  data?: any;
  actions?: Array<{
    label: string;
    action: string;
    url?: string;
  }>;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expiresAt?: Date;
  createdAt: Date;
}

class WebSocketServer {
  private io: SocketIOServer;
  private connectedUsers: Map<string, AuthenticatedSocket> = new Map();

  constructor(server: NetServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production'
          ? process.env.FRONTEND_URL
          : "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

        if (!decoded.userId) {
          return next(new Error('Invalid token'));
        }

        const user = await User.findById(decoded.userId);
        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = decoded.userId;
        socket.userType = decoded.type || 'user';
        socket.isAuthenticated = true;

        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User ${socket.userId} connected via WebSocket`);

      if (socket.userId) {
        this.connectedUsers.set(socket.userId, socket);
        this.joinUserRooms(socket);
      }

      socket.on('subscribe_notifications', (data) => {
        this.subscribeToNotifications(socket, data);
      });

      socket.on('unsubscribe_notifications', (data) => {
        this.unsubscribeFromNotifications(socket, data);
      });

      socket.on('mark_notification_read', (notificationId) => {
        this.markNotificationAsRead(socket, notificationId);
      });

      socket.on('handle_notification_action', (data) => {
        this.handleNotificationAction(socket, data);
      });

      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected from WebSocket`);
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
          this.leaveUserRooms(socket);
        }
      });

      socket.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      // --- Chat Events ---
      socket.on('join_chat', () => {
        if (socket.userId) {
          socket.join(`chat_user_${socket.userId}`);
          console.log(`User ${socket.userId} joined chat`);
        }
      });

      socket.on('send_chat_message', async (data) => {
        try {
          const { content, receiverId } = data;
          if (!socket.userId) return;

          // 1. Save to DB
          // Dynamic import to avoid build issues in pages/api
          const Message = (await import('@/models/Message')).default;

          // If receiver is not specified, assume admin/director
          let finalReceiverId = receiverId;
          if (!finalReceiverId) {
            const User = (await import('@/models/User')).default;
            const director = await User.findOne({ role: 'admin' });
            finalReceiverId = director ? director._id : socket.userId;
          }

          const newMessage = await Message.create({
            senderId: socket.userId,
            receiverId: finalReceiverId,
            content,
            type: 'text',
            read: false
          });

          // 2. Emit to receiver
          this.io.to(`chat_user_${finalReceiverId}`).emit('receive_chat_message', newMessage);

          // 3. Emit to sender confirmation (optional, or just rely on optimistic UI)
          socket.emit('chat_message_sent', newMessage);

          // Also emit to admin room if it's a message to admin
          if (!receiverId || receiverId === finalReceiverId) {
            this.io.to('admin').emit('receive_chat_message', newMessage);
          }

          // --- AI Auto-Response (Director Persona) ---
          // If the message is sent TO the Director (admin/null receiver) AND the sender is NOT an admin
          if (socket.userType !== 'admin' && (!receiverId || receiverId === finalReceiverId)) {
            // Determine user context (simple for now)
            const userName = '회원님'; // Ideally fetch user name from socket.decoded or DB
            const userGrade = 'Premium';

            // Process AI response asynchronously
            (async () => {
              try {
                const GeminiAIEngine = (await import('@/lib/ai/gemini-engine')).GeminiAIEngine;

                // Simulate "typing" delay for realism (1~2 seconds)
                await new Promise(resolve => setTimeout(resolve, 1500));

                const aiResponseText = await GeminiAIEngine.generateChatResponse(content, {
                  userName,
                  grade: userGrade
                });

                // Save AI response to DB
                const aiMessage = await Message.create({
                  senderId: finalReceiverId, // AI speaks as the Director
                  receiverId: socket.userId,
                  content: aiResponseText,
                  type: 'text',
                  read: false
                });

                // Emit AI response to User
                this.io.to(`chat_user_${socket.userId}`).emit('receive_chat_message', aiMessage);

                // Also emit to admin room so real admins can see the AI replied
                this.io.to('admin').emit('receive_chat_message', aiMessage);

              } catch (aiError) {
                console.error('AI Response Error:', aiError);
              }
            })();
          }

        } catch (error) {
          console.error('Chat message error:', error);
          socket.emit('chat_error', { message: 'Failed to send message' });
        }
      });
    });
  }

  private joinUserRooms(socket: AuthenticatedSocket) {
    if (!socket.userId) return;

    socket.join(`user_${socket.userId}`);

    if (socket.userType) {
      socket.join(`type_${socket.userType}`);
    }

    socket.join('all_users');

    if (socket.userType === 'admin') {
      socket.join('admin');
    }

    if (socket.userType === 'partner') {
      socket.join('partners');
    }
  }

  private leaveUserRooms(socket: AuthenticatedSocket) {
    if (!socket.userId) return;

    socket.leave(`user_${socket.userId}`);
    if (socket.userType) {
      socket.leave(`type_${socket.userType}`);
    }
    socket.leave('all_users');
    socket.leave('admin');
    socket.leave('partners');
  }

  private subscribeToNotifications(socket: AuthenticatedSocket, data: any) {
    const { types, categories, priority } = data;

    if (types && Array.isArray(types)) {
      types.forEach((type: string) => {
        socket.join(`notification_type_${type}`);
      });
    }

    if (categories && Array.isArray(categories)) {
      categories.forEach((category: string) => {
        socket.join(`notification_category_${category}`);
      });
    }

    if (priority && Array.isArray(priority)) {
      priority.forEach((p: string) => {
        socket.join(`notification_priority_${p}`);
      });
    }
  }

  private unsubscribeFromNotifications(socket: AuthenticatedSocket, data: any) {
    const { types, categories, priority } = data;

    if (types && Array.isArray(types)) {
      types.forEach((type: string) => {
        socket.leave(`notification_type_${type}`);
      });
    }

    if (categories && Array.isArray(categories)) {
      categories.forEach((category: string) => {
        socket.leave(`notification_category_${category}`);
      });
    }

    if (priority && Array.isArray(priority)) {
      priority.forEach((p: string) => {
        socket.leave(`notification_priority_${p}`);
      });
    }
  }

  private markNotificationAsRead(socket: AuthenticatedSocket, notificationId: string) {
    console.log(`User ${socket.userId} marked notification ${notificationId} as read`);
  }

  private handleNotificationAction(socket: AuthenticatedSocket, data: any) {
    const { notificationId, action } = data;
    console.log(`User ${socket.userId} handled action ${action} for notification ${notificationId}`);
  }

  public sendToUser(userId: string, notification: NotificationData) {
    this.io.to(`user_${userId}`).emit('notification', notification);
  }

  public sendToUserType(userType: 'user' | 'partner' | 'admin', notification: NotificationData) {
    this.io.to(`type_${userType}`).emit('notification', notification);
  }

  public sendToRoom(room: string, notification: NotificationData) {
    this.io.to(room).emit('notification', notification);
  }

  public sendToAll(notification: NotificationData) {
    this.io.emit('notification', notification);
  }

  public sendToAdmins(notification: NotificationData) {
    this.io.to('admin').emit('notification', notification);
  }

  public sendToPartners(notification: NotificationData) {
    this.io.to('partners').emit('notification', notification);
  }

  public getConnectedUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  public isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  public getConnectionCount(): number {
    return this.connectedUsers.size;
  }
}

let wsServer: WebSocketServer | null = null;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if ((res.socket as any)?.server?.io) {
    console.log('Socket is already running');
    res.end();
    return;
  }

  console.log('Socket is initializing');
  const io = new SocketIOServer((res.socket as any).server, {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  (res.socket as any).server.io = io;

  wsServer = new WebSocketServer((res.socket as any).server);

  res.end();
}
