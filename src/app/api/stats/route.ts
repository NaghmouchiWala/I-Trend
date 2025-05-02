import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'category_distribution';
  const company = searchParams.get('company') || 'tunisianet';

  // Define API URLs for different companies
  const baseUrls: Record<string, string> = {
    tunisianet: 'http://164.132.51.245:5003/stats',
    mytek: 'http://192.168.10.17:5003/stats',
    // Add spacenet URL when implemented
    spacenet: '' // Placeholder for future implementation
  };

  // Check if the company is supported
  if (!baseUrls[company]) {
    return NextResponse.json({ error: 'Company not supported' }, { status: 400 });
  }

  // Get the appropriate URL based on company
  const apiUrl = baseUrls[company];

  // If no valid URL (like for unimplemented companies), return error
  if (!apiUrl) {
    return NextResponse.json({ error: 'Company API not implemented' }, { status: 501 });
  }

  try {
    // For mytek or other companies that might need source parameter
    const sourceParam = company !== 'tunisianet' ? `&source=${company}` : '';
    const finalUrl = `${apiUrl}?type=${type}${sourceParam}`;

    const response = await fetch(finalUrl);
        
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}