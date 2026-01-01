import * as admin from 'firebase-admin';

/**
 * Firebase Admin SDK 초기화 및 반환
 * Version: 1.1.0 (Base64 Fallback & Integrity Logging)
 */
const getApp = () => {
    if (admin.apps.length) return admin.app();

    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKeyB64 = process.env.FIREBASE_PRIVATE_KEY_B64; // 새로운 Base64 전용 변수
    const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

    try {
        let finalKey = "";

        if (privateKeyB64) {
            console.log('[Firebase Admin] Base64 인코딩된 키를 사용합니다.');
            finalKey = Buffer.from(privateKeyB64.trim(), 'base64').toString('utf8');
        } else if (privateKeyRaw) {
            console.log('[Firebase Admin] 일반 텍스트 키를 사용합니다.');
            finalKey = privateKeyRaw.replace(/\\n/g, '\n').trim();
        }

        if (!projectId || !clientEmail || !finalKey) {
            console.error('[Firebase Admin] 필수 변수 누락:', { projectId: !!projectId, clientEmail: !!clientEmail, key: !!finalKey });
            return null;
        }

        // 키 무결성 로그 (앞뒤 10자만 노출하여 보안 유지)
        const keyDataOnly = finalKey.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s+/g, '');
        console.log(`[Firebase Admin] 키 로드 완료 (Body Length: ${keyDataOnly.length})`);
        console.log(`[Firebase Admin] 데이터 대조용: ${keyDataOnly.substring(0, 10)}...${keyDataOnly.substring(keyDataOnly.length - 10)}`);

        return admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail: clientEmail.trim(),
                privateKey: finalKey,
            }),
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() || `${projectId}.firebasestorage.app`
        });
    } catch (error: any) {
        console.error('[Firebase Admin] 초기화 중 치명적 에러:', error.message);
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
