import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function verify() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('--- Verification Report ---');

        const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
        const products = await Product.find({}).limit(5);
        console.log('\n[Products]');
        products.forEach(p => {
            console.log(`- Name: ${p.name}`);
            console.log(`  Image: ${p.images?.[0]?.url?.substring(0, 80)}...`);
        });

        const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const users = await User.find({ avatar: { $exists: true, $ne: null } }).limit(5);
        console.log('\n[Users]');
        users.forEach(u => {
            console.log(`- Email: ${u.email}`);
            console.log(`  Avatar: ${u.avatar?.substring(0, 80)}...`);
        });

        const Review = mongoose.models.Review || mongoose.model('Review', new mongoose.Schema({}, { strict: false }));
        const reviews = await Review.find({ images: { $exists: true, $not: { $size: 0 } } }).limit(5);
        console.log('\n[Reviews]');
        reviews.forEach(r => {
            console.log(`- ID: ${r._id}`);
            console.log(`  Image: ${r.images?.[0]?.substring(0, 80)}...`);
        });

        console.log('\n--- Verification Complete ---');
        process.exit(0);
    } catch (err) {
        console.error('Verification failed:', err);
        process.exit(1);
    }
}

verify();
