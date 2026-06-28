import { NextRequest, NextResponse } from 'next/server';
import { generateWithProvider } from '@/lib/server/providers-runtime';
import { getProvider, isCliOnlyProvider } from '@/lib/providers';
import type { ModelProvider } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { provider, apiKey } = await request.json();
    if (!provider || !apiKey) {
      return NextResponse.json({ valid: false, error: 'Missing provider or apiKey' }, { status: 400 });
    }
    if (isCliOnlyProvider(provider as ModelProvider)) {
      return NextResponse.json({ valid: false, error: 'CLI-only providers cannot be tested via this endpoint' }, { status: 400 });
    }
    const providerInfo = getProvider(provider as ModelProvider);
    if (!providerInfo) {
      return NextResponse.json({ valid: false, error: 'Unknown provider' }, { status: 400 });
    }
    await generateWithProvider(provider as ModelProvider, apiKey, 'You are a test assistant.', 'Say "ok" and nothing else.', {
      model: providerInfo.defaultModel,
      maxTokens: 10,
    });
    return NextResponse.json({ valid: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ valid: false, error: message });
  }
}
