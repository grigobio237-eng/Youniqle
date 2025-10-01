const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'admin123!';
  const hash = await bcrypt.hash(password, 12);
  console.log('비밀번호:', password);
  console.log('해시값:', hash);
  console.log('\nMongoDB Atlas에서 다음 값으로 설정하세요:');
  console.log('role: "admin"');
  console.log('passwordHash: "' + hash + '"');
}

generateHash().catch(console.error);














