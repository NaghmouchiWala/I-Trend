import { NextResponse } from 'next/server';
import { connectToMongoDB } from '../../../lib/mongodb';

export async function GET() {
  try {
    const client = await connectToMongoDB();
    return NextResponse.json({ status: 'connected' }, { status: 200 });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({ status: 'disconnected', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}