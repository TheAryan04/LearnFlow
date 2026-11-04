import { MongoClient } from 'mongodb';

const mongoUrl = process.env.MONGO_URL;
if (!mongoUrl) {
  throw new Error('MONGO_URL must be configured before the database module is loaded');
}

export const client = new MongoClient(mongoUrl);
export const db = client.db(process.env.DB_NAME);
export const connectDb = () => client.connect();
