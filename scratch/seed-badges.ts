import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Badge } from '../src/models/Badge';

dotenv.config({ path: '.env.local' });

async function seed() {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is not defined');

    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const initialBadges = [
        {
            code: 'first_step',
            name: '회복의 첫걸음',
            description: '첫 번째 60초 리듬체크를 완료했습니다.',
            icon: '🌱',
            category: 'achievement',
            rarity: 'common',
            criteria: { type: 'checkin_count', value: 1 }
        },
        {
            code: 'streak_3',
            name: '삼일천하 극복',
            description: '3일 연속으로 회복 리듬을 기록했습니다.',
            icon: '🔥',
            category: 'streak',
            rarity: 'common',
            criteria: { type: 'streak_days', value: 3 }
        },
        {
            code: 'streak_7',
            name: '일주일의 기적',
            description: '7일 연속으로 회복 리듬을 기록했습니다.',
            icon: '🌈',
            category: 'streak',
            rarity: 'rare',
            criteria: { type: 'streak_days', value: 7 }
        },
        {
            code: 'recovery_master',
            name: '회복 마스터',
            description: '회복 점수 90점 이상을 달성했습니다.',
            icon: '🏆',
            category: 'achievement',
            rarity: 'epic',
            criteria: { type: 'percentile', value: 10 }
        },
        {
            code: 'early_bird',
            name: '부지런한 아침',
            description: '오전 8시 이전에 회복 리듬을 체크했습니다.',
            icon: '🌅',
            category: 'special',
            rarity: 'rare',
            criteria: { type: 'time_of_day', value: 8 }
        }
    ];

    for (const b of initialBadges) {
        await Badge.findOneAndUpdate({ code: b.code }, b, { upsert: true, new: true });
        console.log(`Seeded badge: ${b.name}`);
    }

    console.log('All badges seeded successfully');
    await mongoose.connection.close();
}

seed().catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
