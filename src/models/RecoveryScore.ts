import mongoose, { Document, Schema } from 'mongoose';

export interface IRecoveryScore extends Document {
    userId: mongoose.Types.ObjectId;
    date: Date; // Normalized to midnight or ISO date string for "Daily" uniqueness
    rawScore: number; // 0-25 sum of 5 questions
    totalScore: number; // 0-100 converted score
    metaphor: 'TOWER' | 'CLOCK' | 'FOOTPRINTS';
    answers: Array<{
        questionId: number;
        category: string;
        score: number;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

const RecoveryScoreSchema = new Schema<IRecoveryScore>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    date: {
        type: Date,
        required: true,
        index: true, // For querying "today's score" quickly
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
        enum: ['TOWER', 'CLOCK', 'FOOTPRINTS'],
        required: true,
    },
    answers: [{
        questionId: { type: Number, required: true },
        category: { type: String, required: true },
        score: { type: Number, required: true },
    }],
}, {
    timestamps: true,
});

// Compound index to ensure one score per user per day
RecoveryScoreSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.models.RecoveryScore || mongoose.model<IRecoveryScore>('RecoveryScore', RecoveryScoreSchema);
