import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '10';
  const search = searchParams.get('search') || '';
  const brand = searchParams.get('brand') || '';
  const stock = searchParams.get('stock') || '';
  const sort_by = searchParams.get('sort_by') || '';
  const order = searchParams.get('order') || '';
  const price_min = searchParams.get('price_min') || '';
  const price_max = searchParams.get('price_max') || '';
  const subcategory = searchParams.get('subcategory') || '';
  const modification_date_min = searchParams.get('modification_date_min') || '';
  const modification_date_max = searchParams.get('modification_date_max') || '';
  const company = searchParams.get('company') || 'tunisianet';
  
  // Define company-specific API URLs
  const companyUrls = {
    tunisianet: 'http://164.132.51.245:5003/products',
    mytek: 'http://192.168.10.17:5003/products?source=mytek'
  };

  // Get the appropriate URL based on selected company
  const baseUrl = companyUrls[company as keyof typeof companyUrls] || companyUrls.tunisianet;
  
  try {
    // Determine if we need to add the source parameter
    const urlHasSourceParam = baseUrl.includes('?source=');
    const connector = urlHasSourceParam ? '&' : '?';
    
    // Construct the API URL with all parameters
    const apiRequestUrl = `${baseUrl}${connector}ref=${search}&designation=${search}&page=${page}&products_per_page=${limit}&brand=${brand}&stock=${stock}&sort_by=${sort_by}&order=${order}&price_min=${price_min}&price_max=${price_max}&subcategory=${subcategory}&modification_date_min=${modification_date_min}&modification_date_max=${modification_date_max}`;
    
    const response = await fetch(apiRequestUrl);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}