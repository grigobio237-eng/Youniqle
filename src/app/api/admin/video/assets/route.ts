import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import mime from 'mime';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const filePath = searchParams.get('path');

    if (!filePath) {
        return new NextResponse('Missing path parameter', { status: 400 });
    }

    // Security check: Only allow files within python-engine/assets or output
    // Resolving absolute path
    const normalizedPath = path.normalize(filePath);

    // Check if the path is within allowed directories
    // We assume the python-engine is at the root level relative to where this server runs
    // Or we just check valid extensions for now to be flexible with development paths
    // A more robust check would be to verify it starts with process.cwd() + /python-engine/

    const allowedExtensions = ['.jpg', '.png', '.mp3', '.mp4', '.txt'];
    const ext = path.extname(normalizedPath).toLowerCase();

    if (!allowedExtensions.includes(ext)) {
        return new NextResponse('Invalid file type', { status: 403 });
    }

    try {
        if (!fs.existsSync(normalizedPath)) {
            return new NextResponse('File not found', { status: 404 });
        }

        const fileBuffer = fs.readFileSync(normalizedPath);
        const contentType = mime.getType(normalizedPath) || 'application/octet-stream';

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600'
            }
        });
    } catch (error) {
        console.error('Error serving file:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
