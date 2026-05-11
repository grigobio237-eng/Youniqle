import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import AiRoutineLog from '@/models/AiRoutineLog';
import { getKSTDate } from '@/lib/date';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const userId = (session.user as any).id;
        const { taskId, slot, isCompleted } = await req.json();
        const todayStr = getKSTDate();

        await dbConnect();

        // Find the log for today
        const log = await AiRoutineLog.findOne({ userId, date: todayStr });
        if (!log) return NextResponse.json({ error: 'Log not found' }, { status: 404 });

        // Update the specific routine's completedTasks
        const routineIndex = log.routines.findIndex((r: any) => r.slot === slot);
        if (routineIndex === -1) return NextResponse.json({ error: 'Routine slot not found' }, { status: 404 });

        const currentCompleted = log.routines[routineIndex].completedTasks || [];
        let newCompleted = [...currentCompleted];

        if (isCompleted) {
            if (!newCompleted.includes(taskId)) newCompleted.push(taskId);
        } else {
            newCompleted = newCompleted.filter(id => id !== taskId);
        }

        // Use direct update to avoid potential race conditions or version errors
        await AiRoutineLog.updateOne(
            { userId, date: todayStr, 'routines.slot': slot },
            { 
                $set: { [`routines.${routineIndex}.completedTasks`]: newCompleted }
            }
        );

        return NextResponse.json({ success: true, completedTasks: newCompleted });

    } catch (error: any) {
        console.error('Routine completion update error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
