
const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://grigobio237_db_user:Youniqle2024!@cluster0.e78xeiw.mongodb.net/youniqle?retryWrites=true&w=majority&appName=Cluster0';

async function checkData() {
  try {
    await mongoose.connect(MONGODB_URI);
    const pre = await mongoose.connection.db.collection('preconsultations').find().limit(3).toArray();
    console.log('PreConsultations Sample:');
    console.log(JSON.stringify(pre, null, 2));

    const concierge = await mongoose.connection.db.collection('conciergerequests').find().limit(3).toArray();
    console.log('ConciergeRequests Sample:');
    console.log(JSON.stringify(concierge, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

checkData();
