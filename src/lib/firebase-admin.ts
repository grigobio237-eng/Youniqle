import * as admin from 'firebase-admin';

/**
 * Firebase Admin SDK 초기화 및 반환
 * Version: 1.0.9 (Aggressive Key Repair & Precision Logging)
 */
const getApp = () => {
    if (admin.apps.length) return admin.app();

    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    try {
        if (!projectId || !clientEmail || !privateKey) {
            console.error('[Firebase Admin] 초기화 실패: 필수 환경 변수 누락', {
                projectId: !!projectId,
                clientEmail: !!clientEmail,
                privateKey: !!privateKey
            });
            return null;
        }

        // [Aggressive Repair Strategy]
        // 1. 모든 종류의 따옴표와 공백 제거
        let cleanKey = privateKey.trim()
            .replace(/^['"]|['"]$/g, '') // 앞뒤 따옴표 제거
            .replace(/\\n/g, '')         // 리터럴 \n 제거
            .replace(/\n/g, '')          // 실제 줄바꿈 제거
            .replace(/\s+/g, '');        // 모든 공백 제거

        // 2. 헤더/푸터 키워드 제거 (나중에 다시 붙임)
        cleanKey = cleanKey
            .replace('-----BEGINPRIVATEKEY-----', '')
            .replace('-----ENDPRIVATEKEY-----', '');

        // 3. 표준 형식으로 재구성 (\n을 정확히 한 번씩만 삽입)
        const finalKey = `-----BEGIN PRIVATE KEY-----\n${cleanKey}\n-----END PRIVATE KEY-----\n`;

        console.log('[Firebase Admin] 초기화 상세 정보 (Debug):');
        console.log(` - Project ID: ${projectId}`);
        console.log(` - Client Email: ${clientEmail.trim()}`);
        console.log(` - Original Key Length: ${privateKey.length}`);
        console.log(` - Cleaned Key Length: ${cleanKey.length}`);
        console.log(` - Key Preview: ${finalKey.substring(0, 40)}...${finalKey.substring(finalKey.length - 25)}`);

        return admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail: clientEmail.trim(),
                privateKey: finalKey,
            }),
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() || `${projectId}.firebasestorage.app`
        });
    } catch (error: any) {
        console.error('[Firebase Admin] 치명적 초기화 에러:', error.message);
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
