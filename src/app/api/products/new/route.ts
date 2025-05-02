import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
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
  const dateajout_max = searchParams.get('dateajout_max') || '';
  const dateajout_min = searchParams.get('dateajout_min') || '';

  try {
    const response = await fetch(`http://164.132.51.245:5003/products/new?ref=${search}&designation=${search}&page=${page}&products_per_page=${limit}&brand=${brand}&stock=${stock}&sort_by=${sort_by}&order=${order}&dateajout_min=${dateajout_min}&dateajout_max=${dateajout_max}&price_min=${price_min}&price_max=${price_max}&subcategory=${subcategory}`);
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch  {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
