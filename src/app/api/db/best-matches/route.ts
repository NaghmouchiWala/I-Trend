import { NextResponse } from 'next/server';
import { connectToMongoDB } from '@/lib/mongodb';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const topN = parseInt(searchParams.get('topN') || '3');
  
  try {
    const client = await connectToMongoDB();
    const db = client.db("scrap");
    const collection = db.collection("BRAND_CATEGORY");
    
    const result = await collection.find({})
      .sort({ average_similarity_score: -1 })
      .limit(topN)
      .project({
        tunisianet_name: 1,
        mytek_name: 1,
        tunisianet_reference: 1,
        mytek_reference: 1,
        reference_similarity_score: 1,
        name_similarity_score: 1,
        average_similarity_score: 1,
        _id: 1
      })
      .toArray();
    
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error finding best matches:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'An unknown error occurred' }, { status: 500 });
  }
}