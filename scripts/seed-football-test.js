require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB 연결
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI 환경 변수가 설정되지 않았습니다.');
  console.log('📝 .env.local 파일에 MONGODB_URI를 설정해주세요.');
  process.exit(1);
}

// 1. 스키마 정의 (Next.js 모듈 번들러와 독립적으로 실행하기 위해 인라인 스키마 사용)
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  name: { type: String, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['member', 'partner', 'admin', 'superadmin'], default: 'member' },
  emailVerified: { type: Boolean, default: true },
  footballRole: { type: String, enum: ['coach', 'player', 'guardian', null], default: null },
  activeTeamId: { type: mongoose.Schema.Types.ObjectId, ref: 'FootballTeam', default: null }
}, { timestamps: true });

const FootballTeamSchema = new mongoose.Schema({
  teamName: { type: String, required: true },
  teamCode: { type: String, required: true, unique: true, uppercase: true },
  category: { type: String, enum: ['youth', 'pro', 'amateur'], required: true },
  inviteLink: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'suspended'], default: 'approved' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const FootballTeamMemberSchema = new mongoose.Schema({
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'FootballTeam', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['head_coach', 'coach', 'trainer', 'medical', 'player', 'guardian'], required: true },
  status: { type: String, enum: ['active', 'inactive', 'transferred'], default: 'active' },
  permissions: {
    viewWellness: { type: Boolean, default: true },
    viewAcwr: { type: Boolean, default: true },
    manageAnnouncements: { type: Boolean, default: true },
    manageSchedule: { type: Boolean, default: true },
    manageMembers: { type: Boolean, default: true },
    viewReports: { type: Boolean, default: true }
  }
}, { timestamps: true });

const WellnessCheckSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'FootballTeam', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  sleep: { type: Number, required: true },
  soreness: { type: Number, required: true },
  fatigue: { type: Number, required: true },
  stress: { type: Number, required: true },
  mood: { type: Number, required: true },
  wellnessScore: { type: Number, required: true },
  rpe: { type: Number },
  sessionType: { type: String, enum: ['training', 'match', 'rest'] },
  sessionDuration: { type: Number },
  sessionLoad: { type: Number },
  source: { type: String, default: 'quick' }
}, { timestamps: true });

