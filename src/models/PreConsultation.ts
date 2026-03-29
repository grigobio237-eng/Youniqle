import mongoose, { Schema, Document } from 'mongoose';

export interface IPreConsultation extends Document {
  user: mongoose.Types.ObjectId;
  navigator: string; // 추천인 코드 (recentNavigator 저장 값)
  
  // 1. 기대치 (Expectation)
  expectation: {
    changeScale: string; // '자연스러운 변화' vs '확실한 변화'
    downtime: string; // 예상 회복 기간 (1d, 3d, 7d, 14d)
    importantEvent: {
      hasEvent: boolean;
      details?: string;
    };
  };

  // 2. 과거 경험과 안전 (Medical History)
  medicalHistory: {
    pastExperience: {
      hasExperience: boolean;
      details?: string;
    };
    currentMedication: {
      taking: boolean;
      details?: string;
    };
    healthStatus: {
      isIssue: boolean;
      details?: string;
    };
  };

  // 3. 불안 체크 (Anxiety)
  anxiety: {
    points: string[]; // 통증, 붓기, 흉터, 남들의 시선 등
    privacyDetails?: string; 
    classifiedType?: string; // 시스템 자동 분류 혹은 수동 분류 (예: 빠른복귀형)
  };

  // 4. 방문 환경 (VIP 맞춤)
  visitPlan: {
    companion: {
      hasCompanion: boolean;
      details?: string;
    };
    transportation: {
      needsHelp: boolean;
      details?: string;
    };
    privacyRoute: {
      wantsPrivacy: boolean;
      details?: string;
    };
  };

  // 5. 투자 예산
  investment: {
    budgetRange: string;
    customBudget?: string;
    focusServices: {
      needsDedicatedManager: boolean;
      needsPremiumKit: boolean;
    };
  };

  createdAt: Date;
  updatedAt: Date;
}

const PreConsultationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    navigator: { type: String, default: '' },

    expectation: {
      changeScale: { type: String, required: true },
      downtime: { type: String, required: true },
      importantEvent: {
        hasEvent: { type: Boolean, required: true },
        details: { type: String },
      },
    },

    medicalHistory: {
      pastExperience: {
        hasExperience: { type: Boolean, required: true },
        details: { type: String },
      },
      currentMedication: {
        taking: { type: Boolean, required: true },
        details: { type: String },
      },
      healthStatus: {
        isIssue: { type: Boolean, required: true },
        details: { type: String },
      },
    },

    anxiety: {
      points: [{ type: String }],
      privacyDetails: { type: String },
      classifiedType: { type: String },
    },

    visitPlan: {
      companion: {
        hasCompanion: { type: Boolean, required: true },
        details: { type: String },
      },
      transportation: {
        needsHelp: { type: Boolean, required: true },
        details: { type: String },
      },
      privacyRoute: {
        wantsPrivacy: { type: Boolean, required: true },
        details: { type: String },
      },
    },

    investment: {
      budgetRange: { type: String, required: true },
      customBudget: { type: String },
      focusServices: {
        needsDedicatedManager: { type: Boolean, required: true, default: false },
        needsPremiumKit: { type: Boolean, required: true, default: false },
      },
    },
  },
  { timestamps: true }
);

// Prevent overwrite in development
const PreConsultation = mongoose.models.PreConsultation || mongoose.model<IPreConsultation>('PreConsultation', PreConsultationSchema);

export default PreConsultation;
