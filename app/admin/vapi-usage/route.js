import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const privateKey = process.env.VAPI_PRIVATE_KEY;
    
    if (!privateKey) {
      return NextResponse.json({ error: 'VAPI_PRIVATE_KEY is missing in .env' }, { status: 500 });
    }

    // Fetching from start of year to get actual total usage
    const response = await fetch('https://api.vapi.ai/usage?startDate=2025-01-01T00:00:00.000Z', {
      headers: {
        'Authorization': `Bearer ${privateKey}`,
      },
    });

    if (!response.ok) throw new Error('Vapi API responded with error');

    const usageArray = await response.json();
    
    const totalCost = usageArray.reduce((acc, item) => acc + (item.cost || 0), 0);
    const totalMinutes = usageArray.reduce((acc, item) => acc + (item.duration || 0), 0);

    return NextResponse.json({ totalCost, totalMinutes });
  } catch (error) {
    console.error('Vapi Route Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}