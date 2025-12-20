const https = require('https');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const { URLSearchParams } = require('url');

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = require('dotenv').config({ path: envPath }).parsed;

if (!envConfig) {
    console.error('❌ Error: Could not load .env.local file.');
    process.exit(1);
}

const CLIENT_ID = envConfig.KAKAO_CLIENT_ID;
const CLIENT_SECRET = envConfig.KAKAO_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/api/auth/callback/kakao'; // Assuming this is added in Kakao Developers

if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('❌ Error: KAKAO_CLIENT_ID or KAKAO_CLIENT_SECRET is missing in .env.local');
    process.exit(1);
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('\n===== Kakao API Credential Verification =====\n');
console.log('1. Please open the following URL in your browser to get an Authorization Code:');
console.log(`\nhttps://kauth.kakao.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code\n`);
console.log('2. After logging in, you will be redirected to a URL that looks like:');
console.log(`   ${REDIRECT_URI}?code=YOUR_CODE_HERE\n`);

rl.question('3. Paste the "code" parameter value here: ', (code) => {
    if (!code) {
        console.error('❌ Error: No code provided.');
        rl.close();
        return;
    }

    console.log('\n🔄 Exchanging code for access token...');

    const postData = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        code: code.trim(),
        client_secret: CLIENT_SECRET
    }).toString();

    const options = {
        hostname: 'kauth.kakao.com',
        port: 443,
        path: '/oauth/token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                const responseCallback = JSON.parse(data);

                if (responseCallback.error) {
                    console.error('\n❌ Token Exchange Failed:', responseCallback);
                    console.error('Possible reasons:');
                    console.error(' - Invalid Client Secret');
                    console.error(' - Invalid Redirect URI (Check Kakao Developers settings)');
                    console.error(' - Code expired or already used');
                } else {
                    console.log('\n✅ Access Token Generated Successfully!');
                    console.log('Access Token:', responseCallback.access_token.substring(0, 10) + '...');

                    // Now try to fetch user profile
                    fetchUserProfile(responseCallback.access_token);
                }
            } catch (e) {
                console.error('❌ Error parsing response:', e);
                console.log('Raw response:', data);
            }
        });
    });

    req.on('error', (e) => {
        console.error(`❌ Request error: ${e.message}`);
    });

    req.write(postData);
    req.end();

    rl.close();
});

function fetchUserProfile(accessToken) {
    console.log('\n🔄 Fetching User Profile...');

    const options = {
        hostname: 'kapi.kakao.com',
        port: 443,
        path: '/v2/user/me',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'
        }
    };

    const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                const profile = JSON.parse(data);
                console.log('\n✅ User Profile Fetched Successfully!');
                console.log('User ID:', profile.id);
                console.log('Connected At:', profile.connected_at);
                console.log('Properties:', profile.properties);
                console.log('Kakao Account:', profile.kakao_account ? 'Present' : 'Missing');

                console.log('\n🎉 CONCLUSION: Your Kakao API credentials are VALID and working correctly.');
            } catch (e) {
                console.error('❌ Error parsing profile:', e);
            }
        });
    });

    req.on('error', (e) => {
        console.error(`❌ Profile request error: ${e.message}`);
    });

    req.end();
}
