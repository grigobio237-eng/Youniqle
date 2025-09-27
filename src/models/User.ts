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
}, {
  timestamps: true,
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

