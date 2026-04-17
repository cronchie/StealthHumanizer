import { NextRequest, NextResponse } from 'next/server';
import { detectWithGPTZero } from '@/lib/gptzero';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }

    const result = await detectWithGPTZero(text);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error';
    const status = message.includes('API key') ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