// 한 유저당 하루 1회만 기록 가능하도록 복합 인덱스 설정
WellnessCheckSchema.index({ userId: 1, date: 1 }, { unique: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const FootballTeam = mongoose.models.FootballTeam || mongoose.model('FootballTeam', FootballTeamSchema);
const FootballTeamMember = mongoose.models.FootballTeamMember || mongoose.model('FootballTeamMember', FootballTeamMemberSchema);
const WellnessCheck = mongoose.models.WellnessCheck || mongoose.model('WellnessCheck', WellnessCheckSchema);

async function seedFootballData() {
  try {
    console.log('🔗 MongoDB 연결 중...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // 1. 기존 테스트 데이터 삭제 (Hard Delete)
    console.log('🗑️ 기존 축구 테스트 데이터 삭제 중...');
    await User.deleteMany({ email: { $in: ['test-coach@youniqle.com', 'test-player@youniqle.com'] } });
    await FootballTeam.deleteMany({ teamCode: 'TESTFC' });
    console.log('✅ 기존 데이터 삭제 완료');

    // 비밀번호 암호화
    const passwordHash = await bcrypt.hash('test1234!', 12);

    // 2. 코치 계정 임시 생성 (팀 할당 전)
    console.log('👤 코치(Coach) 계정 생성 중...');
    const coach = new User({
      email: 'test-coach@youniqle.com',
      name: '김코치',
      passwordHash: passwordHash,
      role: 'member',
      emailVerified: true,
      footballRole: 'coach'
    });
    await coach.save();
    console.log('✅ 코치 계정 생성 완료');

    // 3. 축구팀 생성
    console.log('⚽ 테스트 축구팀(FootballTeam) 생성 중...');
    const team = new FootballTeam({
      teamName: '테스트 FC',
      teamCode: 'TESTFC',
      category: 'youth',
      inviteLink: 'http://localhost:3000/teams/invite/TESTFC',
      isActive: true,
      status: 'approved',
      createdBy: coach._id
    });
    await team.save();
    console.log('✅ 테스트 축구팀 생성 완료');

    // 4. 선수 계정 생성 및 팀 할당
    console.log('🏃‍♂️ 선수(Player) 계정 생성 중...');
    const player = new User({
      email: 'test-player@youniqle.com',
      name: '박선수',
      passwordHash: passwordHash,
      role: 'member',
      emailVerified: true,
      footballRole: 'player',
      activeTeamId: team._id
    });
    await player.save();
    console.log('✅ 선수 계정 생성 완료');

    // 코치 계정에도 생성된 팀 아이디 업데이트
    coach.activeTeamId = team._id;
    await coach.save();
    console.log('🔄 코치 계정 팀 ID 업데이트 완료');

    // 5. FootballTeamMember (팀-멤버 연동) 등록
    console.log('🔗 팀 멤버 매핑(FootballTeamMember) 생성 중...');
    const coachMember = new FootballTeamMember({
      teamId: team._id,
      userId: coach._id,
      role: 'head_coach',
      status: 'active'
    });
    await coachMember.save();

    const playerMember = new FootballTeamMember({
      teamId: team._id,
      userId: player._id,
      role: 'player',
      status: 'active'
    });
    await playerMember.save();
    console.log('✅ 팀 멤버 매핑 생성 완료');

    // 6. 지난 7일간의 선수 웰니스 임시 데이터(WellnessCheck) 시드
    // ACWR(Acute:Chronic Workload Ratio) 통계 계산이 잘 구동되도록 함
    console.log('📊 박선수(Player)의 7일간 웰니스 이력 데이터 생성 중...');
    const wellnessRecords = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      // 웰니스 지표 (3~5 범위 내)
      const sleep = 3 + (i % 3);    // 3, 4, 5 번갈아
      const soreness = 4;
      const fatigue = 3 + (i % 2); // 3, 4 번갈아
      const stress = 4;
      const mood = 4;
      const wellnessScore = (sleep + soreness + fatigue + stress + mood) / 5;

      // 훈련 강도 및 시간 (RPE 1-10, Duration 분)
      const rpe = 5 + (i % 3); // 5, 6, 7 번갈아 (적당한 훈련 강도)
      const sessionDuration = i === 2 ? 0 : 90; // 하루는 휴식(시간 0)
      const sessionType = i === 2 ? 'rest' : 'training';
      const sessionLoad = rpe * sessionDuration;

      wellnessRecords.push({
        userId: player._id,
        teamId: team._id,
        date: dateStr,
        sleep,
        soreness,
        fatigue,
        stress,
        mood,
        wellnessScore,
        rpe,
        sessionType,
        sessionDuration,
        sessionLoad,
        source: 'quick'
      });
    }

    // 일괄 삽입
    await WellnessCheck.insertMany(wellnessRecords);
    console.log('✅ 웰니스 이력 7일치 삽입 완료');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 축구 플랫폼 테스트 시드 데이터 구축 완료!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚽ 축구팀 정보:');
    console.log('   - 팀명: 테스트 FC');
    console.log('   - 팀코드: TESTFC');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👑 코치(Coach) 계정:');
    console.log('   - 이메일: test-coach@youniqle.com');
    console.log('   - 비밀번호: test1234!');
    console.log('   - 권한: 헤드코치 (head_coach)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏃‍♂️ 선수(Player) 계정:');
    console.log('   - 이메일: test-player@youniqle.com');
    console.log('   - 비밀번호: test1234!');
    console.log('   - 웰니스 기록: 최근 7일치 시드 완료 (ACWR 확인 가능)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ 테스트 데이터 시드 실패:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 종료');
  }
}

seedFootballData();
