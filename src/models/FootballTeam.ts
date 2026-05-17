import mongoose, { Document, Schema } from 'mongoose';

export interface IFootballTeam extends Document {
  teamName: string;
  teamCode: string;           // 고유 팀 코드 (QR/링크에 사용)
  category: 'youth' | 'pro' | 'amateur';
  ageGroup?: string;          // 예: 'U-12', 'U-15', 'U-18', '성인'
  region?: string;            // 활동 지역
  description?: string;
  logoUrl?: string;
  inviteLink: string;         // 팀 초대 링크 (유효기간 없음)
  isActive: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  rejectedReason?: string;
  maxMembers: number;         // 팀 최대 인원
  createdBy: mongoose.Types.ObjectId; // 팀 등록 요청한 코치의 userId
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FootballTeamSchema = new Schema<IFootballTeam>(
  {
    teamName: { type: String, required: true, trim: true },
    teamCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    category: { 
      type: String, 
      enum: ['youth', 'pro', 'amateur'], 
      required: true 
    },
    ageGroup: { type: String, trim: true },
    region: { type: String, trim: true },
    description: { type: String, trim: true },
    logoUrl: { type: String, trim: true },
    inviteLink: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: false },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected', 'suspended'], 
      default: 'pending' 
    },
    rejectedReason: { type: String, trim: true },
    maxMembers: { type: Number, default: 40 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
  },
  { timestamps: true }
);

// 승인 시 자동으로 isActive 활성화
FootballTeamSchema.pre('save', function(this: any, next) {
  if (this.isModified('status') && this.status === 'approved') {
    this.isActive = true;
    if (!this.approvedAt) {
      this.approvedAt = new Date();
    }
  }
  if (this.isModified('status') && ['rejected', 'suspended'].includes(this.status)) {
    this.isActive = false;
  }
  next();
});

export default mongoose.models.FootballTeam || mongoose.model<IFootballTeam>('FootballTeam', FootballTeamSchema);
