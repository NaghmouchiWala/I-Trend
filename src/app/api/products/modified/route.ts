import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const company = searchParams.get('company') || 'tunisianet'; // Default to tunisianet
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '10';
  const search = searchParams.get('designation') || '';
  const brand = searchParams.get('brand') || '';
  const stock = searchParams.get('stock') || '';
  const sort_by = searchParams.get('sort_by') || '';
  const order = searchParams.get('order') || '';
  const price_min = searchParams.get('price_min') || '';
  const price_max = searchParams.get('price_max') || '';
  const subcategory = searchParams.get('subcategory') || '';
  const modification_date_max = searchParams.get('modification_date_max') || '';
  const modification_date_min = searchParams.get('modification_date_min') || '';

  try {
    let apiUrl = '';
    
    if (company === 'mytek') {
      apiUrl = `http://192.168.10.17:5003/products?source=mytek&ref=${search}&designation=${search}&page=${page}&products_per_page=${limit}&brand=${brand}&stock=${stock}&sort_by=${sort_by}&order=${order}&price_min=${price_min}&price_max=${price_max}&subcategory=${subcategory}&modification_date_min=${modification_date_min}&modification_date_max=${modification_date_max}`;
    } else {
      // Default to tunisianet
      apiUrl = `http://164.132.51.245:5003/products/modified?ref=${search}&designation=${search}&page=${page}&products_per_page=${limit}&brand=${brand}&stock=${stock}&sort_by=${sort_by}&order=${order}&price_min=${price_min}&price_max=${price_max}&subcategory=${subcategory}&modification_date_min=${modification_date_min}&modification_date_max=${modification_date_max}`;
    }

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch data from ${company}` }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
    
  } catch (error) {
    console.error(`Error fetching data from ${company}:`, error);
    return NextResponse.json(
      { error: `Internal Server Error when fetching from ${company}` }, 
      { status: 500 }
    );
  }
}