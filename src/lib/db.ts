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
          bufferCommands: true, // 버퍼링 활성화로 연결 안정성 향상
          maxPoolSize: 5, // 서버리스에 맞게 연결 수 감소
          minPoolSize: 0, // 서버리스에서는 최소 연결 수 0
          maxIdleTimeMS: 10000, // 10초로 단축
          serverSelectionTimeoutMS: 5000, // 5초로 증가
          socketTimeoutMS: 15000, // 15초로 단축
          connectTimeoutMS: 5000, // 5초로 단축
          retryWrites: true,
          retryReads: true,
          // 서버리스 환경 최적화 옵션 추가
          heartbeatFrequencyMS: 10000,
          maxStalenessSeconds: 90,
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

