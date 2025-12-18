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

// POST: Send a message (Fallback or persistence)
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

        // Assuming the receiver is the "Director" (Admin)
        // We need to find an admin user to set as receiver, or just leave it generic if using rooms?
        // But Message model requires senderId.
        // Let's find the main admin or Director.
        // For now, let's assume the first admin found is the Director.
        const director = await User.findOne({ role: 'admin' });
        // If no admin, maybe we can't send? Or self-message for testing.
        const receiverId = director ? director._id : user._id; // Fallback to self if no admin (for testing)

        const newMessage = await Message.create({
            senderId: user._id,
            receiverId: receiverId,
            content,
            type,
            read: false
        });

        return NextResponse.json({ message: newMessage });

    } catch (error) {
        console.error('Send message error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
