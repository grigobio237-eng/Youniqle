import * as admin from 'firebase-admin';

/**
 * Firebase Admin SDK 초기화 및 반환
 * Version: 1.1.1 (Aggressive PEM Repair & Literal \n Fix)
 */
const getApp = () => {
    if (admin.apps.length) return admin.app();

    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKeyB64 = process.env.FIREBASE_PRIVATE_KEY_B64;
    const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

    try {
        let sourceKey = "";

        if (privateKeyB64) {
            console.log('[Firebase Admin] Base64 인코딩된 키를 사용합니다.');
            sourceKey = Buffer.from(privateKeyB64.trim(), 'base64').toString('utf8');
        } else if (privateKeyRaw) {
            console.log('[Firebase Admin] 일반 텍스트 키를 사용합니다.');
            sourceKey = privateKeyRaw;
        }

        if (!projectId || !clientEmail || !sourceKey) {
            console.error('[Firebase Admin] 필수 변수 누락:', { projectId: !!projectId, clientEmail: !!clientEmail, key: !!sourceKey });
            return null;
        }

        // [Aggressive PEM Repair]
        // 어떤 경로로 왔든 상관없이 모든 노이즈를 제거하고 순수 키 데이터만 추출합니다.
        const body = sourceKey
            .replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----/g, '') // 헤더/푸터 제거
            .replace(/\\n/g, '') // 글자 형태의 '\n' 제거 (매우 중요)
            .replace(/\s+/g, '')  // 실제 줄바꿈, 공백 제거
            .trim();

        // 표준 PEM 형식으로 완벽하게 재조립
        const repairedKey = `-----BEGIN PRIVATE KEY-----\n${body}\n-----END PRIVATE KEY-----\n`;

        console.log(`[Firebase Admin] 키 복구 완료 (Body Length: ${body.length})`);
        console.log(`[Firebase Admin] 데이터 확인: ${body.substring(0, 15)}...${body.substring(body.length - 15)}`);

        return admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail: clientEmail.trim(),
                privateKey: repairedKey,
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
