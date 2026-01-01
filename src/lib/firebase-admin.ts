import * as admin from 'firebase-admin';

/**
 * Firebase Admin SDK 초기화 및 반환
 * Version: 1.0.4 (Debug: 개행 문자 치환 강화)
 */
const getApp = () => {
    if (admin.apps.length) return admin.app();

    console.log('[Firebase Admin] 서비스 초기화 시도 중...');

    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    try {
        // 1. 로컬 JSON 파일 우선 확인 (환경 변수 손상 방지용 최후의 보루)
        // Note: fs/path는 서버 사이드 전용이므로 동적 로드
        if (typeof window === 'undefined') {
            const fs = require('fs');
            const path = require('path');
            const jsonPath = path.join(process.cwd(), 'youniqle-eea2f-firebase-adminsdk-fbsvc-7e1c0e6225.json');

            if (fs.existsSync(jsonPath)) {
                console.log('[Firebase Admin] 로컬 JSON 파일을 발견했습니다. 이를 우선 사용하여 초기화합니다.');
                const serviceAccount = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

                // 개행 문자 처리 (JSON.parse가 기본 처리하나 환경에 따라 다를 수 있음)
                if (serviceAccount.private_key && serviceAccount.private_key.includes('\\n')) {
                    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
                }

                return admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                    // 스토리지 버킷 주소 명확히 처리 (환경 변수 우선, 없으면 project_id 기반)
                    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() || `${serviceAccount.project_id}.firebasestorage.app`
                });
            }
        }

        // 2. 환경 변수 기반 (배포 환경)
        if (serviceAccountKey) {
            console.log('[Firebase Admin] Service Account Key 환경 변수를 사용하여 초기화합니다.');
            let keySource = serviceAccountKey.trim();
            // 주변 따옴표 제거 (Next.js 환경 변수 로딩 특성 대응)
            if ((keySource.startsWith("'") && keySource.endsWith("'")) ||
                (keySource.startsWith('"') && keySource.endsWith('"'))) {
                keySource = keySource.substring(1, keySource.length - 1);
            }

            const serviceAccount = JSON.parse(keySource);

            // 데이터 무결성 보완 (이중 이스케이프 개행 문자 완벽 처리)
            if (serviceAccount.private_key) {
                // 이중/삼중 이스케이프된 개행 문자 정규화
                serviceAccount.private_key = serviceAccount.private_key
                    .replace(/\\\\n/g, '\n')
                    .replace(/\\n/g, '\n')
                    .replace(/\r/g, '')
                    .trim();

                // 만약 큰따옴표로 감싸져 있다면 제거
                if (serviceAccount.private_key.startsWith('"') && serviceAccount.private_key.endsWith('"')) {
                    serviceAccount.private_key = serviceAccount.private_key.substring(1, serviceAccount.private_key.length - 1);
                }

                // PEM 형식 보장 (헤더/푸터 사이의 공백 제거 및 올바른 개행 적용)
                if (serviceAccount.private_key.includes('-----BEGIN PRIVATE KEY-----')) {
                    const parts = serviceAccount.private_key.split('-----');
                    if (parts.length >= 5) {
                        // 헤더(-----BEGIN...-----) + 본문(공백제거) + 푸터(-----END...-----)
                        const header = `-----${parts[1]}-----`;
                        const footer = `-----${parts[3]}-----`;
                        const body = parts[2].replace(/\s/g, ''); // 본문 모든 공백 제거

                        // 64자씩 줄바꿈하는 표준 PEM 형식으로 재구성 (더욱 견고함)
                        const formattedBody = body.match(/.{1,64}/g)?.join('\n') || body;
                        serviceAccount.private_key = `${header}\n${formattedBody}\n${footer}`;
                    }
                }
            }
            if (serviceAccount.client_email) {
                serviceAccount.client_email = serviceAccount.client_email.trim();
            }

            console.log('[Firebase Admin] 초기화 정보 검증 (ENV):');
            console.log(` - Project ID: ${serviceAccount.project_id}`);
            console.log(` - Client Email: ${serviceAccount.client_email}`);
            console.log(` - Private Key 길이: ${serviceAccount.private_key?.length}`);
            console.log(` - Bucket: ${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim()}`);

            return admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() || `${serviceAccount.project_id}.firebasestorage.app`
            });
        }

        if (clientEmail && privateKey) {
            console.log('[Firebase Admin] Client Email 및 Private Key를 사용하여 초기화합니다.');
            return admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                    clientEmail: clientEmail.trim(),
                    privateKey: privateKey.replace(/\\n/g, '\n').trim(),
                }),
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim()
            });
        }

        console.error('[Firebase Admin] 필수 환경 변수가 누락되었습니다 (SERVICE_ACCOUNT_KEY 또는 EMAIL/KEY).');
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
