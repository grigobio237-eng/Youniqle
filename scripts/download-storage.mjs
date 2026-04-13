import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import os from 'os';

// .env.local 로드
dotenv.config({ path: '.env.local' });

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;
const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

if (!projectId || !clientEmail || !privateKey || !bucketName) {
  console.error('환경 변수가 누락되었습니다. .env.local 파일을 확인해주세요.');
  process.exit(1);
}

// Private Key 개행 처리
privateKey = privateKey.replace(/\\n/g, '\n');
if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
  privateKey = privateKey.substring(1, privateKey.length - 1);
}

// Firebase Admin 초기화
try {
  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    storageBucket: bucketName
  });
  console.log('Firebase Admin SDK 초기화 완료');
} catch (error) {
  console.error('Firebase 초기화 실패:', error);
  process.exit(1);
}

const downloadImages = async () => {
  try {
    const bucket = admin.storage().bucket();
    const prefix = 'products/details/';
    
    console.log(`[Storage] '${prefix}' 폴더 탐색 중...`);
    const [files] = await bucket.getFiles({ prefix });

    if (files.length === 0) {
      console.log('다운로드할 파일이 없습니다.');
      return;
    }

    // 다운로드 경로 설정: 내 PC > 다운로드 > youniqle_details_backup
    const downloadsDir = path.join(os.homedir(), 'Downloads', 'youniqle_details_backup');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    console.log(`[Local] 다운로드 경로: ${downloadsDir}`);
    console.log(`총 ${files.length}개의 파일을 다운로드합니다...`);

    let successCount = 0;
    for (const file of files) {
      // 폴더 자체는 무시
      if (file.name.endsWith('/')) continue;

      const fileName = path.basename(file.name);
      const destPath = path.join(downloadsDir, fileName);

      try {
        await file.download({ destination: destPath });
        successCount++;
        console.log(`[${successCount}/${files.length}] 완료: ${fileName}`);
      } catch (err) {
        console.error(`[실패] ${fileName}:`, err.message);
      }
    }

    console.log('\n=======================================');
    console.log(`성공: ${successCount}개`);
    console.log(`다운로드 폴더: ${downloadsDir}`);
    console.log('=======================================');

  } catch (error) {
    console.error('다운로드 중 오류 발생:', error);
  } finally {
    process.exit(0);
  }
};

downloadImages();
