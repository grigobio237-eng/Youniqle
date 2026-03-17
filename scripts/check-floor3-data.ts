
import { connectDB } from '../src/lib/db';
import Product from '../src/models/Product';
import mongoose from 'mongoose';

async function checkFloor3Products() {
    try {
        await connectDB();
        console.log('--- Checking Pavilion Floor 3 (Coaching) Products ---');
        const products = await Product.find({ pavilionFloorId: 'floor-3' }).lean();
        console.log(`Found ${products.length} products on floor-3.`);
        products.forEach((p, idx) => {
            console.log(`${idx + 1}. ${p.name} (Category: ${p.category})`);
        });
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkFloor3Products();
