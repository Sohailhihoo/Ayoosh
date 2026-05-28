import mongoose from 'mongoose';
import dns from 'dns';

// Use Google DNS to resolve MongoDB SRV records (avoids router DNS failures)
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

// Cache the connection across hot reloads in development
let cached = global._mongoose;

if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable in .env.local');
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false })
      .catch((err) => {
        // Clear the cached promise on failure so the next request retries
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
