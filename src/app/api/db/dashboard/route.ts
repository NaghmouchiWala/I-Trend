import { NextResponse } from 'next/server';
import { connectToMongoDB } from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await connectToMongoDB();
    const db = client.db("scrap");
    const collection = db.collection("BRAND_CATEGORY");
    
    const totalProducts = await collection.countDocuments();
    
    const aggregateResult = await collection.aggregate([
      {
        $match: {
          tunisianet_price: { $exists: true, $ne: null },
          mytek_price: { $exists: true, $ne: null }
        }
      },
      {
        $addFields: {
          avg_price: { $avg: ["$tunisianet_price", "$mytek_price"] },
          abs_price_diff: { $abs: { $subtract: ["$tunisianet_price", "$mytek_price"] } },
          price_percentage_diff: {
            $multiply: [
              { $divide: [
                { $abs: { $subtract: ["$tunisianet_price", "$mytek_price"] } },
                { $avg: ["$tunisianet_price", "$mytek_price"] }
              ]},
              100
            ]
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
        $group: {
          _id: null,
          averageMatchScore: { $avg: "$average_similarity_score" },
          avgPriceDifference: { $avg: "$price_percentage_diff" },
          duplicatesCount: {
            $sum: {
              $cond: [{ $gt: ["$average_similarity_score", 85] }, 1, 0]
            }
          },
          anomaliesCount: {
            $sum: {
              $cond: [{ $gt: ["$price_percentage_diff", 10] }, 1, 0]
            }
          },
          tunisianetBestCount: {
            $sum: {
              $cond: [{ $eq: ["$best_deal", "tunisianet"] }, 1, 0]
            }
          },
          mytekBestCount: {
            $sum: {
              $cond: [{ $eq: ["$best_deal", "mytek"] }, 1, 0]
            }
          },
          equalPriceCount: {
            $sum: {
              $cond: [{ $eq: ["$best_deal", "equal"] }, 1, 0]
            }
          }
        }
      }
    ]).toArray();
    
    const stats = {
      totalProducts,
      averageMatchScore: aggregateResult[0]?.averageMatchScore || 0,
      avgPriceDifference: aggregateResult[0]?.avgPriceDifference || 0,
      duplicatesCount: aggregateResult[0]?.duplicatesCount || 0,
      anomaliesCount: aggregateResult[0]?.anomaliesCount || 0,
      bestDeals: {
        tunisianet: aggregateResult[0]?.tunisianetBestCount || 0,
        mytek: aggregateResult[0]?.mytekBestCount || 0,
        equal: aggregateResult[0]?.equalPriceCount || 0
      }
    };
    
    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'An unknown error occurred' }, { status: 500 });
  }
}