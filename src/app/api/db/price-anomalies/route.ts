import { NextResponse } from 'next/server';
import { connectToMongoDB } from '@/lib/mongodb';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const threshold = parseFloat(searchParams.get('threshold') || '10');
  const similarityThreshold = parseFloat(searchParams.get('similarityThreshold') || '90');

  try {
    const client = await connectToMongoDB();
    const db = client.db("scrap");
    const collection = db.collection("BRAND_CATEGORY");
    
    // Add aggregation to calculate price difference percentage with similarity score filter
    const result = await collection.aggregate([
      {
        $match: {
          tunisianet_price: { $exists: true, $ne: null },
          mytek_price: { $exists: true, $ne: null },
          average_similarity_score: { $exists: true, $gt: similarityThreshold } 
        }
      },
      {
        $addFields: {
          avg_price: { $avg: ["$tunisianet_price", "$mytek_price"] },
          abs_price_diff: { $abs: { $subtract: ["$tunisianet_price", "$mytek_price"] } }
        }
      },
      {
        $addFields: {
          price_difference_percentage: {
            $multiply: [{ $divide: ["$abs_price_diff", "$avg_price"] }, 100]
          },
          best_deal: {
            $cond: {
              if: { $lt: ["$tunisianet_price", "$mytek_price"] },
              then: "tunisianet",
              else: {
                $cond: {
                  if: { $lt: ["$mytek_price", "$tunisianet_price"] },
                  then: "mytek",
                  else: "equal"
                }
              }
            }
          }
        }
      },
      {
        $match: {
          price_difference_percentage: { $gt: threshold }
        }
      },
      {
        $sort: { price_difference_percentage: -1 }
      },
      {
        $project: {
          tunisianet_name: 1,
          mytek_name: 1,
          tunisianet_reference: 1,
          mytek_reference: 1,
          tunisianet_price: 1,
          mytek_price: 1,
          price_difference: "$abs_price_diff",
          price_difference_percentage: 1,
          best_deal: 1,
          average_similarity_score: 1,
          _id: 1
        }
      }
    ]).toArray();
    
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error finding price anomalies:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'An unknown error occurred' }, { status: 500 });
  }
}