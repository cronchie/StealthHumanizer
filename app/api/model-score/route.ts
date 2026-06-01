import { NextRequest, NextResponse } from 'next/server';
import { scoreHumanLikeness } from '@/lib/server/model-runtime';
import { handleApiError } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ success: false, error: 'Missing text' }, { status: 400 });
    }
    const result = await scoreHumanLikeness(text);
    return NextResponse.json({ success: true, ...result });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}
