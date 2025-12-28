import mongoose, { Document, Schema } from 'mongoose';

export interface IDailyQuestion extends Document {
    date: string; // YYYY-MM-DD format
    dayOfWeek: number; // 0-6
    theme: string;
    questions: Array<{
        id: number;
        category: string;
        text: string;
        options: Array<{
            label: string;
            score: number;
        }>;
    }>;
    createdAt: Date;
}

const DailyQuestionSchema = new Schema<IDailyQuestion>({
    date: {
        type: String,
        required: true,
        unique: true, // Ensure only one set of questions per day
    },
    dayOfWeek: {
        type: Number,
        required: true,
    },
    theme: {
        type: String,
        required: true,
    },
    questions: [{
        id: { type: Number, required: true },
        category: { type: String, required: true },
        text: { type: String, required: true },
        options: [{
            label: { type: String, required: true },
            score: { type: Number, required: true }
        }]
    }],
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24 * 30 // Optional: Auto-delete after 30 days if desired, or keep for history
    }
});

export default mongoose.models.DailyQuestion || mongoose.model<IDailyQuestion>('DailyQuestion', DailyQuestionSchema);
