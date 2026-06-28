import fs from 'fs';
import path from 'path';

export interface PromptProfile {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
}

export interface AppDefaults {
  model?: string;
  tone?: string;
  level?: string;
  style?: string;
  profileId?: string;
}

interface ProfilesFile {
  defaults?: AppDefaults;
  profiles: PromptProfile[];
}

interface ParsedFile {
  profiles: PromptProfile[];
  defaults: AppDefaults;
}

let cache: ParsedFile | null = null;

function loadFile(): ParsedFile {
  if (cache && process.env.NODE_ENV !== 'development') return cache;
  try {
    const filePath = path.join(process.cwd(), 'config', 'prompt-profiles.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed: ProfilesFile = JSON.parse(raw);
    cache = {
      profiles: Array.isArray(parsed.profiles) ? parsed.profiles : [],
      defaults: parsed.defaults ?? {},
    };
  } catch {
    cache = { profiles: [], defaults: {} };
  }
  return cache;
}

export function loadPromptProfiles(): PromptProfile[] {
  return loadFile().profiles;
}

export function loadAppDefaults(): AppDefaults {
  return loadFile().defaults;
}

export function getPromptProfile(id: string): PromptProfile | undefined {
  return loadPromptProfiles().find(p => p.id === id);
}
