
import https from 'https';

function check(url: string) {
    console.log(`Checking: ${url}`);
    https.get(url, (res) => {
        console.log(`✅ ${url} status: ${res.statusCode}`);
        res.on('data', () => { });
    }).on('error', (e) => {
        console.error(`❌ ${url} error: ${e.message}`);
    });
}

check('https://www.google.com');
check('https://generativelanguage.googleapis.com/v1beta/models?key=' + (process.env.GEMINI_API_KEY || ''));
