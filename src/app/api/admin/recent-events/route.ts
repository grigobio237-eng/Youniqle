import { NextResponse } from 'next/server';

// Stub API to prevent 520 errors from unknown frontend calls
export async function GET() {
    return NextResponse.json({
        events: [],
        message: "This is a stub API endpoint to prevent errors."
    });
}
