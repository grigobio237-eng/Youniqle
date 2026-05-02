import mongoose, { Schema, Document } from 'mongoose';

export interface IRecommendedProduct {
    productId?: mongoose.Types.ObjectId;
    name: string;
    reason: string;
    price?: number;
    imageUrl?: string;
}

export interface IRecoveryReport extends Document {
    userId: mongoose.Types.ObjectId;
    weekStartDate: Date;
    weekEndDate: Date;
    analyzedSnapCount: number;
    score: number;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    actionPlan: string;
    recommendedProducts: IRecommendedProduct[];
    createdAt: Date;
}

const RecommendedProductSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true },
    reason: { type: String, required: true },
    price: { type: Number },
    imageUrl: { type: String }
});

const RecoveryReportSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    weekStartDate: { type: Date, required: true },
    weekEndDate: { type: Date, required: true },
    analyzedSnapCount: { type: Number, required: true, default: 0 },
    score: { type: Number, required: true, min: 0, max: 100 },
    summary: { type: String, required: true },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    actionPlan: { type: String, required: true },
    recommendedProducts: [RecommendedProductSchema],
    createdAt: { type: Date, default: Date.now }
});

// 복합 인덱스: 한 유저가 같은 주의 리포트를 여러 개 가지지 않도록 (단일 조회 성능 향상)
RecoveryReportSchema.index({ userId: 1, weekStartDate: 1 }, { unique: true });

export default mongoose.models.RecoveryReport || mongoose.model<IRecoveryReport>('RecoveryReport', RecoveryReportSchema);
