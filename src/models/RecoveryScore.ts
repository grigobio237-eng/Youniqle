import mongoose, { Document, Schema } from 'mongoose';

export interface IRecoveryScore extends Document {
    userId: mongoose.Types.ObjectId;
    date: Date; // Normalized to midnight or ISO date string for "Daily" uniqueness
    rawScore: number; // 0-25 sum of 5 questions
    totalScore: number; // 0-100 converted score
    metaphor: string;
    answers: Array<{
        questionId: number;
        category: string;
        score: number;
        detail?: string;
    }>;
    snapData?: {
        type: 'PHOTO' | 'TEXT';
        content: string;
    };
    userNote?: string; // 사용자의 자유 텍스트 상태 기록
    createdAt: Date;
    updatedAt: Date;
}

const RecoveryScoreSchema = new Schema<IRecoveryScore>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    rawScore: {
        type: Number,
        required: true,
    },
    totalScore: {
        type: Number,
        required: true,
    },
    metaphor: {
        type: String,
        required: true,
    },
    answers: [{
        questionId: { type: Number, required: true },
        category: { type: String, required: true },
        score: { type: Number, required: true },
        detail: { type: String, required: false },
    }],
    snapData: {
        type: { type: String, enum: ['PHOTO', 'TEXT'] },
        content: { type: String }
    },
    userNote: {
        type: String,
        required: false
    },
}, {
    timestamps: true,
});

// Compound index to ensure one score per user per day
RecoveryScoreSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.models.RecoveryScore || mongoose.model<IRecoveryScore>('RecoveryScore', RecoveryScoreSchema);
