import { NextResponse } from 'next/server';
import { connectToMongoDB } from '@/lib/mongodb';

// Function to normalize a reference string
function normalizeReference(ref: string): string {
  if (!ref) return '';
  
  // Convert to lowercase, remove spaces, special characters
  return ref.toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^\w\d]/g, '');
}

// Calculate similarity between two strings (simple method)
function calculateSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  
  const normalized1 = normalizeReference(str1);
  const normalized2 = normalizeReference(str2);
  
  // Check for exact match
  if (normalized1 === normalized2) return 1;
  
  // Check if one contains the other
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
    const longerLength = Math.max(normalized1.length, normalized2.length);
    const shorterLength = Math.min(normalized1.length, normalized2.length);
    return shorterLength / longerLength;
  }
  
  // Calculate Levenshtein distance (simple version)
  const distance = levenshteinDistance(normalized1, normalized2);
  const maxLength = Math.max(normalized1.length, normalized2.length);
  
  return maxLength > 0 ? 1 - distance / maxLength : 0;
}

// Levenshtein distance calculation
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  
  // Create a matrix of size (m+1) x (n+1)
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  // Fill the first row and column
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  // Fill the rest of the matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,     // deletion
        dp[i][j - 1] + 1,     // insertion
        dp[i - 1][j - 1] + cost  // substitution
      );
    }
  }
  
  return dp[m][n];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const topN = parseInt(searchParams.get('topN') || '3');
  const reference = searchParams.get('reference');
  const productName = searchParams.get('name');
  
  if (!reference && !productName) {
    return NextResponse.json({ error: 'Either reference or name parameter is required' }, { status: 400 });
  }
  
  try {
    const client = await connectToMongoDB();
    const db = client.db("scrap");
    const collection = db.collection("BRAND_CATEGORY");
    
    // First, get all Mytek products
    const mytekProducts = await collection.find({
      mytek_name: { $exists: true, $ne: null }
    }).toArray();
    
    // Calculate similarities on the fly if we have a specific reference to match
    if (reference || productName) {
      const normalizedReference = normalizeReference(reference || '');
      const normalizedProductName = productName ? productName.toLowerCase() : '';
      
      // For each product, calculate similarity scores
      const productsWithScores = mytekProducts.map(product => {
        const mytekRef = product.mytek_reference || '';
        const mytekName = product.mytek_name || '';
        
        // Calculate reference similarity
        const refSimilarity = normalizedReference ? 
          calculateSimilarity(normalizedReference, mytekRef) : 0;
          
        // Calculate name similarity
        const nameSimilarity = normalizedProductName ? 
          calculateSimilarity(normalizedProductName, mytekName) : 0;
          
        // Calculate average similarity (weighted more towards reference if both exist)
        const averageSimilarity = (normalizedReference && normalizedProductName) ? 
          (refSimilarity * 0.7 + nameSimilarity * 0.3) : 
          (normalizedReference ? refSimilarity : nameSimilarity);
          
        return {
          ...product,
          reference_similarity_score: refSimilarity,
          name_similarity_score: nameSimilarity,
          average_similarity_score: averageSimilarity
        };
      });
      
      // Remove duplicates by mytek_reference or _id
      const seen = new Set();
      const uniqueProductsWithScores = productsWithScores.filter(product => {
        const key = product.reference_similarity_score || product._id?.toString(); // fallback to _id if no ref
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      
      // Sort by similarity score and limit to topN results
      const bestMatches = uniqueProductsWithScores
        .sort((a, b) => b.average_similarity_score - a.average_similarity_score)
        .filter(p => p.average_similarity_score >= 0.8) // Optional: keep only strong matches
        .slice(0, topN);
        
      return NextResponse.json(bestMatches, { status: 200 });
    } else {
      // If no specific reference or name, use the pre-calculated scores in MongoDB
      const result = await collection.find({
        mytek_name: { $exists: true, $ne: null }
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
        tunisianet_price: 1,
        mytek_price: 1,
        _id: 1
      })
      .toArray();
      
      return NextResponse.json(result, { status: 200 });
    }
  } catch (error) {
    console.error('Error finding best matches:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'An unknown error occurred' }, { status: 500 });
  }
}
