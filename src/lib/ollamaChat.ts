import { getAiConfig } from './aiConfig';

type Msg = { role: 'user' | 'assistant' | 'system'; content: string };

export async function streamOllamaChat({
  messages,
  characterName,
  characterPersonality,
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
  characterName: string;
  characterPersonality: string;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError?: (err: string) => void;
}) {
  const config = getAiConfig();

  const systemPrompt = `You are ${characterName}, an AI character with the following personality: ${characterPersonality}. 
Stay fully in character at all times. Respond creatively, expressively, and consistently with your personality. 
Keep responses concise but engaging (2-4 sentences unless asked for more detail). 
Never break character or acknowledge being an AI language model.`;

  try {
    const resp = await fetch(`${config.ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.ollamaModel,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      onError?.(`Ollama error ${resp.status}: ${text}`);
      onDone();
      return;
    }

    if (!resp.body) { onDone(); return; }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let newlineIdx: number;
      while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, newlineIdx).trim();
        buffer = buffer.slice(newlineIdx + 1);
        if (!line) continue;

        try {
          const parsed = JSON.parse(line);
          if (parsed.message?.content) {
            onDelta(parsed.message.content);
          }
          if (parsed.done) {
            onDone();
            return;
          }
        } catch { /* skip malformed */ }
      }
    }

    onDone();
  } catch (err) {
    onError?.(err instanceof Error ? err.message : 'Failed to connect to Ollama');
    onDone();
  }
}

export async function isOllamaAvailable(): Promise<boolean> {
  const config = getAiConfig();
  if (!config.configured) return false;
  try {
    const resp = await fetch(`${config.ollamaUrl}/api/tags`, { signal: AbortSignal.timeout(3000) });
    return resp.ok;
  } catch {
    return false;
  }
}
