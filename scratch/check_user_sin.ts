
import mongoose from 'mongoose';
import User from './src/models/User';
import dbConnect from './src/lib/db';

async function checkUser() {
    await dbConnect();
    const user = await User.findOne({ email: 'sin93101190@gmail.com' });
    console.log('User found:', JSON.stringify(user, null, 2));
    process.exit(0);
}

checkUser();
