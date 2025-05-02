// app/api/stats/added-per-date/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const company = searchParams.get('company') || 'tunisianet';

  const baseUrls = {
    tunisianet: 'http://164.132.51.245:5003/products/stats/added-per-date',
    mytek: 'http://192.168.10.17:5003/products/stats/added-per-date?source=mytek',
    spacenet: ''
  };

  const apiUrl = baseUrls[company as keyof typeof baseUrls];
  
  if (!apiUrl) {
    return NextResponse.json({ error: 'Company API not implemented' }, { status: 501 });
  }

  try {
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch added per date stats' }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching added per date stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}