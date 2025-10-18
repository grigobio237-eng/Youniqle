// 간단한 데이터베이스 백업 테스트 스크립트
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function testSimpleBackup() {
  try {
    console.log('💾 간단한 데이터베이스 백업 테스트 시작...');
    
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: true,
    });
    
    console.log('✅ MongoDB 연결 성공');
    
    const db = mongoose.connection.db;
    const backupDir = path.join(__dirname, 'backups');
    
    // 백업 디렉토리 생성
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `simple-backup-${timestamp}.json`);
    
    // 1. 핵심 컬렉션만 백업
    console.log('\n📦 1. 핵심 컬렉션 백업');
    const backupStartTime = Date.now();
    
    const coreCollections = ['users', 'products', 'orders', 'carts'];
    const backupData = {};
    
    for (const collectionName of coreCollections) {
      console.log(`  - 백업 중: ${collectionName}`);
      const documents = await db.collection(collectionName).find({}).toArray();
      backupData[collectionName] = documents;
    }
    
    // 백업 파일 저장
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    const backupEndTime = Date.now();
    const backupTime = backupEndTime - backupStartTime;
    
    console.log(`  - 백업 완료: ${backupTime}ms`);
    console.log(`  - 백업 파일: ${backupFile}`);
    console.log(`  - 백업 크기: ${(fs.statSync(backupFile).size / 1024).toFixed(2)} KB`);
    
    // 2. 백업 검증
    console.log('\n🔍 2. 백업 검증');
    const backupContent = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    
    let totalDocuments = 0;
    for (const [collectionName, documents] of Object.entries(backupContent)) {
      console.log(`  - ${collectionName}: ${documents.length}개 문서`);
      totalDocuments += documents.length;
    }
    
    console.log(`  - 총 백업 문서 수: ${totalDocuments}개`);
    console.log('✅ 백업 검증 성공');
    
    // 3. 백업 파일 읽기 테스트
    console.log('\n📖 3. 백업 파일 읽기 테스트');
    const readStartTime = Date.now();
    const readBackupContent = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    const readEndTime = Date.now();
    const readTime = readEndTime - readStartTime;
    
    console.log(`  - 파일 읽기 시간: ${readTime}ms`);
    console.log(`  - 읽은 컬렉션 수: ${Object.keys(readBackupContent).length}개`);
    console.log('✅ 백업 파일 읽기 성공');
    
    // 4. 백업 파일 정리
    console.log('\n🧹 4. 백업 파일 정리');
    try {
      fs.unlinkSync(backupFile);
      console.log('✅ 백업 파일 삭제 완료');
    } catch (error) {
      console.log('⚠️ 백업 파일 삭제 실패:', error.message);
    }
    
    // 5. 성능 요약
    console.log('\n📊 5. 백업 성능 요약');
    console.log(`  - 백업 시간: ${backupTime}ms`);
    console.log(`  - 읽기 시간: ${readTime}ms`);
    console.log(`  - 총 처리 시간: ${backupTime + readTime}ms`);
    console.log(`  - 백업 속도: ${(totalDocuments / (backupTime / 1000)).toFixed(2)} 문서/초`);
    
    console.log('\n✅ 간단한 데이터베이스 백업 테스트 완료');
    
  } catch (error) {
    console.error('❌ 간단한 데이터베이스 백업 테스트 실패:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 종료');
  }
}

testSimpleBackup();












