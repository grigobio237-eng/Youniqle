import { getFirebaseStorageInstance } from './firebase-admin';
import { put } from '@vercel/blob';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

export interface UploadOptions {
    folder?: string;
    filename?: string;
    contentType?: string;
    useFirebase?: boolean; // 기본값 true로 설정 예정
}

export class StorageService {
    private static get bucket() {
        try {
            const storage = getFirebaseStorageInstance();
            if (!storage) throw new Error('Firebase Admin Storage 인스턴스를 가져올 수 없습니다.');
            return storage.bucket();
        } catch (error: any) {
            console.error('[StorageService] Bucket 획득 실패:', error.message);
            throw error;
        }
    }

    /**
     * 이미지를 WebP로 변환하고 업로드합니다.
     */
    static async uploadImage(
        buffer: Buffer,
        options: UploadOptions = {}
    ): Promise<{ url: string; filename: string; size: number }> {
        const {
            folder = 'uploads',
            filename = `${uuidv4()}.webp`,
            useFirebase = true
        } = options;

        // 1. Sharp를 이용한 WebP 변환 및 최적화
        const optimizedBuffer = await sharp(buffer)
            .webp({ quality: 85, effort: 6 })
            .toBuffer();

        const finalFilename = filename.endsWith('.webp') ? filename : `${filename.split('.')[0]}.webp`;
        const filePath = `${folder}/${finalFilename}`;

        if (useFirebase) {
            // 2. Firebase Storage 업로드
            const file = this.bucket.file(filePath);
            const downloadToken = uuidv4(); // 고유 다운로드 토큰 생성 (uuidv4로 통일)

            // 파일 저장 시 메타데이터(다운로드 토큰)를 한 번에 설정
            await file.save(optimizedBuffer, {
                metadata: {
                    contentType: 'image/webp',
                    cacheControl: 'public, max-age=31536000',
                    metadata: {
                        firebaseStorageDownloadTokens: downloadToken
                    }
                }
            });

            // 파일을 공개 상태로 전환
            await file.makePublic();

            // Firebase Storage 정식 URL 반환 (토큰 포함하여 CORS 에러 방지)
            const url = `https://firebasestorage.googleapis.com/v0/b/${this.bucket.name}/o/${encodeURIComponent(filePath)}?alt=media&token=${downloadToken}`;

            return {
                url,
                filename: finalFilename,
                size: optimizedBuffer.length
            };
        } else {
            // 3. Fallback: Vercel Blob 업로드 (이전용)
            const blob = await put(filePath, optimizedBuffer, {
                access: 'public',
                token: process.env.BLOB_READ_WRITE_TOKEN,
            });

            return {
                url: blob.url,
                filename: finalFilename,
                size: optimizedBuffer.length
            };
        }
    }

    /**
     * 파일 삭제
     */
    static async deleteFile(urlOrPath: string): Promise<void> {
        try {
            if (urlOrPath.includes('firebasestorage.googleapis.com')) {
                // Firebase 파일 삭제
                const decodedPath = decodeURIComponent(
                    urlOrPath.split('/o/')[1].split('?')[0]
                );
                await this.bucket.file(decodedPath).delete();
            } else if (urlOrPath.includes('public.blob.vercel-storage.com')) {
                // Vercel Blob (추후 지원 중단 가능)
                // del(urlOrPath)
            }
        } catch (error) {
            console.error('File deletion error:', error);
        }
    }
}
