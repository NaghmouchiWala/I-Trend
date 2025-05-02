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
  const dateajout_max = searchParams.get('dateajout_max') || '';
  const company = searchParams.get('company') || 'tunisianet'; // Default to tunisianet

  // Define API URLs for different companies
  const baseUrls = {
    tunisianet: 'http://164.132.51.245:5003/products',
    mytek: 'http://192.168.10.17:5003/products',
    // Add spacenet URL when implemented
    spacenet: '' // Placeholder for future implementation
  };

  // Check if the company is supported
  if (!baseUrls[company as keyof typeof baseUrls]) {
    return NextResponse.json({ error: 'Company not supported' }, { status: 400 });
  }

  // Get the appropriate URL based on company
  const apiBaseUrl = baseUrls[company as keyof typeof baseUrls];
  
  // If no valid URL (like for unimplemented companies), return error
  if (!apiBaseUrl) {
    return NextResponse.json({ error: 'Company API not implemented' }, { status: 501 });
  }

  try {
    // Build query parameters based on company
    const params = new URLSearchParams();
    
    // Add company-specific parameters
    if (company === 'mytek') {
      params.append('source', 'mytek');
    }
    
    // Add common parameters - only add them if they have values
    if (search) {
      params.append('ref', search);
      params.append('designation', search);
    }
    
    params.append('page', page);
    params.append('products_per_page', limit);
    
    if (brand) params.append('brand', brand);
    if (stock) params.append('stock', stock);
    if (sort_by) params.append('sort_by', sort_by);
    if (order) params.append('order', order);
    if (dateajout_max) params.append('dateajout_max', dateajout_max);
    if (price_min) params.append('price_min', price_min);
    if (price_max) params.append('price_max', price_max);
    if (subcategory) params.append('subcategory', subcategory);

    // Construct the final URL
    const finalUrl = `${apiBaseUrl}?${params.toString()}`;
    
    const response = await fetch(finalUrl);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}