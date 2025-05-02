import { MongoClient } from 'mongodb';

const MONGODB_URI =  'mongodb://localhost:27017/';
const MONGODB_DB =  'scrap';

// Cache the MongoDB connection
let cachedClient: MongoClient | null = null;

export async function connectToMongoDB() {
  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    cachedClient = client;
    return client;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}