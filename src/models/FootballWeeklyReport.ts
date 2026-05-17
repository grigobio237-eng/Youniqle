import mongoose, { Document, Schema } from 'mongoose';

export interface IFootballWeeklyReport extends Document {
    userId: mongoose.Types.ObjectId;
    teamId: mongoose.Types.ObjectId;
    weekStartDate: string; // YYYY-MM-DD
    weekEndDate: string; // YYYY-MM-DD
    averageWellnessScore: number;
    highestAcwr: number;
    lowestAcwr: number;
    aiSummary: string; // AI가 생성한 3-4문장 요약
    aiRecommendations: string[]; // AI가 제안하는 훈련 및 회복 방향
    createdAt: Date;
    updatedAt: Date;
}

const FootballWeeklyReportSchema = new Schema<IFootballWeeklyReport>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        teamId: { type: Schema.Types.ObjectId, ref: 'FootballTeam', required: true },
        weekStartDate: { type: String, required: true },
        weekEndDate: { type: String, required: true },
        averageWellnessScore: { type: Number, required: true },
        highestAcwr: { type: Number, required: true },
        lowestAcwr: { type: Number, required: true },
        aiSummary: { type: String, required: true },
        aiRecommendations: [{ type: String }],
    },
    { timestamps: true }
);

FootballWeeklyReportSchema.index({ userId: 1, weekStartDate: 1 }, { unique: true });
FootballWeeklyReportSchema.index({ teamId: 1, weekStartDate: 1 });

export default mongoose.models.FootballWeeklyReport || mongoose.model<IFootballWeeklyReport>('FootballWeeklyReport', FootballWeeklyReportSchema);
