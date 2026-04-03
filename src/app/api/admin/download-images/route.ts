import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Step 1: POST - 이미지를 서버에서 ZIP으로 만들어 임시 저장
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { images, prefix } = body as {
            images: { url: string; name: string }[];
            prefix: string;
        };

        if (!images || images.length === 0) {
            return NextResponse.json({ error: 'No images provided' }, { status: 400 });
        }

        const zip = new JSZip();
        const folder = zip.folder(`${prefix}_이미지`) as JSZip;

        // Fetch all images in parallel and add to ZIP
        await Promise.all(images.map(async (img) => {
            try {
                let imageBuffer: Buffer;

                if (img.url.startsWith('data:')) {
                    // Handle base64 data URLs
                    const base64Data = img.url.split(',')[1];
                    imageBuffer = Buffer.from(base64Data, 'base64');
                } else {
                    // Handle regular URLs
                    const response = await fetch(img.url);
                    const arrayBuffer = await response.arrayBuffer();
                    imageBuffer = Buffer.from(arrayBuffer);
                }

                folder.file(img.name, imageBuffer);
                console.log(`[Server ZIP] Added: ${img.name} (${imageBuffer.length} bytes)`);
            } catch (e) {
                console.error(`[Server ZIP] Failed to add ${img.name}:`, e);
            }
        }));

        // Generate the ZIP file
        const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
        const zipFilename = `${prefix}_이미지_모음.zip`;

        // Save to temporary file in /tmp or public directory
        const tmpDir = path.join(process.cwd(), 'public', 'tmp-downloads');
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }

        // Clean up old files (older than 5 minutes)
        try {
            const files = fs.readdirSync(tmpDir);
            const now = Date.now();
            for (const file of files) {
                const filePath = path.join(tmpDir, file);
                const stats = fs.statSync(filePath);
                if (now - stats.mtimeMs > 5 * 60 * 1000) {
                    fs.unlinkSync(filePath);
                }
            }
        } catch { /* ignore cleanup errors */ }

        const fileId = uuidv4();
        const safeFilename = zipFilename.replace(/[^a-zA-Z0-9가-힣_\-.]/g, '_');
        const tmpFilePath = path.join(tmpDir, `${fileId}__${safeFilename}`);
        fs.writeFileSync(tmpFilePath, zipBuffer);

        console.log(`[Server ZIP] Saved: ${tmpFilePath} (${zipBuffer.length} bytes)`);

        // Return the download URL
        return NextResponse.json({
            downloadUrl: `/tmp-downloads/${fileId}__${safeFilename}`,
            filename: zipFilename,
            size: zipBuffer.length,
        });
    } catch (error) {
        console.error('[Server ZIP] Critical error:', error);
        return NextResponse.json(
            { error: 'Failed to generate ZIP file' },
            { status: 500 }
        );
    }
}
