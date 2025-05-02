// app/api/stats/top-modified/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const company = searchParams.get('company') || 'tunisianet';

  const baseUrls = {
    tunisianet: 'http://164.132.51.245:5003/products/stats/top-modified',
    mytek: 'http://192.168.10.17:5003/products/stats/top-modified?source=mytek',
    spacenet: ''
  };

  const apiUrl = baseUrls[company as keyof typeof baseUrls];
  
  if (!apiUrl) {
    return NextResponse.json({ error: 'Company API not implemented' }, { status: 501 });
  }

  try {
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch top modified products' }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching top modified products:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}