import { NextResponse } from 'next/server';
import { connectToMongoDB } from '../../../lib/mongodb';

export async function GET() {
  try {
    const client = await connectToMongoDB();
    const db = client.db("scrap");
    const collection = db.collection("BRAND_CATEGORY");
    
    // Get total count
    const totalProducts = await collection.countDocuments();
    
    // Calculate average match score
    const matchScoreResult = await collection.aggregate([
      { $group: { _id: null, averageScore: { $avg: "$average_similarity_score" } } }
    ]).toArray();
    const averageMatchScore = matchScoreResult[0]?.averageScore || 0;
    
    // Count potential duplicates (similarity > 85%)
    const duplicatesCount = await collection.countDocuments({
      average_similarity_score: { $gt: 85 }
    });
    
    // Count price anomalies (price difference > 0.5)
    const anomaliesCount = await collection.countDocuments({
      price_difference: { $gt: 0.5 }
    });
    
    return NextResponse.json({
      totalProducts,
      averageMatchScore,
      duplicatesCount,
      anomaliesCount
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching stats:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}