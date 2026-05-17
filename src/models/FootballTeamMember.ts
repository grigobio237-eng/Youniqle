import mongoose, { Document, Schema } from 'mongoose';

export interface IFootballTeamMember extends Document {
  teamId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: 'head_coach' | 'coach' | 'trainer' | 'medical' | 'player' | 'guardian';
  // 선수 전용 필드
  position?: 'MF' | 'FW' | 'DF' | 'GK';
  playerNumber?: number;
  weight?: number;            // kg (영양 계산용)
  height?: number;            // cm
  dominantFoot?: 'left' | 'right' | 'both';
  birthDate?: Date;
  // 보호자-자녀 연결
  linkedPlayerId?: mongoose.Types.ObjectId; // 보호자일 때 연결된 선수(자녀)의 member _id
  // 이적 관련
  status: 'active' | 'inactive' | 'transferred';
  pastDataConsent: boolean;    // 이적 시 과거 데이터 공유 동의
  joinedAt: Date;
  leftAt?: Date;
  // 역할별 권한 (코치/스태프용)
  permissions?: {
    viewWellness: boolean;     // 웰니스 데이터 열람
    viewAcwr: boolean;         // ACWR 데이터 열람
    manageAnnouncements: boolean; // 공지사항 관리
    manageSchedule: boolean;   // 스케줄 관리
    manageMembers: boolean;    // 멤버 관리
    viewReports: boolean;      // 리포트 열람
  };
  createdAt: Date;
  updatedAt: Date;
}

// 역할별 기본 권한 매핑
export const DEFAULT_PERMISSIONS: Record<string, IFootballTeamMember['permissions']> = {
  head_coach: {
    viewWellness: true,
    viewAcwr: true,
    manageAnnouncements: true,
    manageSchedule: true,
    manageMembers: true,
    viewReports: true,
  },
  coach: {
    viewWellness: true,
    viewAcwr: true,
    manageAnnouncements: true,
    manageSchedule: true,
    manageMembers: false,
    viewReports: true,
  },
  trainer: {
    viewWellness: true,
    viewAcwr: true,
    manageAnnouncements: false,
    manageSchedule: false,
    manageMembers: false,
    viewReports: true,
  },
  medical: {
    viewWellness: true,
    viewAcwr: true,
    manageAnnouncements: false,
    manageSchedule: false,
    manageMembers: false,
    viewReports: true,
  },
  player: {
    viewWellness: false,
    viewAcwr: false,
    manageAnnouncements: false,
    manageSchedule: false,
    manageMembers: false,
    viewReports: false,
  },
  guardian: {
    viewWellness: false,
    viewAcwr: false,
    manageAnnouncements: false,
    manageSchedule: false,
    manageMembers: false,
    viewReports: false,
  },
};

const FootballTeamMemberSchema = new Schema<IFootballTeamMember>(
  {
    teamId: { type: Schema.Types.ObjectId, ref: 'FootballTeam', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: {
      type: String,
      enum: ['head_coach', 'coach', 'trainer', 'medical', 'player', 'guardian'],
      required: true,
    },
    // 선수 전용
    position: { type: String, enum: ['MF', 'FW', 'DF', 'GK'] },
    playerNumber: { type: Number },
    weight: { type: Number },
    height: { type: Number },
    dominantFoot: { type: String, enum: ['left', 'right', 'both'] },
    birthDate: { type: Date },
    // 보호자 연결
    linkedPlayerId: { type: Schema.Types.ObjectId, ref: 'User' },
    // 상태
    status: {
      type: String,
      enum: ['active', 'inactive', 'transferred'],
      default: 'active',
    },
    pastDataConsent: { type: Boolean, default: false },
    joinedAt: { type: Date, default: Date.now },
    leftAt: { type: Date },
    // 권한
    permissions: {
      viewWellness: { type: Boolean, default: false },
      viewAcwr: { type: Boolean, default: false },
      manageAnnouncements: { type: Boolean, default: false },
      manageSchedule: { type: Boolean, default: false },
      manageMembers: { type: Boolean, default: false },
      viewReports: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// 동일 팀에 동일 유저 중복 가입 방지 (active 상태 기준)
FootballTeamMemberSchema.index({ teamId: 1, userId: 1, status: 1 }, { unique: true });
// 빠른 조회를 위한 인덱스
FootballTeamMemberSchema.index({ userId: 1, status: 1 });
FootballTeamMemberSchema.index({ teamId: 1, role: 1 });

// 역할에 따른 기본 권한 자동 설정
FootballTeamMemberSchema.pre('save', function(this: any, next) {
  if (this.isNew && !this.permissions?.viewWellness && DEFAULT_PERMISSIONS[this.role]) {
    this.permissions = { ...DEFAULT_PERMISSIONS[this.role] };
  }
  next();
});

export default mongoose.models.FootballTeamMember || mongoose.model<IFootballTeamMember>('FootballTeamMember', FootballTeamMemberSchema);
