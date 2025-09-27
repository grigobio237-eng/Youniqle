import connectDB from '../lib/db';
import User from '../models/User';

async function clearTestUsers() {
  try {
    await connectDB();
    
    // 테스트 이메일로 가입한 사용자들 삭제
    const testEmails = [
      'sin93101190@gmail.com',
      'test@example.com'
    ];
    
    const result = await User.deleteMany({
      email: { $in: testEmails }
    });
    
    console.log(`✅ ${result.deletedCount}명의 테스트 사용자가 삭제되었습니다.`);
  } catch (error) {
    console.error('❌ 사용자 삭제 중 오류:', error);
  }
}

clearTestUsers();

