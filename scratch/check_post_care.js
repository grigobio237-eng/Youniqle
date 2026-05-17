const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://grigobio237_db_user:Youniqle2024!@cluster0.e78xeiw.mongodb.net/youniqle?retryWrites=true&w=majority&appName=Cluster0';

async function check() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected');
  
  const PostCareSurvey = mongoose.models.PostCareSurvey || mongoose.model('PostCareSurvey', new mongoose.Schema({}, { strict: false }));
  
  const latest = await PostCareSurvey.findOne().sort({ createdAt: -1 });
  console.log('Latest PostCareSurvey:', JSON.stringify(latest, null, 2));
  
  process.exit(0);
}

check();
