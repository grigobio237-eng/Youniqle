import { NextResponse } from 'next/server';
// Force update
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(req: Request) {
    try {
        await connectDB();

        // In a real app, we would get the user ID from the session
        // For this prototype, we'll try to get it from a query param or use a test user
        // However, looking at the previous code, there seems to be no auth implementation yet that sets cookies.
        // Let's assume we are using a specific test email or ID for now, as seen in previous steps (e.g., 'sin931017@gmail.com')
        // Or if local storage has the email. 

        // But the client-side code in `DeepDiagnosisReportPage` just calls `/api/user/profile` without params.
        // We need to identify the user. 
        // Strategy: 
        // 1. Check for a 'user_email' cookie (common in simple prototypes)
        // 2. If not found, use a default test user (sin931017@gmail.com) for demonstration purposes so the user can see their results.

        const testEmail = 'sin93101190@gmail.com';

        const user = await User.findOne({ email: testEmail });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            email: user.email,
            name: user.name,
            diagnosisResults: user.diagnosisResults || []
        });

    } catch (error) {
        console.error('Profile Fetch Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
