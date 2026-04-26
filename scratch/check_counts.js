
const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://grigobio237_db_user:Youniqle2024!@cluster0.e78xeiw.mongodb.net/youniqle?retryWrites=true&w=majority&appName=Cluster0';

async function checkCounts() {
  try {
    await mongoose.connect(MONGODB_URI);
    const collections = ['preconsultations', 'conciergerequests', 'navigatorconsultations'];
    for (const c of collections) {
      const count = await mongoose.connection.db.collection(c).countDocuments();
      console.log(`${c}: ${count}`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

checkCounts();
