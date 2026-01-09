import mongoose, { Document, Schema } from 'mongoose';

export interface IWebtoon extends Document {
    userId: mongoose.Types.ObjectId;
    date: Date;
    episodeNumber: number; // 연제 회차 (1~30)
    panels: Array<{
        panelNumber: number;
        script: string;
        imageUrl: string;
        prompt: string;
    }>;
    script: string; // 전체 요약 또는 대표 대본
    summary: string; // 다음 회차 연결을 위한 짧은 요약
    imageUrl: string; // 대표 이미지 URL
    characterPrompt: string; // 일관성을 위한 캐릭터 묘사 프롬프트
    visualStyle: string; // 사용자가 선택한 화풍
    genre: string; // 웹툰 장르
    isPublic: boolean; // 전체 공개 여부
    month: string; // 연제물 그룹화용 (예: "2026-01")
    createdAt: Date;
    updatedAt: Date;
}

const WebtoonSchema = new Schema<IWebtoon>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    episodeNumber: {
        type: Number,
        required: true
    },
    panels: [{
        panelNumber: { type: Number, required: true },
        script: { type: String, required: true },
        imageUrl: { type: String, required: true },
        prompt: { type: String, required: true }
    }],
    script: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    characterPrompt: {
        type: String,
        required: true
    },
    visualStyle: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    month: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// 동일 사용자가 같은 날짜에 중복 생성하는 것 방지 (또는 덮어쓰기)
WebtoonSchema.index({ userId: 1, date: 1 }, { unique: true });
// 월별 조회를 위한 인덱스
WebtoonSchema.index({ month: 1, isPublic: 1 });

export default mongoose.models.Webtoon || mongoose.model<IWebtoon>('Webtoon', WebtoonSchema);
