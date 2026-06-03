'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

interface TodoItem {
    id: string;
    text: string;
    completed: boolean;
}

export default function TodoPage() {
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [newTodo, setNewTodo] = useState('');

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTodos = async () => {
            try {
                const response = await fetch('/api/user/todo');
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.tasks) {
                        setTodos(data.tasks);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch todos:', error);
                // Fallback to localStorage if API fails
                const saved = localStorage.getItem('todo_list');
                if (saved) setTodos(JSON.parse(saved));
            } finally {
                setIsLoading(false);
            }
        };
        fetchTodos();
    }, []);

    const saveTodos = async (newTodos: TodoItem[]) => {
        setTodos(newTodos);
        // 1. Save to localStorage for instant feedback
        localStorage.setItem('todo_list', JSON.stringify(newTodos));
        
        // 2. Sync with DB
        try {
            await fetch('/api/user/todo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tasks: newTodos })
            });
        } catch (error) {
            console.error('Failed to sync todos with DB:', error);
        }
    };

    const addTodo = () => {
        if (newTodo.trim()) {
            const newItem: TodoItem = {
                id: Date.now().toString(),
                text: newTodo,
                completed: false,
            };
            saveTodos([...todos, newItem]);
            setNewTodo('');
        }
    };

    const toggleTodo = (id: string) => {
        saveTodos(todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)));
    };

    const deleteTodo = (id: string) => {
        saveTodos(todos.filter((todo) => todo.id !== id));
    };

    const completedCount = todos.filter((t) => t.completed).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 py-12">
            <div className="container mx-auto px-4 max-w-3xl">
                <Link href="/utils" className="inline-flex items-center text-primary hover:underline mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    돌아가기
                </Link>

                <Card className="shadow-2xl">
                    <CardHeader className="text-center">
                        <div className="mb-4 text-xl">✅</div>
                        <CardTitle className="text-3xl font-bold">할 일 관리</CardTitle>
                        <CardDescription className="text-lg">오늘의 할 일을 체크하세요</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-4 text-center">
                            <p className="text-sm text-obsidian mb-1">진행 상황</p>
                            <p className="text-3xl font-bold text-obsidian">
                                {completedCount} / {todos.length}
                            </p>
                            <p className="text-sm text-obsidian mt-1">
                                {todos.length > 0 ? `${Math.round((completedCount / todos.length) * 100)}% 완료` : '할 일을 추가하세요'}
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Input
                                value={newTodo}
                                onChange={(e) => setNewTodo(e.target.value)}
                                placeholder="새로운 할 일..."
                                onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                                className="flex-1"
                            />
                            <Button onClick={addTodo} size="lg">
                                <Plus className="h-5 w-5 mr-2" />
                                추가
                            </Button>
                        </div>

                        <div className="space-y-2">
                            {todos.length === 0 ? (
                                <div className="text-center py-12 text-foreground/70">
                                    <p className="text-lg">아직 할 일이 없습니다</p>
                                    <p className="text-sm">위에서 새로운 할 일을 추가해보세요!</p>
                                </div>
                            ) : (
                                todos.map((todo) => (
                                    <div key={todo.id} className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:shadow-md transition-shadow">
                                        <Checkbox checked={todo.completed} onCheckedChange={() => toggleTodo(todo.id)} />
                                        <span className={`flex-1 ${todo.completed ? 'line-through text-foreground/70' : ''}`}>{todo.text}</span>
                                        <Button variant="ghost" size="sm" onClick={() => deleteTodo(todo.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
