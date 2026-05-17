const fetch = require('node-fetch');

async function testMeStatus() {
  try {
    const res = await fetch('http://localhost:3000/api/me/status');
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Body:', text);
    if (text) {
        const json = JSON.parse(text);
        console.log('JSON:', json);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

testMeStatus();
