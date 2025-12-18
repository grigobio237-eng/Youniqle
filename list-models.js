
const https = require('https');

const apiKey = "AIzaSyC7pvkZlVssICf6KjPaH8xkpxZLtOjd5VM"; // First key

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log("Status:", res.statusCode);
        if (res.statusCode === 200) {
            const models = JSON.parse(data);
            console.log("Available Models:");
            models.models.forEach(m => console.log(`- ${m.name}`));
        } else {
            console.log("Error Body:", data);
        }
    });
}).on('error', (e) => {
    console.error(e);
});
