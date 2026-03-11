const STORAGE_KEY = 'keven-eleven-config';

export interface AiConfig {
  ollamaUrl: string;
  ollamaModel: string;
  configured: boolean;
}

const defaults: AiConfig = {
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: 'llama3',
  configured: false,
};

export function getAiConfig(): AiConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

export function saveAiConfig(config: Partial<AiConfig>) {
  const current = getAiConfig();
  const next = { ...current, ...config, configured: true };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function isConfigured(): boolean {
  return getAiConfig().configured;
}
