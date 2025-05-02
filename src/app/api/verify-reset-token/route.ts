// app/api/verify-reset-token/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb_auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }
    
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('Data');
    const usersCollection = db.collection('users');
    
    // Find the user with the token and check if it's expired
    const user = await usersCollection.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }
    
    return NextResponse.json({ valid: true }, { status: 200 });
  } catch (error) {
    console.error('Error verifying reset token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}