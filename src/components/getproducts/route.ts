// File: app/components/product/getproducts/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const reference = searchParams.get('reference');
  const topN = parseInt(searchParams.get('topN') || '3');
  
  if (!reference) {
    return NextResponse.json({ error: 'Reference parameter is required' }, { status: 400 });
  }
  
  try {
    const client = await connectToMongoDB();
    const db = client.db("scrap");
    
    // First try to find the product in BRAND_CATEGORY collection by reference
    const collection = db.collection("BRAND_CATEGORY");
    
    // Query to find products with similar references
    // Use a regex search to find partial matches
    const query = {
      $or: [
        { tunisianet_reference: { $regex: reference, $options: 'i' } },
        { mytek_reference: { $regex: reference, $options: 'i' } }
      ]
    };
    
    // Sort by similarity score and limit to topN results
    const result = await collection.find(query)
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
    
    // If we have enough results, return them
    if (result.length >= topN) {
      return NextResponse.json(result, { status: 200 });
    }
    
    // Otherwise, fall back to a text search on product names in the collection
    // This helps when references don't match well
    const nameSearchResult = await collection.find({
      $or: [
        { tunisianet_name: { $exists: true, $ne: null } },
        { mytek_name: { $exists: true, $ne: null } }
      ]
    })
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
    
    return NextResponse.json(nameSearchResult, { status: 200 });
  } catch (error) {
    console.error('Error finding similar products:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'An unknown error occurred' }, { status: 500 });
  }
}