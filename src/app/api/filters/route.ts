// app/api/filters/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const company = searchParams.get('company') || 'tunisianet';

  // Define API URLs for different companies
  const baseUrls = {
    tunisianet: 'http://164.132.51.245:5003/filter',
    mytek: 'http://192.168.10.17:5003/filter?source=mytek',
   
    spacenet: '' 
  };

  // Check if the company is supported
  if (!baseUrls[company as keyof typeof baseUrls]) {
    return NextResponse.json({ error: 'Company not supported' }, { status: 400 });
  }

  // Get the appropriate URL based on company
  const apiRequestUrl = baseUrls[company as keyof typeof baseUrls];
  
  // If no valid URL (like for unimplemented companies), return error
  if (!apiRequestUrl) {
    return NextResponse.json({ error: 'Company API not implemented' }, { status: 501 });
  }

  try {
    const response = await fetch(apiRequestUrl);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch filters' }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching filters:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}