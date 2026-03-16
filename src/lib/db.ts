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
      bufferCommands: true, // 버퍼링 활성화
      maxPoolSize: 20, // 개발 환경에서의 데드락 방지를 위해 풀 크기 증가
      minPoolSize: 1, // 최소 1개의 연결 유지로 초기 지연 방지
      maxIdleTimeMS: 10000, // 10초로 단축
      serverSelectionTimeoutMS: 5000, // 5초로 단축 (빠른 실패 유도)
      socketTimeoutMS: 30000, // 30초로 유지
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

