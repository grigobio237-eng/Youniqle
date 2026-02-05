import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../.env.local');
console.log('Loading env from:', envPath);
const result = dotenv.config({ path: envPath });

console.log('Dotenv result:', result.error ? 'Error' : 'Success');
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);

if (!process.env.MONGODB_URI) {
    process.exit(1);
}

import connectDB from '../src/lib/db.ts';
import Product from '../src/models/Product.ts';

async function checkProducts() {
    try {
        await connectDB();
        const products = await Product.find({}, 'name status approvalStatus createdAt').lean();
        console.log('Total Products:', products.length);
        products.forEach(p => {
            console.log(`- ${p.name}: status=${p.status}, approvalStatus=${p.approvalStatus}, created=${p.createdAt}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkProducts();
