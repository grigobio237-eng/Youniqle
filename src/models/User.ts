import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash?: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: 'member' | 'partner' | 'admin';
  grade: 'cedar' | 'rooter' | 'bloomer' | 'glower' | 'ecosoul';
  points: number;
  referralCode?: string; // 추천인 아이디
  referredBy?: string; // 추천받은 사용자의 추천인 코드
  provider?: 'local' | 'google' | 'kakao' | 'naver';
  providerId?: string;
  marketingConsent: boolean;
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  addresses: Array<{
    label: string;
    recipient: string;
    phone: string;
    zip: string;
    addr1: string;
    addr2?: string;
  }>;
  wishlist: Array<{
    productId: mongoose.Types.ObjectId;
    addedAt: Date;
  }>;
  // 파트너 관련 필드
  partnerStatus: 'none' | 'pending' | 'approved' | 'rejected' | 'suspended';
  partnerApplication?: {
    businessName: string;
    businessNumber: string;
    businessAddress: string;
    businessPhone: string;
    businessDescription: string;
    bankAccount: string;
    bankName: string;
    accountHolder: string;
    businessRegistrationImage?: string; // 사업자등록증 이미지
    bankStatementImage?: string; // 통장사본 이미지
    appliedAt: Date;
    approvedAt?: Date;
    rejectedAt?: Date;
    rejectedReason?: string;
    approvedBy?: mongoose.Types.ObjectId;
  };
  partnerSettings?: {
    commissionRate: number; // 수수료율 (기본 10%)
    autoApproval: boolean; // 주문 자동 승인 여부
    notificationEmail: string; // 알림 받을 이메일
    notificationPhone: string; // 알림 받을 전화번호
  };
  partnerStats?: {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    totalCommission: number;
    lastSettlementAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: function() {
      return this.provider === 'local';
    },
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  avatar: {
    type: String,
  },
  role: {
    type: String,
    enum: ['member', 'partner', 'admin'],
    default: 'member',
  },
  grade: {
    type: String,
    enum: ['cedar', 'rooter', 'bloomer', 'glower', 'ecosoul'],
    default: 'cedar',
  },
  points: {
    type: Number,
    default: 0,
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true, // null 값은 인덱스에서 제외
  },
  referredBy: {
    type: String,
  },
  provider: {
    type: String,
    enum: ['local', 'google', 'kakao', 'naver'],
    default: 'local',
  },
  providerId: {
    type: String,
  },
  marketingConsent: {
    type: Boolean,
    default: false,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
  },
  emailVerificationExpires: {
    type: Date,
  },
  addresses: [{
    label: { type: String, required: true },
    recipient: { type: String, required: true },
    phone: { type: String, required: false },
    zip: { type: String, required: true },
    addr1: { type: String, required: true },
    addr2: { type: String },
  }],
  wishlist: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    addedAt: { type: Date, default: Date.now },
  }],
  // 파트너 관련 필드
  partnerStatus: {
    type: String,
    enum: ['none', 'pending', 'approved', 'rejected', 'suspended'],
    default: 'none'
  },
  partnerApplication: {
    businessName: { type: String, trim: true },
    businessNumber: { type: String, trim: true },
    businessAddress: { type: String, trim: true },
    businessPhone: { type: String, trim: true },
    businessDescription: { type: String, trim: true },
    bankAccount: { type: String, trim: true },
    bankName: { type: String, trim: true },
    accountHolder: { type: String, trim: true },
    businessRegistrationImage: { type: String, trim: true },
    bankStatementImage: { type: String, trim: true },
    appliedAt: { type: Date },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    rejectedReason: { type: String, trim: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  partnerSettings: {
    commissionRate: { type: Number, default: 10, min: 0, max: 50 },
    autoApproval: { type: Boolean, default: false },
    notificationEmail: { type: String, trim: true },
    notificationPhone: { type: String, trim: true }
  },
  partnerStats: {
    totalProducts: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    totalCommission: { type: Number, default: 0 },
    lastSettlementAt: { type: Date }
  }
}, {
  timestamps: true,
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

