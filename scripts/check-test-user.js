
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not found');
  process.exit(1);
}

const UserSchema = new mongoose.Schema({
  email: String,
  passwordHash: String,
  role: String,
  partnerStatus: String,
  partnerApplication: Object,
  partnerSettings: Object
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function checkUser() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');

    const user = await User.findOne({ email: 'coach-test@youniqle.com' });
    if (user) {
      console.log('User found:');
      console.log(JSON.stringify(user, null, 2));
    } else {
      console.log('User not found');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkUser();
