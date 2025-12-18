import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Message from '@/models/Message';
import User from '@/models/User';
import dbConnect from '@/lib/db';

// GET: Fetch chat history
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Get current user ID
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check subscription
        // if (user.role !== 'admin' && user.subscription?.status !== 'active') { // Admin always allowed
        //     return NextResponse.json({ error: 'Subscription required' }, { status: 403 });
        // }

        // Find messages between user and admin (or Director Kim)
        // Assuming Director Kim is an admin or a specific user. 
        // For simplicity, let's assume we are chatting with an Admin. 
        // In a real scenario, we might want to specify which admin we are chatting with.
        // Here we fetch all messages where the user is sender OR receiver.
        const messages = await Message.find({
            $or: [
                { senderId: user._id },
                { receiverId: user._id }
            ]
        })
            .sort({ createdAt: 1 })
            .limit(50); // Limit to last 50 messages

        return NextResponse.json({ messages });

    } catch (error) {
        console.error('Chat history error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Send a message + Generate AI Response
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { content, type = 'text' } = await req.json();

        await dbConnect();

        const user = await User.findOne({ email: session.user.email });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Find Admin/Director
        const director = await User.findOne({ role: 'admin' });
        const receiverId = director ? director._id : user._id; // Fallback to self for testing

        // 1. Save User Message
        const newMessage = await Message.create({
            senderId: user._id,
            receiverId: receiverId,
            content,
            type,
            read: false
        });

        // 2. Generate AI Response (Director Kim)
        let aiMessage = null;
        try {
            // Check if message should be replied by AI (e.g. if receiver is director/admin)
            // For now, ALWAYS reply if user is not admin
            if (user.role !== 'admin') {
                const GeminiAIEngine = (await import('@/lib/ai/gemini-engine')).GeminiAIEngine;

                // Fetch user name and grade for context
                const userName = user.name || '회원님';
                const userGrade = user.subscription?.status === 'active' ? 'Premium' : 'Standard';

                const aiResponseText = await GeminiAIEngine.generateChatResponse(content, {
                    userName,
                    grade: userGrade
                });

                // Save AI Message
                aiMessage = await Message.create({
                    senderId: receiverId, // AI speaks as Director
                    receiverId: user._id,
                    content: aiResponseText,
                    type: 'text',
                    read: false
                });
            }
        } catch (aiError) {
            console.error('AI Response Generation Error:', aiError);
            // Don't fail the request if AI fails, just return user message
        }

        return NextResponse.json({
            userMessage: newMessage,
            aiMessage: aiMessage
        });

    } catch (error) {
        console.error('Send message error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
