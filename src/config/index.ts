import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

export interface Profile {
  name: string;
  description?: string;
  defaults: {
    purpose?: string;
    goals?: string;
    practices?: string;
    architecture?: string;
    domain?: string;
    gotchas?: string;
    quality?: string;
  };
  techStack?: {
    language?: string;
    framework?: string;
    styling?: string;
    testing?: string;
    other?: string[];
  };
}

export interface ClaudeMdConfig {
  activeProfile?: string;
  globalDefaults: {
    practices?: string;
    architecture?: string;
    quality?: string;
    gotchas?: string;
  };
  profiles: Profile[];
}

const DEFAULT_CONFIG: ClaudeMdConfig = {
  globalDefaults: {
    practices: '',
    architecture: '',
    quality: '',
    gotchas: '',
  },
  profiles: [
    {
      name: 'default',
      description: 'Basic defaults for any project',
      defaults: {},
    },
  ],
};

export function getConfigDir(): string {
  return join(homedir(), '.claudemd');
}

export function getConfigPath(): string {
  return join(getConfigDir(), 'config.json');
}

export function loadConfig(): ClaudeMdConfig {
  const configPath = getConfigPath();

  if (!existsSync(configPath)) {
    return DEFAULT_CONFIG;
  }

  try {
    const content = readFileSync(configPath, 'utf-8');
    const config = JSON.parse(content) as ClaudeMdConfig;
    return {
      ...DEFAULT_CONFIG,
      ...config,
      globalDefaults: {
        ...DEFAULT_CONFIG.globalDefaults,
        ...config.globalDefaults,
      },
    };
  } catch {
    console.error('Failed to parse config file, using defaults');
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(config: ClaudeMdConfig): void {
  const configDir = getConfigDir();
  const configPath = getConfigPath();

  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }

  writeFileSync(configPath, JSON.stringify(config, null, 2));
}

export function getProfile(config: ClaudeMdConfig, name?: string): Profile | undefined {
  const profileName = name || config.activeProfile || 'default';
  return config.profiles.find(p => p.name === profileName);
}

export function mergeWithDefaults(
  config: ClaudeMdConfig,
  profileName?: string
): Profile['defaults'] {
  const profile = getProfile(config, profileName);

  return {
    ...config.globalDefaults,
    ...profile?.defaults,
  };
}
