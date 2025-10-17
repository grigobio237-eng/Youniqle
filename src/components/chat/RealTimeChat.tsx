'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Send, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system' | 'error';
  content: string;
  timestamp: string;
}

export default function RealTimeChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 프로덕션 환경에서는 WebSocket 연결 비활성화
    if (process.env.NODE_ENV === 'production') {
      console.log('Real-time chat disabled in production environment');
      setIsConnected(false);
      return;
    }

    // WebSocket 연결 (개발 환경에서만)
    const connectWebSocket = () => {
      try {
        const ws = new WebSocket('ws://localhost:3001/api/chat/websocket');
        
        ws.onopen = () => {
          console.log('WebSocket 연결됨');
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          console.log('메시지 수신:', event.data);
          
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'connection') {
              setMessages(prev => [...prev, {
                id: Date.now().toString(),
                type: 'system',
                content: data.content,
                timestamp: data.timestamp
              }]);
            } else if (data.type === 'ai_response') {
              setMessages(prev => [...prev, {
                id: Date.now().toString(),
                type: 'ai',
                content: data.content,
                timestamp: data.timestamp
              }]);
              setIsLoading(false);
            } else if (data.type === 'error') {
              setMessages(prev => [...prev, {
                id: Date.now().toString(),
                type: 'error',
                content: data.content,
                timestamp: data.timestamp
              }]);
              setIsLoading(false);
            }
          } catch (error) {
            console.error('JSON 파싱 오류:', error);
            // JSON 파싱 실패 시 단순 문자열로 처리
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              type: 'ai',
              content: event.data.toString(),
              timestamp: new Date().toISOString()
            }]);
            setIsLoading(false);
          }
        };

        ws.onclose = () => {
          console.log('WebSocket 연결 해제됨');
          setIsConnected(false);
          // 3초 후 재연결 시도
          setTimeout(connectWebSocket, 3000);
        };

        ws.onerror = (error) => {
          console.error('WebSocket 오류:', error);
          setIsConnected(false);
        };

        wsRef.current = ws;
      } catch (error) {
        console.error('WebSocket 연결 실패:', error);
        setIsConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!inputMessage.trim() || !wsRef.current || !isConnected) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // WebSocket으로 메시지 전송
    wsRef.current.send(JSON.stringify({
      content: inputMessage,
      userName: '사용자',
      userEmail: 'user@example.com'
    }));

    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          실시간 AI 채팅
          <div className={`ml-auto w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`} />
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : message.type === 'ai'
                    ? 'bg-gray-100 text-gray-900'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                <div className="flex items-start gap-2">
                  {message.type === 'ai' && <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                  {message.type === 'user' && <User className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                  <div>
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* 입력 영역 */}
        <div className="flex-shrink-0 p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              disabled={!isConnected || isLoading}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || !isConnected || isLoading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {isConnected ? '연결됨' : '연결 중...'} • Enter로 전송
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
