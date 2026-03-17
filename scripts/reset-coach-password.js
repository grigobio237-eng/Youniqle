
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not found');
  process.exit(1);
}

const UserSchema = new mongoose.Schema({
  email: String,
  passwordHash: String
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function resetPassword() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');

    const email = 'coach-test@youniqle.com';
    const newPassword = 'youniqle123!';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    const result = await User.updateOne({ email }, { $set: { passwordHash } });
    
    if (result.matchedCount > 0) {
      console.log(`Password reset for ${email} successfully to: ${newPassword}`);
    } else {
      console.log(`User ${email} not found`);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

resetPassword();
