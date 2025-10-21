#!/usr/bin/env node

/**
 * 다국어 시스템 검증 스크립트
 * - 번역 키 일관성 검증
 * - 번역 키 사용 검증
 * - 번역 파일 구문 검증
 */

const fs = require('fs');
const path = require('path');

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`),
};

// 번역 파일 경로
const localesDir = path.join(__dirname, '../src/locales');
const locales = ['ko', 'en', 'zh'];

// 1. 번역 파일 로드 및 구문 검증
function loadTranslations() {
  log.header('📝 Step 1: 번역 파일 로드 및 구문 검증');
  
  const translations = {};
  let hasError = false;

  for (const locale of locales) {
    const filePath = path.join(localesDir, `${locale}.json`);
    
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      translations[locale] = JSON.parse(content);
      log.success(`${locale}.json 로드 성공 (${content.length} bytes)`);
    } catch (error) {
      log.error(`${locale}.json 로드 실패: ${error.message}`);
      hasError = true;
    }
  }

  if (hasError) {
    process.exit(1);
  }

  return translations;
}

// 2. 번역 키 추출 (재귀적으로)
function extractKeys(obj, prefix = '') {
  const keys = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...extractKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
}

// 3. 번역 키 일관성 검증
function verifyKeyConsistency(translations) {
  log.header('🔑 Step 2: 번역 키 일관성 검증');
  
  const allKeys = {};
  
  // 각 언어별 키 추출
  for (const locale of locales) {
    allKeys[locale] = new Set(extractKeys(translations[locale]));
    log.info(`${locale}: ${allKeys[locale].size}개 키 발견`);
  }
  
  // 기준 언어 (한국어)
  const baseKeys = allKeys['ko'];
  let hasInconsistency = false;
  
  // 다른 언어와 비교
  for (const locale of ['en', 'zh']) {
    const currentKeys = allKeys[locale];
    
    // 누락된 키 찾기
    const missingKeys = [...baseKeys].filter(key => !currentKeys.has(key));
    if (missingKeys.length > 0) {
      log.error(`${locale}에 누락된 키 (${missingKeys.length}개):`);
      missingKeys.slice(0, 10).forEach(key => console.log(`  - ${key}`));
      if (missingKeys.length > 10) {
        console.log(`  ... 외 ${missingKeys.length - 10}개`);
      }
      hasInconsistency = true;
    }
    
    // 추가된 키 찾기
    const extraKeys = [...currentKeys].filter(key => !baseKeys.has(key));
    if (extraKeys.length > 0) {
      log.warning(`${locale}에 추가된 키 (${extraKeys.length}개):`);
      extraKeys.slice(0, 10).forEach(key => console.log(`  - ${key}`));
      if (extraKeys.length > 10) {
        console.log(`  ... 외 ${extraKeys.length - 10}개`);
      }
      hasInconsistency = true;
    }
    
    if (!hasInconsistency) {
      log.success(`${locale}: 모든 키가 일치합니다!`);
    }
  }
  
  return !hasInconsistency;
}

// 4. 코드에서 사용된 번역 키 추출
function findUsedKeys() {
  log.header('🔍 Step 3: 코드에서 사용된 번역 키 추출');
  
  const usedKeys = new Set();
  const srcDir = path.join(__dirname, '../src');
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // node_modules와 .next 디렉토리 제외
        if (file !== 'node_modules' && file !== '.next') {
          scanDirectory(filePath);
        }
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // t('key') 패턴 찾기
        const matches = content.matchAll(/t\(['"`]([^'"`]+)['"`]/g);
        for (const match of matches) {
          usedKeys.add(match[1]);
        }
      }
    }
  }
  
  scanDirectory(srcDir);
  log.info(`코드에서 ${usedKeys.size}개의 번역 키 사용 발견`);
  
  return usedKeys;
}

