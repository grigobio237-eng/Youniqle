import mongoose, { Document, Schema } from 'mongoose';

export interface IWellnessCheck extends Document {
  userId: mongoose.Types.ObjectId;
  teamId: mongoose.Types.ObjectId;
  date: string;              // YYYY-MM-DD 형식 (하루 1회)
  // 후퍼 지표 (1-5 스케일)
  sleep: number;             // 수면의 질
  sleepDuration?: number;    // 수면 시간 (시간 단위, 선택)
  soreness: number;          // 근육 통증 (역방향: 5=통증없음, 1=매우아픔)
  fatigue: number;           // 피로도 (역방향: 5=활력, 1=매우피곤)
  stress: number;            // 스트레스 (역방향: 5=없음, 1=매우높음)
  mood: number;              // 기분 (5=매우좋음, 1=매우나쁨)
  wellnessScore: number;     // 5개 평균 (1-5)
  notes?: {
    sleep?: string;
    soreness?: string;
    fatigue?: string;
    stress?: string;
    mood?: string;
  };
  // 훈련 부하 (RPE 기반)
  rpe?: number;              // 운동 자각도 1-10 (Borg CR-10)
  sessionType?: 'training' | 'match' | 'rest';
  sessionDuration?: number;  // 분 단위
  sessionLoad?: number;      // RPE × 시간(분) = sRPE
  // 추가 정보
  injuryNote?: string;       // 부상/통증 부위 메모
  source: 'quick' | 'scanner' | 'diagnosis'; // 어떤 경로로 입력했는지
  createdAt: Date;
  updatedAt: Date;
}

const WellnessCheckSchema = new Schema<IWellnessCheck>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    teamId: { type: Schema.Types.ObjectId, ref: 'FootballTeam', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    sleep: { type: Number, required: true, min: 1, max: 5 },
    sleepDuration: { type: Number, min: 0, max: 24 },
    soreness: { type: Number, required: true, min: 1, max: 5 },
    fatigue: { type: Number, required: true, min: 1, max: 5 },
    stress: { type: Number, required: true, min: 1, max: 5 },
    mood: { type: Number, required: true, min: 1, max: 5 },
    wellnessScore: { type: Number, required: true, min: 1, max: 5 },
    notes: {
      sleep: { type: String, default: '' },
      soreness: { type: String, default: '' },
      fatigue: { type: String, default: '' },
      stress: { type: String, default: '' },
      mood: { type: String, default: '' },
    },
    rpe: { type: Number, min: 1, max: 10 },
    sessionType: { type: String, enum: ['training', 'match', 'rest'] },
    sessionDuration: { type: Number, min: 0 },
    sessionLoad: { type: Number, min: 0 },
    injuryNote: { type: String, trim: true },
    source: { type: String, enum: ['quick', 'scanner', 'diagnosis'], default: 'quick' },
  },
  { timestamps: true }
);

// 한 유저당 하루 1회만 기록 가능
WellnessCheckSchema.index({ userId: 1, date: 1 }, { unique: true });
// 팀별 조회용 인덱스
WellnessCheckSchema.index({ teamId: 1, date: 1 });
// ACWR 계산을 위한 범위 조회용
WellnessCheckSchema.index({ userId: 1, teamId: 1, date: -1 });

export default mongoose.models.WellnessCheck || mongoose.model<IWellnessCheck>('WellnessCheck', WellnessCheckSchema);
