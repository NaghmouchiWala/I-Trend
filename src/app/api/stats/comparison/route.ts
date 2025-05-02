// app/api/stats/comparison/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const metric = searchParams.get('metric') || 'products';

  // In a real implementation, you would fetch data from both company APIs
  // and combine them for comparison
  try {
    // Fetch data from tunisianet
    const tunisianetResponse = await fetch(`http://164.132.51.245:5003/stats/comparison?metric=${metric}`);
    
    // Fetch data from mytek
    const mytekResponse = await fetch(`http://192.168.10.17:5003/stats/comparison?metric=${metric}&source=mytek`);
    
    if (!tunisianetResponse.ok || !mytekResponse.ok) {
      return NextResponse.json({ 
        error: 'Failed to fetch comparison data' 
      }, { status: 500 });
    }
    
    const tunisianetData = await tunisianetResponse.json();
    const mytekData = await mytekResponse.json();
    
    // Combine and transform the data for comparison
    // This is a simplified example - your actual data structure may differ
    const combinedData = transformComparisonData(tunisianetData, mytekData, metric);
    
    return NextResponse.json({ data: combinedData }, { status: 200 });
  } catch (error) {
    console.error('Error fetching comparison data:', error);
    
    // For now, return mock data since the real API endpoints might not exist yet
    const mockData = getMockComparisonData(metric);
    return NextResponse.json({ data: mockData }, { status: 200 });
  }
}

// Helper functions to transform and combine data
function transformComparisonData(tunisianetData: any, mytekData: any, metric: string) {
  // Transform actual API data here based on your API response structure
  // This is a placeholder for the real implementation
  
  // For now, return mock data
  return getMockComparisonData(metric);
}

function getMockComparisonData(metric: string) {
  const mockDataMap: Record<string, any[]> = {
    products: [
      { name: 'Total Products', tunisianet: 12500, mytek: 9800 },
      { name: 'In Stock', tunisianet: 8200, mytek: 6300 },
      { name: 'Out of Stock', tunisianet: 3100, mytek: 2500 },
      { name: 'On Order', tunisianet: 1200, mytek: 1000 },
    ],
    stock: [
      { name: 'High Stock (>50)', tunisianet: 4200, mytek: 3100 },
      { name: 'Medium Stock (10-50)', tunisianet: 2800, mytek: 2200 },
      { name: 'Low Stock (<10)', tunisianet: 1200, mytek: 1000 },
      { name: 'Out of Stock', tunisianet: 3100, mytek: 2500 },
    ],
    pricing: [
      { name: '<100 TND', tunisianet: 3800, mytek: 2900 },
      { name: '100-500 TND', tunisianet: 5200, mytek: 4100 },
      { name: '500-1000 TND', tunisianet: 2300, mytek: 1800 },
      { name: '>1000 TND', tunisianet: 1200, mytek: 1000 },
    ],
    categories: [
      { name: 'Computers', tunisianet: 2800, mytek: 2200 },
      { name: 'Phones', tunisianet: 2100, mytek: 1700 },
      { name: 'Accessories', tunisianet: 3600, mytek: 2900 },
      { name: 'Other', tunisianet: 4000, mytek: 3000 },
    ],
  };
  
  return mockDataMap[metric] || mockDataMap.products;
}