import { NextRequest, NextResponse } from 'next/server';
import { scoreHumanLikeness } from '@/lib/server/model-runtime';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ success: false, error: 'Missing text' }, { status: 400 });
    }
    const result = await scoreHumanLikeness(text);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal error' }, { status: 500 });
  }
}
