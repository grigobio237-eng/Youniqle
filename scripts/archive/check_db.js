import connectDB from './src/lib/db';
import Inquiry from './src/models/Inquiry';
import mongoose from 'mongoose';

async function checkData() {
    try {
        await connectDB();
        console.log('Connected to DB');

        const count = await Inquiry.countDocuments();
        console.log('Total inquiries:', count);

        const allInquiries = await Inquiry.find().lean();

        const invalidInquiries = allInquiries.filter(inq => {
            if (!inq.userId) return false;
            return !mongoose.Types.ObjectId.isValid(inq.userId.toString());
        });

        console.log('Invalid inquiries count:', invalidInquiries.length);
        invalidInquiries.forEach(inq => {
            console.log(`Inquiry ID: ${inq.inquiryId}, Invalid userId: ${inq.userId}`);
        });

        // Optional: Delete invalid test data if user allows or if it's clearly garbage
        // if (invalidInquiries.length > 0) {
        //   const idsToDelete = invalidInquiries.map(inq => inq._id);
        //   await Inquiry.deleteMany({ _id: { $in: idsToDelete } });
        //   console.log('Deleted invalid test data');
        // }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
