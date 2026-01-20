
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env.local');
    process.exit(1);
}

const userSchema = new mongoose.Schema({
    email: String,
    name: String,
    diagnosisResults: Array
}, { collection: 'users' });

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Verify Diagnosis Model
const Diagnosis = mongoose.models.Diagnosis || mongoose.model('Diagnosis', new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId }, { collection: 'diagnoses' }));

async function checkAndClearUser() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Target emails to check
        const emails = ['sin931017@gmail.com', 'sin93101190@gmail.com'];

        for (const email of emails) {
            console.log(`Checking user: ${email}`);
            const user = await User.findOne({ email });

            if (user) {
                console.log(`Found user: ${user.name} (${user.email})`);

                // 1. Clear User.diagnosisResults
                if (user.diagnosisResults?.length > 0) {
                    console.log('Clearing user.diagnosisResults...');
                    user.diagnosisResults = [];
                    await user.save();
                    console.log('User results cleared.');
                } else {
                    console.log('User.diagnosisResults is empty.');
                }

                // 2. Clear Diagnosis Collection
                const diagnosisCount = await Diagnosis.countDocuments({ userId: user._id });
                console.log(`Found ${diagnosisCount} documents in Diagnosis collection.`);

                if (diagnosisCount > 0) {
                    await Diagnosis.deleteMany({ userId: user._id });
                    console.log('Deleted all documents from Diagnosis collection.');
                }

            } else {
                console.log('User not found.');
            }
            console.log('---');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
}

checkAndClearUser();
