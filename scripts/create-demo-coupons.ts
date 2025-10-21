import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Coupon from '@/models/Coupon';
import connectDB from '@/lib/db';

dotenv.config();

async function main() {
  try {
    await connectDB();

    const now = new Date();
    const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const monthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const demoCoupons = [
      {
        code: 'WELCOME10',
        name: '신규회원 10% 할인',
        description: '가입 후 7일간 사용 가능',
        type: 'percentage',
        value: 10,
        validityType: 'from_download',
        validityDurationDays: 7,
        targetAudience: 'new_customers',
        userUsageLimit: 1,
      },
      {
        code: 'SAVE5000',
        name: '5,000원 즉시할인',
        description: '전 고객 대상',
        type: 'fixed',
        value: 5000,
        validityType: 'fixed',
        validFrom: now,
        validUntil: monthLater,
        targetAudience: 'all',
      },
      {
        code: 'FREESHIP30',
        name: '무료배송 (3만원 이상)',
        description: '3만원 이상 주문 시 무료배송',
        type: 'free_shipping',
        value: 0,
        validityType: 'fixed',
        validFrom: now,
        validUntil: monthLater,
        minOrderAmount: 30000,
        targetAudience: 'all',
      },
      {
        code: 'VIP15',
        name: 'VIP 15% 할인',
        description: '최대 20,000원',
        type: 'percentage',
        value: 15,
        validityType: 'fixed',
        validFrom: now,
        validUntil: monthLater,
        maxDiscountAmount: 20000,
        targetAudience: 'vip_customers',
      },
    ] as any[];

    for (const c of demoCoupons) {
      const exists = await Coupon.findOne({ code: c.code });
      if (exists) continue;
      await Coupon.create({
        ...c,
        createdBy: new mongoose.Types.ObjectId(),
      });
      console.log(`Created coupon: ${c.code}`);
    }

    console.log('Demo coupons seeded.');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();



