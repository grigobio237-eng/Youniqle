
const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://grigobio237_db_user:Youniqle2024!@cluster0.e78xeiw.mongodb.net/youniqle?retryWrites=true&w=majority&appName=Cluster0';

async function checkAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    const user = await mongoose.connection.db.collection('users').findOne({ email: 'grigobio237@gmail.com' });
    console.log('Admin User Role:', user?.role);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

checkAdmin();
