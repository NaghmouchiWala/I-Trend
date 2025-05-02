// lib/user.ts
import { hash } from 'bcrypt';
import clientPromise from './mongodb_auth';
import { ObjectId } from 'mongodb';

export type User = {
  _id?: ObjectId;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
};

export async function createUser(userData: Omit<User, '_id' | 'createdAt'>) {
  try {
    const client = await clientPromise;
    const db = client.db('Data');
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    // Hash the password
    const hashedPassword = await hash(userData.password, 10);
    
    // Create the user
    const result = await db.collection('users').insertOne({
      ...userData,
      password: hashedPassword,
      createdAt: new Date()
    });
    
    return { success: true, id: result.insertedId };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function getUserByEmail(email: string) {
  try {
    const client = await clientPromise;
    const db = client.db('Data');
    return await db.collection('users').findOne({ email });
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
}

export async function getUserById(id: string) {
  try {
    const client = await clientPromise;
    const db = client.db('Data');
    return await db.collection('users').findOne({ _id: new ObjectId(id) });
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
}