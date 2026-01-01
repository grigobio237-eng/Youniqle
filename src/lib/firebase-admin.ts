import * as admin from 'firebase-admin';

/**
 * Firebase Admin SDK 초기화 및 반환
 * Version: 1.0.8 (The Simple Fix: Individual Environment Variables)
 */
const getApp = () => {
    if (admin.apps.length) return admin.app();

    // [The Simple Approach] 가장 기본적인 3가지 개별 변수 방식 사용
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    try {
        if (!projectId || !clientEmail || !privateKey) {
            console.error('[Firebase Admin] 초기화 실패: 필수 환경 변수 누락 (ID, Email, Key 중 하나 이상)');
            return null;
        }

        console.log('[Firebase Admin] 개별 환경 변수를 사용하여 서비스를 초기화합니다.');

        // 인증 키 내부의 \n 문자를 실제 개행 문자로 치환 (가장 표준적인 처리)
        const formattedKey = privateKey
            .replace(/\\n/g, '\n')
            .replace(/\r/g, '')
            .trim();

        return admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail: clientEmail.trim(),
                privateKey: formattedKey,
            }),
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() || `${projectId}.firebasestorage.app`
        });
    } catch (error: any) {
        console.error('[Firebase Admin] 초기화 중 에러 발생:', error.message);
        return null;
    }
};

// 서비스 싱글톤 인스턴스
export const getAdminApp = () => getApp();
export const adminDb = () => {
    const app = getApp();
    if (!app) throw new Error('Firebase Admin App이 초기화되지 않았습니다.');
    return app.firestore();
};
export const adminAuth = () => {
    const app = getApp();
    if (!app) throw new Error('Firebase Admin App이 초기화되지 않았습니다.');
    return app.auth();
};
export const getFirebaseStorageInstance = () => {
    const app = getApp();
    if (!app) throw new Error('Firebase Admin App 초기화 실패 (Storage).');
    return app.storage();
};
