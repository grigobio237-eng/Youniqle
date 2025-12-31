import { NextResponse } from 'next/server';
import { getFirebaseStorageInstance } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log('[Debug Upload] Testing storage access...');
        const storage = getFirebaseStorageInstance();
        const bucket = storage.bucket();

        const testFile = bucket.file('test-connection.txt');
        await testFile.save('Connection test from Next.js at ' + new Date().toISOString(), {
            metadata: { contentType: 'text/plain' }
        });

        console.log('[Debug Upload] Upload success!');
        return NextResponse.json({
            success: true,
            message: 'Firebase Storage upload test successful!',
            bucket: bucket.name
        });
    } catch (error: any) {
        console.error('[Debug Upload] FAILED:', error.message);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack,
            response: error.response?.data
        }, { status: 500 });
    }
}
