import * as admin from 'firebase-admin';

/**
 * Firebase Admin SDK 초기화 및 반환
 * Version: 1.1.3 (Ultimate URL-Safe & Space Repair)
 */
const getApp = () => {
    if (admin.apps.length) return admin.app();

    const projectId = (process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)?.trim();
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
    const b64Input = process.env.FIREBASE_PRIVATE_KEY_B64?.trim();
    const rawInput = process.env.FIREBASE_PRIVATE_KEY?.trim();

    try {
        let sourceKey = "";

        if (b64Input) {
            console.log('[Firebase Admin] Base64 데이터를 처리 중입니다.');

            // [Ultimate Repair] 
            // 1. URL-Safe Base64 대응 ( - -> + , _ -> / )
            // 2. 공백 파손 대응 ( ' ' -> + )
            const sanitizedB64 = b64Input
                .replace(/-/g, '+')
                .replace(/_/g, '/')
                .replace(/ /g, '+');

            sourceKey = Buffer.from(sanitizedB64, 'base64').toString('utf8');
        } else if (rawInput) {
            console.log('[Firebase Admin] 일반 텍스트 데이터를 처리 중입니다.');
            sourceKey = rawInput;
        }

        if (!projectId || !clientEmail || !sourceKey) {
            console.error('[Firebase Admin] 필수 정보가 누락되었습니다.');
            return null;
        }

        // [Strict Standard PEM Wrapping]
        const pureBody = sourceKey
            .replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----/g, '')
            .replace(/\\n/g, '')
            .replace(/\s+/g, '')
            .trim();

        // 64자 줄바꿈 표준 준수 (Google Auth Library 엄격 대응)
        let pemBody = "";
        for (let i = 0; i < pureBody.length; i += 64) {
            pemBody += pureBody.substring(i, i + 64) + "\n";
        }

        const finalPem = `-----BEGIN PRIVATE KEY-----\n${pemBody}-----END PRIVATE KEY-----\n`;

        console.log('[Firebase Admin] 인증 시도 상세 (URL-Safe 모드):');
        console.log(` - Project ID: ${projectId}`);
        console.log(` - Client Email: ${clientEmail}`);
        console.log(` - Safe Body Length: ${pureBody.length}`);
        console.log(` - Body Checksum: ${pureBody.substring(0, 10)}...${pureBody.substring(pureBody.length - 10)}`);

        return admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey: finalPem,
            }),
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() || `${projectId}.firebasestorage.app`
        });
    } catch (error: any) {
        console.error('[Firebase Admin] 초기화 치명적 에러:', error.message);
        return null;
    }
};

export const getAdminApp = () => getApp();
export const adminDb = () => {
    const app = getApp();
    if (!app) throw new Error('Firebase Admin App 초기화 실패 (DB)');
    return app.firestore();
};
export const adminAuth = () => {
    const app = getApp();
    if (!app) throw new Error('Firebase Admin App 초기화 실패 (Auth)');
    return app.auth();
};
export const getFirebaseStorageInstance = () => {
    const app = getApp();
    if (!app) throw new Error('Firebase Admin App 초기화 실패 (Storage)');
    return app.storage();
};
