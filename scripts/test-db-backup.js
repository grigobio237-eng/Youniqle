// 데이터베이스 백업 및 복원 테스트 스크립트
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function testDatabaseBackup() {
  try {
    console.log('💾 데이터베이스 백업 및 복원 테스트 시작...');
    
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
    const backupFile = path.join(backupDir, `backup-${timestamp}.json`);
    
    // 1. 데이터베이스 백업
    console.log('\n📦 1. 데이터베이스 백업');
    const backupStartTime = Date.now();
    
    const collections = await db.listCollections().toArray();
    const backupData = {};
    
    for (const collection of collections) {
      const collectionName = collection.name;
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
    const originalCollections = collections.length;
    const backupCollections = Object.keys(backupContent).length;
    
    console.log(`  - 원본 컬렉션 수: ${originalCollections}개`);
    console.log(`  - 백업 컬렉션 수: ${backupCollections}개`);
    
    if (originalCollections === backupCollections) {
      console.log('✅ 백업 검증 성공: 모든 컬렉션이 백업되었습니다.');
    } else {
      console.log('❌ 백업 검증 실패: 일부 컬렉션이 누락되었습니다.');
    }
    
    // 3. 테스트 데이터 삭제 (복원 테스트용)
    console.log('\n🗑️ 3. 테스트 데이터 삭제 (복원 테스트용)');
    const testCollections = ['users', 'products', 'orders', 'carts'];
    
    for (const collectionName of testCollections) {
      const count = await db.collection(collectionName).countDocuments();
      if (count > 0) {
        // 컬렉션을 완전히 삭제하고 재생성
        await db.collection(collectionName).drop().catch(() => {});
        console.log(`  - ${collectionName}: ${count}개 문서 삭제`);
      }
    }
    
    // 4. 데이터 복원
    console.log('\n🔄 4. 데이터 복원');
    const restoreStartTime = Date.now();
    
    for (const [collectionName, documents] of Object.entries(backupContent)) {
      if (documents.length > 0) {
        console.log(`  - 복원 중: ${collectionName} (${documents.length}개 문서)`);
        await db.collection(collectionName).insertMany(documents);
      }
    }
    
    const restoreEndTime = Date.now();
    const restoreTime = restoreEndTime - restoreStartTime;
    
    console.log(`  - 복원 완료: ${restoreTime}ms`);
    
    // 5. 복원 검증
    console.log('\n✅ 5. 복원 검증');
    let restoreSuccess = true;
    
    for (const [collectionName, originalDocuments] of Object.entries(backupContent)) {
      const restoredCount = await db.collection(collectionName).countDocuments();
      const originalCount = originalDocuments.length;
      
      console.log(`  - ${collectionName}: ${restoredCount}/${originalCount}개 문서`);
      
      if (restoredCount !== originalCount) {
        console.log(`    ❌ 복원 실패: ${collectionName}`);
        restoreSuccess = false;
      }
    }
    
    if (restoreSuccess) {
      console.log('✅ 복원 검증 성공: 모든 데이터가 정상적으로 복원되었습니다.');
    } else {
      console.log('❌ 복원 검증 실패: 일부 데이터가 복원되지 않았습니다.');
    }
    
    // 6. 백업 파일 정리
    console.log('\n🧹 6. 백업 파일 정리');
    try {
      fs.unlinkSync(backupFile);
      console.log('✅ 백업 파일 삭제 완료');
    } catch (error) {
      console.log('⚠️ 백업 파일 삭제 실패:', error.message);
    }
    
    // 7. 성능 요약
    console.log('\n📊 7. 백업/복원 성능 요약');
    console.log(`  - 백업 시간: ${backupTime}ms`);
    console.log(`  - 복원 시간: ${restoreTime}ms`);
    console.log(`  - 총 처리 시간: ${backupTime + restoreTime}ms`);
    console.log(`  - 백업 속도: ${(Object.values(backupData).flat().length / (backupTime / 1000)).toFixed(2)} 문서/초`);
    console.log(`  - 복원 속도: ${(Object.values(backupContent).flat().length / (restoreTime / 1000)).toFixed(2)} 문서/초`);
    
    console.log('\n✅ 데이터베이스 백업 및 복원 테스트 완료');
    
  } catch (error) {
    console.error('❌ 데이터베이스 백업 및 복원 테스트 실패:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 종료');
  }
}

testDatabaseBackup();
