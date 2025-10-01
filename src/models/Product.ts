import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  stock: number;
  minStock?: number; // 최소 재고 수준
  maxStock?: number; // 최대 재고 수준
  reservedStock?: number; // 예약된 재고 (주문은 했지만 아직 결제 안된)
  category: string;
  status: 'active' | 'hidden' | 'out_of_stock'; // 재고 부족 상태 추가
  featured?: boolean;
  images: Array<{
    url: string;
    w?: number;
    h?: number;
    type?: string;
  }>;
  summary: string;
  description: string;
  // 카테고리별 특화 정보 (선택적)
  nutritionInfo?: {
    calories?: string;
    protein?: string;
    fat?: string;
    carbohydrates?: string;
    sodium?: string;
  };
  originInfo?: {
    origin?: string;
    storageMethod?: string;
    shelfLife?: string;
    packagingMethod?: string;
  };
  clothingInfo?: {
    sizeGuide?: string;
    material?: string;
    careInstructions?: string;
  };
  electronicsInfo?: {
    specifications?: string;
    includedItems?: string;
    warranty?: string;
  };
  // 파트너 관련 필드
  partnerId?: mongoose.Types.ObjectId; // 파트너 ID
  partnerName?: string; // 파트너 이름
  partnerEmail?: string; // 파트너 이메일 (알림용)
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  originalPrice: {
    type: Number,
    min: 0,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  minStock: {
    type: Number,
    default: 10,
  },
  maxStock: {
    type: Number,
    default: 1000,
  },
  reservedStock: {
    type: Number,
    default: 0,
    min: 0,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['active', 'hidden', 'out_of_stock'],
    default: 'active',
  },
  featured: {
    type: Boolean,
    default: false,
  },
  images: [{
    url: { type: String, required: true },
    w: { type: Number },
    h: { type: Number },
    type: { type: String },
  }],
  summary: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  // 카테고리별 특화 정보 (선택적)
  nutritionInfo: {
    calories: { type: String },
    protein: { type: String },
    fat: { type: String },
    carbohydrates: { type: String },
    sodium: { type: String },
  },
  originInfo: {
    origin: { type: String },
    storageMethod: { type: String },
    shelfLife: { type: String },
    packagingMethod: { type: String },
  },
  clothingInfo: {
    sizeGuide: { type: String },
    material: { type: String },
    careInstructions: { type: String },
  },
  electronicsInfo: {
    specifications: { type: String },
    includedItems: { type: String },
    warranty: { type: String },
  },
  // 파트너 관련 필드
  partnerId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  partnerName: {
    type: String,
    trim: true
  },
  partnerEmail: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
});

// Index for search and filtering
ProductSchema.index({ name: 'text', summary: 'text', description: 'text' });
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ price: 1 });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

