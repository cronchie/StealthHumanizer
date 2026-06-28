import { NextResponse } from 'next/server';
import { loadPromptProfiles, loadAppDefaults } from '@/lib/server/prompt-profiles';

export async function GET() {
  const profiles = loadPromptProfiles().map(({ id, name, description }) => ({ id, name, description }));
  const defaults = loadAppDefaults();
  return NextResponse.json({ profiles, defaults });
}
