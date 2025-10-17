import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: Cached | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
        const opts = {
          bufferCommands: true,
          maxPoolSize: 10, // 최대 연결 수
          minPoolSize: 2, // 최소 연결 수
          maxIdleTimeMS: 30000, // 30초
          serverSelectionTimeoutMS: 5000, // 5초
          socketTimeoutMS: 45000, // 45초
          connectTimeoutMS: 10000, // 10초
          retryWrites: true,
          retryReads: true,
        };

    cached!.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}

export default connectDB;
export { connectDB };

