import * as admin from 'firebase-admin';

/**
 * Firebase Admin SDK 초기화 및 반환
 * Version: 1.1.2 (Strict PEM Formatting - 64 chars break)
 */
const getApp = () => {
    if (admin.apps.length) return admin.app();

    const projectId = (process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)?.trim();
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
    const privateKeyB64 = process.env.FIREBASE_PRIVATE_KEY_B64?.trim();
    const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY?.trim();

    try {
        let sourceKey = "";

        if (privateKeyB64) {
            console.log('[Firebase Admin] Base64 인코딩된 키를 사용합니다.');
            sourceKey = Buffer.from(privateKeyB64, 'base64').toString('utf8');
        } else if (privateKeyRaw) {
            console.log('[Firebase Admin] 일반 텍스트 키를 사용합니다.');
            sourceKey = privateKeyRaw;
        }

        if (!projectId || !clientEmail || !sourceKey) {
            console.error('[Firebase Admin] 필수 변수 누락');
            return null;
        }

        // [Strict PEM Body Formatting]
        // 1. 순수 데이터만 추출 (헤더, 푸터, 모든 공백/개행 제거)
        const pureBody = sourceKey
            .replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----/g, '')
            .replace(/\\n/g, '')
            .replace(/\s+/g, '')
            .trim();

        // 2. 64자마다 줄바꿈 삽입 (RFC 7468 표준 준수)
        let formattedBody = "";
        for (let i = 0; i < pureBody.length; i += 64) {
            formattedBody += pureBody.substring(i, i + 64) + "\n";
        }

        // 3. 최종 PEM 조립
        const finalPem = `-----BEGIN PRIVATE KEY-----\n${formattedBody}-----END PRIVATE KEY-----\n`;

        console.log('[Firebase Admin] 인증 시도 상세 (Strict Mode):');
        console.log(` - Project ID: ${projectId}`);
        console.log(` - Client Email: ${clientEmail}`);
        console.log(` - Cleaned Body Length: ${pureBody.length}`);

        // 데이터 무결성 최종 대조 로그
        console.log(` - Body Checksum (First/Last 10): ${pureBody.substring(0, 10)}...${pureBody.substring(pureBody.length - 10)}`);

        return admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey: finalPem,
            }),
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() || `${projectId}.firebasestorage.app`
        });
    } catch (error: any) {
        console.error('[Firebase Admin] 초기화 에러:', error.message);
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
