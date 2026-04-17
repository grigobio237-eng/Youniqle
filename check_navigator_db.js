const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const UserSchema = new mongoose.Schema({
  email: String,
  name: String,
  isNavigator: Boolean,
  role: String,
  grade: String,
  updatedAt: Date
}, { timestamps: true });

async function checkUsers() {
    if (!process.env.MONGODB_URI) {
        console.error('MONGODB_URI is not defined');
        process.exit(1);
    }
    
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const User = mongoose.models.User || mongoose.model('User', UserSchema);
        
        const emails = ['hssy6760@gmail.com', 'makkorea100@naver.com'];
        const users = await User.find({ email: { $in: emails } });
        
        console.log(JSON.stringify(users.map(u => ({
            email: u.email,
            name: u.name,
            isNavigator: u.isNavigator,
            role: u.role,
            grade: u.grade,
            updatedAt: u.updatedAt
        })), null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

checkUsers();
