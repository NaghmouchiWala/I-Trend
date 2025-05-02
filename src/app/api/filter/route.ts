import { NextResponse } from 'next/server';

export async function GET() {
  const apiUrl = 'http://164.132.51.245:5003/filter';

  try {
    const response = await fetch(`${apiUrl}`);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
