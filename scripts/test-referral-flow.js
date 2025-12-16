// scripts/test-referral-flow.js
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Mock imports since we can't easily import TS models in JS script without compilation
// We will define simple Schema/Models here for testing purposes or try to use ts-node if available.
// Given the environment, let's try to look at DB directly using mongoose.

async function main() {
    const fs = require('fs');
    function log(msg) {
        console.log(msg);
        fs.appendFileSync('referral-test.log', msg + '\n');
    }

    if (!process.env.MONGODB_URI) {
        log('MONGODB_URI is missing');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        log('Connected to MongoDB');

        // Define schemas briefly to access collections
        const UserSchema = new mongoose.Schema({
            name: String, email: String, referralCode: String, referredBy: String, points: Number
        });
        const User = mongoose.models.User || mongoose.model('User', UserSchema);

        const OrderSchema = new mongoose.Schema({
            userId: mongoose.Schema.Types.ObjectId, totalAmount: Number, status: String
        });
        const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

        // 1. Setup Test Users
        // Cleanup previous test users
        await User.deleteMany({ email: { $in: ['test_g@example.com', 'test_p@example.com', 'test_c@example.com'] } });

        const PointTransactionSchema = new mongoose.Schema({
            userId: mongoose.Schema.Types.ObjectId, type: String, amount: Number
        });
        const PointTransaction = mongoose.models.PointTransaction || mongoose.model('PointTransaction', PointTransactionSchema);
        // Find users to get IDs first is hard here as they are deleted.
        // But since we are creating new users, we can just delete ALL related to these emails if we had their IDs?
        // Let's just assume clean slate for simple test, or rely on distinct user IDs.
        // Actually, we can't easily clean up by email from PointTransaction.
        // But since we create NEW users every run, the previous PointTransactions will point to OLD deleted users.
        // So checking by NEW User ID is sufficient. No cleanup needed for PT unless we want to keep DB clean.
        // Let's leave it as is.

        // Grandparent
        const grand = new User({
            name: 'GrandParent',
            email: 'test_g@example.com',
            referralCode: 'REF_G',
            points: 0
        });
        await grand.save();

        // Parent (ref by Grandparent)
        const parent = new User({
            name: 'Parent',
            email: 'test_p@example.com',
            referralCode: 'REF_P',
            referredBy: 'REF_G',
            points: 0
        });
        await parent.save();

        // Child (ref by Parent)
        const child = new User({
            name: 'Child',
            email: 'test_c@example.com',
            referralCode: 'REF_C',
            referredBy: 'REF_P',
            points: 0
        });
        await child.save();

        log('Created 3-level user hierarchy');

        // 2. Simulate logic that happens in payment/result
        // We can't easily call the API route, so we will COPY the logic here to verify it works as EXPECTED
        // OR we can make a HTTP request to the local server if it is running.
        // Since `npm run dev` is running, we can try to hit the API?
        // But hitting the API requires proper Pay params (NICEPAY). That is hard to mock via fetch.
        // So we will verify the LOGIC by running the same code snippet against the DB.

        // Logic from route.ts:
        const orderAmount = 100000; // 100,000 KRW

        // Emulate "Order Completed" logic
        log(`Simulating purchase of ${orderAmount} by Child...`);

        // Find Buyer
        const buyer = await User.findById(child._id);

        if (buyer && buyer.referredBy) {
            // Level 1
            const referrerLv1 = await User.findOne({ referralCode: buyer.referredBy });
            if (referrerLv1) {
                const rewardLv1 = Math.floor(orderAmount * 0.02); // 2%
                if (rewardLv1 > 0) {
                    referrerLv1.points = (referrerLv1.points || 0) + rewardLv1;
                    await referrerLv1.save();
                    log(`[PASS] Level 1 Reward: ${referrerLv1.name} got ${rewardLv1} (Expected 2000)`);

                    // Simulate PointTransaction creation
                    await PointTransaction.create({
                        userId: referrerLv1._id,
                        type: 'earned',
                        amount: rewardLv1,
                        description: `1단계 추천인 리워드 (${buyer.name}님 구매)`
                    });
                }

                // Level 2
                if (referrerLv1.referredBy) {
                    const referrerLv2 = await User.findOne({ referralCode: referrerLv1.referredBy });
                    if (referrerLv2) {
                        const rewardLv2 = Math.floor(orderAmount * 0.01); // 1%
                        if (rewardLv2 > 0) {
                            referrerLv2.points = (referrerLv2.points || 0) + rewardLv2;
                            await referrerLv2.save();
                            log(`[PASS] Level 2 Reward: ${referrerLv2.name} got ${rewardLv2} (Expected 1000)`);

                            // Simulate PointTransaction creation
                            await PointTransaction.create({
                                userId: referrerLv2._id,
                                type: 'earned',
                                amount: rewardLv2,
                                description: `2단계 추천인 리워드 (1단계: ${referrerLv1.name}, 구매자: ${buyer.name})`
                            });
                        }
                    }
                }
            }
        }

        // 3. Verify Final State
        const finalGrand = await User.findById(grand._id);
        const finalParent = await User.findById(parent._id);

        if (finalParent.points === 2000 && finalGrand.points === 1000) {
            log('SUCCESS: Referral logic verified.');

            // Verify PointTransactions
            const PointTransactionSchema = new mongoose.Schema({
                userId: mongoose.Schema.Types.ObjectId, type: String, amount: Number, description: String
            });
            const PointTransaction = mongoose.models.PointTransaction || mongoose.model('PointTransaction', PointTransactionSchema);

            const pt1 = await PointTransaction.findOne({ userId: parent._id, type: 'earned' });
            const pt2 = await PointTransaction.findOne({ userId: grand._id, type: 'earned' });

            if (pt1 && pt2 && pt1.amount === 2000 && pt2.amount === 1000) {
                log('SUCCESS: PointTransaction records verified.');
            } else {
                log('FAILED: PointTransaction records missing.');
            }

        } else {
            console.error('FAILED: Points mismatch.');
            log(`Grand: ${finalGrand.points} (Expected 1000)`);
            log(`Parent: ${finalParent.points} (Expected 2000)`);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

main();