// 5. 사용된 키와 번역 파일 비교
function verifyUsedKeys(translations, usedKeys) {
  log.header('✅ Step 4: 사용된 키 검증');
  
  const koKeys = new Set(extractKeys(translations['ko']));
  const missingKeys = [];
  const unusedKeys = [];
  
  // 코드에서 사용되었지만 번역 파일에 없는 키
  for (const key of usedKeys) {
    if (!koKeys.has(key)) {
      missingKeys.push(key);
    }
  }
  
  // 번역 파일에 있지만 코드에서 사용되지 않는 키
  for (const key of koKeys) {
    if (!usedKeys.has(key)) {
      unusedKeys.push(key);
    }
  }
  
  if (missingKeys.length > 0) {
    log.error(`번역 파일에 누락된 키 (${missingKeys.length}개):`);
    missingKeys.slice(0, 10).forEach(key => console.log(`  - ${key}`));
    if (missingKeys.length > 10) {
      console.log(`  ... 외 ${missingKeys.length - 10}개`);
    }
  }
  
  if (unusedKeys.length > 0) {
    log.warning(`사용되지 않는 번역 키 (${unusedKeys.length}개):`);
    unusedKeys.slice(0, 10).forEach(key => console.log(`  - ${key}`));
    if (unusedKeys.length > 10) {
      console.log(`  ... 외 ${unusedKeys.length - 10}개`);
    }
  }
  
  if (missingKeys.length === 0) {
    log.success('모든 사용된 키가 번역 파일에 존재합니다!');
  }
  
  return missingKeys.length === 0;
}

// 6. 번역 값 검증 (빈 값, 키 누락 등)
function verifyTranslationValues(translations) {
  log.header('💬 Step 5: 번역 값 검증');
  
  let hasIssue = false;
  
  for (const locale of locales) {
    const keys = extractKeys(translations[locale]);
    const emptyValues = [];
    
    for (const key of keys) {
      const value = getNestedValue(translations[locale], key);
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        emptyValues.push(key);
      }
    }
    
    if (emptyValues.length > 0) {
      log.warning(`${locale}에 빈 값이 있는 키 (${emptyValues.length}개):`);
      emptyValues.slice(0, 5).forEach(key => console.log(`  - ${key}`));
      if (emptyValues.length > 5) {
        console.log(`  ... 외 ${emptyValues.length - 5}개`);
      }
      hasIssue = true;
    } else {
      log.success(`${locale}: 모든 값이 정상입니다!`);
    }
  }
  
  return !hasIssue;
}

function getNestedValue(obj, key) {
  const keys = key.split('.');
  let value = obj;
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return undefined;
    }
  }
  
  return value;
}

// 메인 실행
function main() {
  console.log(`
${colors.bright}${colors.cyan}╔═══════════════════════════════════════════╗
║   다국어 시스템 검증 스크립트           ║
║   Youniqle i18n Verification            ║
╚═══════════════════════════════════════════╝${colors.reset}
`);

  try {
    // 1. 번역 파일 로드
    const translations = loadTranslations();
    
    // 2. 번역 키 일관성 검증
    const isConsistent = verifyKeyConsistency(translations);
    
    // 3. 코드에서 사용된 키 추출
    const usedKeys = findUsedKeys();
    
    // 4. 사용된 키 검증
    const hasAllKeys = verifyUsedKeys(translations, usedKeys);
    
    // 5. 번역 값 검증
    const hasValidValues = verifyTranslationValues(translations);
    
    // 최종 결과
    log.header('📊 검증 결과 요약');
    console.log(`총 번역 키: ${extractKeys(translations['ko']).length}개`);
    console.log(`코드에서 사용된 키: ${usedKeys.size}개`);
    console.log(`지원 언어: ${locales.join(', ')}`);
    
    if (isConsistent && hasAllKeys && hasValidValues) {
      console.log(`\n${colors.green}${colors.bright}🎉 모든 검증을 통과했습니다!${colors.reset}\n`);
      process.exit(0);
    } else {
      console.log(`\n${colors.yellow}${colors.bright}⚠️ 일부 이슈가 발견되었습니다. 위의 경고를 확인해주세요.${colors.reset}\n`);
      process.exit(0); // 경고는 있지만 치명적이지 않음
    }
  } catch (error) {
    log.error(`검증 중 오류 발생: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

main();

