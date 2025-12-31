const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('No MONGODB_URI');
    process.exit(1);
}

async function run() {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected');

    const InquirySchema = new mongoose.Schema({
        userId: mongoose.Schema.Types.Mixed,
        inquiryId: String
    }, { strict: false });

    const Inquiry = mongoose.models.Inquiry || mongoose.model('Inquiry', InquirySchema);

    const inquiries = await Inquiry.find().lean();
    const invalid = inquiries.filter(inq => {
        if (!inq.userId) return false;
        const uidStr = inq.userId.toString();
        return !mongoose.Types.ObjectId.isValid(uidStr);
    });

    console.log('Invalid count:', invalid.length);
    for (const inq of invalid) {
        console.log(`ID: ${inq._id}, InquiryId: ${inq.inquiryId}, userId: ${inq.userId}`);
    }

    if (invalid.length > 0) {
        console.log('Cleaning up invalid userId data (setting to null)...');
        for (const inq of invalid) {
            await Inquiry.updateOne({ _id: inq._id }, { $unset: { userId: 1 } });
        }
        console.log('Cleanup complete');
    }

    process.exit(0);
}

run().catch(console.error);
