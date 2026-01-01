import * as admin from 'firebase-admin';

/**
 * Firebase Admin SDK 초기화 및 반환
 * Version: 1.0.5 (Base64 인증 및 개별 변수 지원)
 */
const getApp = () => {
    if (admin.apps.length) return admin.app();

    console.log('[Firebase Admin] 서비스 초기화 시도 중...');

    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const privateKeyBase64 = process.env.FIREBASE_PRIVATE_KEY_BASE64;

    try {
        // 1. 로컬 JSON 파일 우선 확인 (환경 변수 손상 방지용 최후의 보루)
        if (typeof window === 'undefined') {
            const fs = require('fs');
            const path = require('path');
            const jsonPath = path.join(process.cwd(), 'youniqle-eea2f-firebase-adminsdk-fbsvc-7e1c0e6225.json');

            if (fs.existsSync(jsonPath)) {
                console.log('[Firebase Admin] 로컬 JSON 파일을 발견했습니다. 이를 우선 사용하여 초기화합니다.');
                const serviceAccount = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

                if (serviceAccount.private_key && serviceAccount.private_key.includes('\\n')) {
                    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
                }

                return admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() || `${serviceAccount.project_id}.firebasestorage.app`
                });
            }
        }

        // 2. 환경 변수 기반 (배포 환경)

        // [New Strategy] 2-1. Base64로 인코딩된 Private Key 우선 처리 (파손 방지 최강책)
        if (privateKeyBase64 || (privateKey && clientEmail)) {
            console.log('[Firebase Admin] 개별 환경 변수 또는 Base64 키를 사용하여 초기화합니다.');

            let finalPrivateKey = privateKey;

            // Base64 디코딩 (줄바꿈 파손 문제 완전 해결)
            if (privateKeyBase64) {
                console.log('[Firebase Admin] FIREBASE_PRIVATE_KEY_BASE64 변수를 디코딩합니다.');
                finalPrivateKey = Buffer.from(privateKeyBase64.trim(), 'base64').toString('utf8');
            } else if (finalPrivateKey) {
                // 일반 텍스트 키일 경우 개행 문자 복구
                finalPrivateKey = finalPrivateKey.replace(/\\n/g, '\n').replace(/\\\\n/g, '\n').trim();
            }

            if (finalPrivateKey && (clientEmail || (serviceAccountKey && JSON.parse(serviceAccountKey).client_email))) {
                const effectiveEmail = clientEmail || JSON.parse(serviceAccountKey!).client_email;
                const effectiveProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || (serviceAccountKey ? JSON.parse(serviceAccountKey).project_id : undefined);

                return admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId: effectiveProjectId,
                        clientEmail: effectiveEmail?.trim(),
                        privateKey: finalPrivateKey,
                    }),
                    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim()
                });
            }
        }

        // 2-2. 기존 전체 JSON 키 방식 (하위 호환성 유지)
        if (serviceAccountKey) {
            console.log('[Firebase Admin] Service Account Key JSON 환경 변수를 사용하여 초기화합니다.');
            let keySource = serviceAccountKey.trim();
            if ((keySource.startsWith("'") && keySource.endsWith("'")) ||
                (keySource.startsWith('"') && keySource.endsWith('"'))) {
                keySource = keySource.substring(1, keySource.length - 1);
            }

            const serviceAccount = JSON.parse(keySource);

            if (serviceAccount.private_key) {
                serviceAccount.private_key = serviceAccount.private_key
                    .replace(/\\n/g, '\n')
                    .replace(/\\\\n/g, '\n')
                    .replace(/\r/g, '')
                    .replace(/^"/, '').replace(/"$/, '')
                    .replace(/^'/, '').replace(/'$/, '')
                    .trim();
            }

            return admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() || `${serviceAccount.project_id}.firebasestorage.app`
            });
        }

        console.error('[Firebase Admin] 필수 환경 변수가 누락되었습니다 (SERVICE_ACCOUNT_KEY, PRIVATE_KEY_BASE64 또는 EMAIL/KEY).');
        return null;
    } catch (error: any) {
        console.error('[Firebase Admin] 초기화 중 치명적 오류 발생:', error.message);
        return null;
    }
};

// 서비스 싱글톤 인스턴스 (지연 초기화 지원)
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
