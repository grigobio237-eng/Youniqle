import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { AutomationRule } from '@/lib/advancedMarketingAutomation';
import mongoose from 'mongoose';

// 자동화 규칙 스키마 (실제 구현에서는 별도 모델 생성)
const AutomationRuleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  trigger: {
    eventType: { type: String, required: true },
    conditions: [{
      field: String,
      operator: String,
      value: mongoose.Schema.Types.Mixed
    }],
    cooldown: Number
  },
  conditions: {
    userSegment: [String],
    userTags: [String],
    userBehavior: [{
      field: String,
      operator: String,
      value: mongoose.Schema.Types.Mixed,
      timeWindow: Number
    }],
    timeRestrictions: {
      startTime: String,
      endTime: String,
      daysOfWeek: [Number],
      timezone: String
    }
  },
  actions: [{
    type: { type: String, required: true },
    config: mongoose.Schema.Types.Mixed
  }],
  status: { type: String, enum: ['active', 'inactive', 'draft'], default: 'draft' },
  priority: { type: Number, default: 1 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stats: {
    totalTriggers: { type: Number, default: 0 },
    totalActions: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 },
    lastTriggered: Date
  }
}, {
  timestamps: true
});

const AutomationRuleModel = mongoose.models.AutomationRule || mongoose.model('AutomationRule', AutomationRuleSchema);

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const query: any = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const totalRules = await AutomationRuleModel.countDocuments(query);
    const rules = await AutomationRuleModel.find(query)
      .populate('createdBy', 'name email')
      .sort({ priority: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      rules,
      totalPages: Math.ceil(totalRules / limit),
      currentPage: page,
      totalRules
    });

  } catch (error) {
    console.error('Error fetching automation rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch automation rules' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ruleData = await request.json();
    
    // 필수 필드 검증
    if (!ruleData.name || !ruleData.trigger || !ruleData.actions) {
      return NextResponse.json(
        { error: 'Missing required fields: name, trigger, actions' },
        { status: 400 }
      );
    }

    // 사용자 ID 가져오기
    const user = await mongoose.model('User').findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const newRule = new AutomationRuleModel({
      ...ruleData,
      createdBy: user._id,
      stats: {
        totalTriggers: 0,
        totalActions: 0,
        successRate: 0
      }
    });

    await newRule.save();

    return NextResponse.json(newRule, { status: 201 });

  } catch (error) {
    console.error('Error creating automation rule:', error);
    return NextResponse.json(
      { error: 'Failed to create automation rule' },
      { status: 500 }
    );
  }
}














