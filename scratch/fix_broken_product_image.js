const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://grigobio237_db_user:Youniqle2024!@cluster0.e78xeiw.mongodb.net/youniqle?retryWrites=true&w=majority&appName=Cluster0';

async function fixBrokenProductImage() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const brokenUrl = 'https://images.unsplash.com/photo-1608528577891-eb0559ec5e18?w=800&q=80';
        const validUrl = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000'; 

        const productsCollection = mongoose.connection.db.collection('products');
        
        // Find products containing this broken URL
        const products = await productsCollection.find({ 'images.url': brokenUrl }).toArray();
        console.log(`Found ${products.length} products with broken image URL`);

        for (const product of products) {
            console.log(`Fixing product: ${product.name} (${product._id})`);
            
            const updatedImages = product.images.map((img) => {
                if (img.url === brokenUrl) {
                    return { ...img, url: validUrl };
                }
                return img;
            });

            await productsCollection.updateOne({ _id: product._id }, { $set: { images: updatedImages } });
        }

        console.log('Fix complete');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing product image:', error);
        process.exit(1);
    }
}

fixBrokenProductImage();
