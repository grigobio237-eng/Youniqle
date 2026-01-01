import * as admin from 'firebase-admin';

/**
 * Firebase Admin SDK 초기화 및 반환
 * Version: 1.0.6 (Debug: Base64 개행 정밀 보정 & 에러 로깅 강화)
 */
const getApp = () => {
    if (admin.apps.length) return admin.app();

    console.log('[Firebase Admin] 서비스 초기화 시도 중...');

    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const privateKeyBase64 = process.env.FIREBASE_PRIVATE_KEY_BASE64;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

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

        // [New Strategy] 2-1. Base64 또는 개별 변수 우선 처리 (파손 방지 최강책)
        if (privateKeyBase64 || (privateKey && clientEmail)) {
            console.log('[Firebase Admin] 개별 변수 또는 Base64 모드로 초기화를 시도합니다.');

            let finalPrivateKey = privateKey;

            // Base64 디코딩
            if (privateKeyBase64) {
                console.log('[Firebase Admin] FIREBASE_PRIVATE_KEY_BASE64 디코딩 수행');
                finalPrivateKey = Buffer.from(privateKeyBase64.trim(), 'base64').toString('utf8');
            }

            // [CRITICAL] 어떤 경로로 오든 개행 문자 리터럴 복구는 필수 (PowerShell 인코딩 대응)
            if (finalPrivateKey) {
                finalPrivateKey = finalPrivateKey
                    .replace(/\\n/g, '\n')
                    .replace(/\\\\n/g, '\n')
                    .replace(/\r/g, '')
                    .replace(/^"/, '').replace(/"$/, '')
                    .replace(/^'/, '').replace(/'$/, '')
                    .trim();
            }

            // 필수 정보 추출 (JSON 문자열 백업 참조 포함)
            let effectiveEmail = clientEmail;
            let effectiveProjectId = projectId;

            if (!effectiveEmail && serviceAccountKey) {
                try { effectiveEmail = JSON.parse(serviceAccountKey).client_email; } catch (e) { }
            }
            if (!effectiveProjectId && serviceAccountKey) {
                try { effectiveProjectId = JSON.parse(serviceAccountKey).project_id; } catch (e) { }
            }

            if (finalPrivateKey && effectiveEmail) {
                console.log('[Firebase Admin] 인증 키 및 이메일 로드 완료. 앱 초기화 중...');
                return admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId: effectiveProjectId,
                        clientEmail: effectiveEmail.trim(),
                        privateKey: finalPrivateKey,
                    }),
                    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim()
                });
            } else {
                console.warn('[Firebase Admin] 개별 변수 모드 실패: 키 또는 이메일이 부족합니다.', {
                    hasKey: !!finalPrivateKey,
                    hasEmail: !!effectiveEmail,
                    hasProjectId: !!effectiveProjectId
                });
            }
        }

        // 2-2. 기존 전체 JSON 키 방식 (하위 호환성)
        if (serviceAccountKey) {
            console.log('[Firebase Admin] SERVICE_ACCOUNT_KEY JSON 파싱 시작');
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

        console.error('[Firebase Admin] 초기화 실패: 필수 환경 변수가 모두 누락되었습니다.');
        return null;
    } catch (error: any) {
        console.error('[Firebase Admin] 치명적 초기화 오류:', error.message);
        if (error.stack) console.error(error.stack);
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
