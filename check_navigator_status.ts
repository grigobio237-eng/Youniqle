import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import dbConnect from './src/lib/db';
import User from './src/models/User';

async function checkUsers() {
    await dbConnect();
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
    process.exit(0);
}

checkUsers();
