import { MongoClient } from "mongodb";

const uri = "mongodb://localhost:27017";
const dbName = "scrap";

export async function POST(req) {
  try {
    const { query, type, threshold } = await req.json();
    const client = await MongoClient.connect(uri);
    const db = client.db(dbName);
    const collection = db.collection("BRAND_CATEGORY");

    // Get store statistics
    const statsPipeline = [
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          tunisianetProducts: { $sum: { $cond: [{ $ifNull: ["$tunisianet_reference", false] }, 1, 0] }},
          mytekProducts: { $sum: { $cond: [{ $ifNull: ["$mytek_reference", false] }, 1, 0] }},
          totalBrands: { $addToSet: "$brand" },
          totalCategories: { $addToSet: "$category" },
          avgTunisianetPrice: { $avg: "$tunisianet_price" },
          avgMytekPrice: { $avg: "$mytek_price" }
        }
      }
    ];

    const statsResult = await collection.aggregate(statsPipeline).toArray();
    const stats = statsResult[0] || {};

    // Get the requested data
    const data = await collection.find({}).toArray();
    const df = data.map(item => ({
      ...item,
      reference_similarity_score: item.reference_similarity_score ?? 0,
      name_similarity_score: item.name_similarity_score ?? 0,
      price_difference: item.price_difference ?? 0,
      average_similarity_score: item.average_similarity_score ?? 0,
      tunisianet_price: item.tunisianet_price ?? 0,
      mytek_price: item.mytek_price ?? 0,
    }));

    let result = [];
    if (type === "duplicates") {
      result = df.filter(item => item.average_similarity_score > parseFloat(threshold));
    } else if (type === "prices") {
      result = df.filter(item => {
        const priceDiff = Math.abs((item.tunisianet_price || 0) - (item.mytek_price || 0));
        const avgPrice = ((item.tunisianet_price || 0) + (item.mytek_price || 0)) / 2;
        return (priceDiff / avgPrice * 100) > parseFloat(threshold);
      });
    } else if (type === "search") {
      result = df.filter(item => 
        (item.tunisianet_reference || "").toLowerCase().includes(query.toLowerCase()) ||
        (item.mytek_reference || "").toLowerCase().includes(query.toLowerCase())
      );
    }

    client.close();
    
    return new Response(JSON.stringify({
      result,
      mytekStats: {
        totalProducts: stats.mytekProducts || 0,
        totalBrands: stats.totalBrands?.length || 0,
        totalCategories: stats.totalCategories?.length || 0,
        avgPrice: stats.avgMytekPrice || 0
      },
      tunisianetStats: {
        totalProducts: stats.tunisianetProducts || 0,
        totalBrands: stats.totalBrands?.length || 0,
        totalCategories: stats.totalCategories?.length || 0,
        avgPrice: stats.avgTunisianetPrice || 0
      }
    }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}