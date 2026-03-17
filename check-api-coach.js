const http = require('http');

http.get('http://localhost:3000/api/coaches', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const testCoach = json.coaches.find(c => c.name === '테스트 코치' || c.email === 'coach-test@youniqle.com');
      
      if (testCoach) {
        console.log('--- TEST COACH DATA FROM API ---');
        console.log(JSON.stringify(testCoach, null, 2));
      } else {
        console.log('Test Coach not found in API response');
        console.log('Available coaches:', json.coaches.map(c => c.name));
      }
    } catch (e) {
      console.error('Failed to parse JSON:', e.message);
    }
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
