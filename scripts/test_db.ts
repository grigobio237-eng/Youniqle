import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable inside .env.local');
  process.exit(1);
}

async function testConnection() {
  console.log('Attempting to connect to MongoDB...');
  console.log('URI:', MONGODB_URI.replace(/:([^@]+)@/, ':****@')); // Hide password

  try {
    const opts = {
      bufferCommands: true,
      maxPoolSize: 20,
      minPoolSize: 1,
      maxIdleTimeMS: 10000,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 30000,
      connectTimeoutMS: 5000,
      retryWrites: true,
      retryReads: true,
    };

    await mongoose.connect(MONGODB_URI!, opts);
    console.log('Successfully connected to MongoDB!');
    
    // Test a query
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in database:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  } catch (error) {
    console.error('Failed to connect to MongoDB:');
    console.error(error);
    process.exit(1);
  }
}

testConnection();
