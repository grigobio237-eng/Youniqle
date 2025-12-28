import mongoose, { Document, Schema } from 'mongoose';

export interface IAiRoutineLog extends Document {
    userId: mongoose.Types.ObjectId;
    date: Date;
    routines: Array<{
        id: string;
        time: 'MORNING' | 'DAY' | 'NIGHT';
        title: string;
        isCompleted: boolean;
        completedAt?: Date;
    }>;
    aiComment?: string;
    createdAt: Date;
    updatedAt: Date;
}

const AiRoutineLogSchema = new Schema<IAiRoutineLog>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    routines: [{
        id: { type: String, required: true },
        time: {
            type: String,
            enum: ['MORNING', 'DAY', 'NIGHT'],
            required: true
        },
        title: { type: String, required: true },
        isCompleted: { type: Boolean, default: false },
        completedAt: { type: Date }
    }],
    aiComment: {
        type: String,
    }
}, {
    timestamps: true,
});

// Ensure one routine log per user per day
AiRoutineLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.models.AiRoutineLog || mongoose.model<IAiRoutineLog>('AiRoutineLog', AiRoutineLogSchema);
