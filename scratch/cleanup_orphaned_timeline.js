const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

async function cleanup() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const User = mongoose.model('User', new mongoose.Schema({
      email: String,
      scanTimeline: Array
    }));

    const LifeSnap = mongoose.model('LifeSnap', new mongoose.Schema({
        imageUrl: String,
        userId: mongoose.Schema.Types.ObjectId
    }));

    const user = await User.findOne({ email: 'grigobio237@gmail.com' });
    if (!user) {
      console.log('User not found');
      return;
    }

    console.log(`Found user: ${user.email} (${user._id})`);
    console.log(`Current timeline count: ${user.scanTimeline.length}`);

    // Find entries in scanTimeline that don't have a matching LifeSnap
    const orphanedEntries = [];
    const updatedTimeline = [];

    for (const entry of user.scanTimeline) {
        const exists = await LifeSnap.findOne({ imageUrl: entry.imageUrl, userId: user._id });
        if (exists) {
            updatedTimeline.push(entry);
        } else {
            console.log(`Found orphaned entry: ${entry.imageUrl} (Summary: ${entry.summary})`);
            orphanedEntries.push(entry);
        }
    }

    if (orphanedEntries.length > 0) {
        console.log(`Removing ${orphanedEntries.length} orphaned entries...`);
        user.scanTimeline = updatedTimeline;
        await user.save();
        console.log('User timeline updated successfully.');
    } else {
        console.log('No orphaned entries found.');
    }

  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
  }
}

cleanup();
