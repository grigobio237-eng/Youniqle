import * as admin from 'firebase-admin';

/**
 * Firebase Admin SDK 초기화 및 반환
 * Version: 1.0.7 (The Ultimate Fix: Entire JSON Base64 Support)
 */
const getApp = () => {
    if (admin.apps.length) return admin.app();

    console.log('[Firebase Admin] 서비스 초기화 시도 중...');

    const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const privateKeyBase64 = process.env.FIREBASE_PRIVATE_KEY_BASE64;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    try {
        // 1. 로컬 JSON 파일 우선 확인 (환경 변수 손상 방지용 최효의 보루)
        if (typeof window === 'undefined') {
            const fs = require('fs');
            const path = require('path');
            const jsonPath = path.join(process.cwd(), 'youniqle-eea2f-firebase-adminsdk-fbsvc-7e1c0e6225.json');

            if (fs.existsSync(jsonPath)) {
                console.log('[Firebase Admin] 로컬 JSON 파일을 발견했습니다. 이를 우선 사용하여 초기화합니다.');
                const serviceAccount = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
                if (serviceAccount.private_key) {
                    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
                }
                return admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() || `${serviceAccount.project_id}.firebasestorage.app`
                });
            }
        }

        // [The Ultimate Strategy] 2. 서비스 계정 JSON 전체를 Base64로 관리 (가장 안전)
        if (serviceAccountBase64) {
            console.log('[Firebase Admin] FIREBASE_SERVICE_ACCOUNT_BASE64 모드로 초기화를 시도합니다.');
            const decodedJson = Buffer.from(serviceAccountBase64.trim(), 'base64').toString('utf8');
            const serviceAccount = JSON.parse(decodedJson);

            if (serviceAccount.private_key) {
                serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n').trim();
            }

            console.log(`[Firebase Admin] JSON 복구 성공: ${serviceAccount.project_id} / ${serviceAccount.client_email}`);
            return admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() || `${serviceAccount.project_id}.firebasestorage.app`
            });
        }

        // 3. 개별 변수 또는 기존 방식 (하위 호환성)
        console.log('[Firebase Admin] 기존 환경 변수 모드로 시도 중...');
        let finalPrivateKey = privateKeyBase64
            ? Buffer.from(privateKeyBase64.trim(), 'base64').toString('utf8')
            : privateKey;

        if (finalPrivateKey) {
            finalPrivateKey = finalPrivateKey.replace(/\\n/g, '\n').replace(/\\\\n/g, '\n').trim();
        }

        let effectiveEmail = clientEmail;
        let effectiveProjectId = projectId;

        if (!effectiveEmail && serviceAccountKey) {
            try { effectiveEmail = JSON.parse(serviceAccountKey).client_email; } catch (e) { }
        }
        if (!effectiveProjectId && serviceAccountKey) {
            try { effectiveProjectId = JSON.parse(serviceAccountKey).project_id; } catch (e) { }
        }

        if (finalPrivateKey && effectiveEmail) {
            return admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: effectiveProjectId,
                    clientEmail: effectiveEmail.trim(),
                    privateKey: finalPrivateKey,
                }),
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim()
            });
        }

        // 4. 최후의 수단: SERVICE_ACCOUNT_KEY JSON 파싱
        if (serviceAccountKey) {
            let keySource = serviceAccountKey.trim();
            if ((keySource.startsWith("'") && keySource.endsWith("'")) || (keySource.startsWith('"') && keySource.endsWith('"'))) {
                keySource = keySource.substring(1, keySource.length - 1);
            }
            const serviceAccount = JSON.parse(keySource);
            if (serviceAccount.private_key) {
                serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n').trim();
            }
            return admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() || `${serviceAccount.project_id}.firebasestorage.app`
            });
        }

        throw new Error('모든 인증 환경 변수가 누락되었거나 파손되었습니다.');
    } catch (error: any) {
        console.error('[Firebase Admin] 치명적 초기화 오류:', error.message);
        return null;
    }
};

// 서비스 싱글톤 인스턴스
export const getAdminApp = () => getApp();
export const adminDb = () => {
    const app = getApp();
    if (!app) throw new Error('Firebase Admin App이 초기화되지 않았습니다 (DB).');
    return app.firestore();
};
export const adminAuth = () => {
    const app = getApp();
    if (!app) throw new Error('Firebase Admin App이 초기화되지 않았습니다 (Auth).');
    return app.auth();
};
export const getFirebaseStorageInstance = () => {
    const app = getApp();
    if (!app) throw new Error('Firebase Admin App이 초기화되지 않았습니다 (Storage).');
    return app.storage();
};
