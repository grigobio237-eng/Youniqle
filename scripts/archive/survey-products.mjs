import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function survey() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

        const products = await Product.find({});
        console.log(`\nTotal products in DB: ${products.length}`);

        console.log('\n--- Product List ---');
        products.forEach(p => {
            console.log(`ID: ${p._id} | Name: ${p.name} | Slug: ${p.slug}`);
        });

        process.exit(0);
    } catch (err) {
        console.error('Survey failed:', err);
        process.exit(1);
    }
}

survey();
