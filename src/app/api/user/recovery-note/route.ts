import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import RecoveryNote from '@/models/RecoveryNote';
import { getKSTDate } from '@/lib/date';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const userId = (session.user as any).id;
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '10');

        await dbConnect();
        
        const notes = await RecoveryNote.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit);

        return NextResponse.json(notes);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const userId = (session.user as any).id;
        const { content, mood } = await req.json();
        const date = getKSTDate();

        await dbConnect();

        const newNote = await RecoveryNote.create({
            userId,
            date,
            content,
            mood,
            createdAt: new Date()
        });

        return NextResponse.json(newNote);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
