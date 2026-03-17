const mongoose = require('mongoose');

async function listUsers() {
  try {
    const mongoUri = 'mongodb://localhost:27017/youniqle';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String
    }));

    const users = await User.find({}).select('name email');
    console.log('Total users:', users.length);
    console.log(JSON.stringify(users, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

listUsers();
