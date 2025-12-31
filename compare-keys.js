const fs = require('fs');
const dotenv = require('dotenv');
const path = require('path');

// 1. .env.local 로드
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
let envKeyRaw = envConfig.FIREBASE_SERVICE_ACCOUNT_KEY;

// 따옴표 제거
if ((envKeyRaw.startsWith("'") && envKeyRaw.endsWith("'")) ||
    (envKeyRaw.startsWith('"') && envKeyRaw.endsWith('"'))) {
    envKeyRaw = envKeyRaw.substring(1, envKeyRaw.length - 1);
}

const envKey = JSON.parse(envKeyRaw).private_key;

// 2. JSON 파일 로드
const jsonKey = JSON.parse(fs.readFileSync('youniqle-eea2f-firebase-adminsdk-fbsvc-7e1c0e6225.json', 'utf8')).private_key;

console.log('--- Comparison Results ---');
console.log('ENV Private Key Length:', envKey.length);
console.log('JSON Private Key Length:', jsonKey.length);

if (envKey === jsonKey) {
    console.log('EXACT MATCH: YES');
} else {
    console.log('EXACT MATCH: NO');

    // 차이점 분석
    let diffIndex = -1;
    for (let i = 0; i < Math.min(envKey.length, jsonKey.length); i++) {
        if (envKey[i] !== jsonKey[i]) {
            diffIndex = i;
            break;
        }
    }

    if (diffIndex !== -1) {
        console.log('First difference at index:', diffIndex);
        console.log('ENV char code:', envKey.charCodeAt(diffIndex));
        console.log('JSON char code:', jsonKey.charCodeAt(diffIndex));
        console.log('ENV context:', envKey.substring(diffIndex - 5, diffIndex + 5));
        console.log('JSON context:', jsonKey.substring(diffIndex - 5, diffIndex + 5));
    }
}
