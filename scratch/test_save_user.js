const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function run() {
  const uri = process.env.MONGODB_URI;
  console.log('Connecting to MongoDB:', uri ? 'Configured ✅' : 'Missing ❌');
  
  if (!uri) return;
  
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB successfully!');
    
    // We must load User model properly or simulate User model
    let User;
    try {
      // Try to load model schema
      require('../src/models/User'); 
      User = mongoose.models.User;
    } catch (e) {
      console.log('Could not load User model file, using fallbacks', e.message);
      User = mongoose.model('User', new mongoose.Schema({}, { strict: false, collection: 'users' }));
    }
    
    console.log('Creating a test user to see if it saves...');
    
    const email = `test_diagnose_${Date.now()}@example.com`;
    const user = new User({
      email: email,
      passwordHash: 'dummy_hash',
      name: 'Test Diagnose',
      provider: 'local',
      termsAcceptedAt: new Date(),
      privacyAcceptedAt: new Date(),
      sensitiveInfoAcceptedAt: new Date(),
      thirdPartyAcceptedAt: new Date(),
      marketingConsent: false,
      emailVerified: false,
      referralCode: `RF_DIAG_${Date.now().toString().slice(-4)}`
    });
    
    await user.save();
    console.log('✅ User saved successfully! Email:', email);
    
    // Clean up
    await User.deleteOne({ _id: user._id });
    console.log('✅ Test user cleaned up.');
    
  } catch (error) {
    console.error('❌ Error saving user:');
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

run();
