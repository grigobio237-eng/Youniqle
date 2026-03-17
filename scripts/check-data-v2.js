
const mongoose = require('mongoose');

// Define Schema for checking
const ProductSchema = new mongoose.Schema({
    name: String,
    category: String,
    pavilionFloorId: String,
}, { strict: false });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function checkData() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/youniqle';
        await mongoose.connect(MONGODB_URI);
        console.log('--- Checking for any Pavilion/Coaching data ---');
        
        const allPavilion = await Product.find({ pavilionFloorId: { $exists: true } }).lean();
        console.log(`Total pavilion products found: ${allPavilion.length}`);
        
        allPavilion.forEach(p => {
            console.log(`- ${p.name} (Floor: ${p.pavilionFloorId}, Category: ${p.category})`);
        });

        const coachingProducts = await Product.find({ 
            $or: [
                { category: /coach/i },
                { category: /program/i },
                { name: /코치/i },
                { name: /프로그램/i }
            ]
        }).lean();
        console.log(`Coaching related products found: ${coachingProducts.length}`);
        
        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkData();
