import { useState } from 'react';
import { getAiConfig, saveAiConfig } from '@/lib/aiConfig';
import { Settings, Zap } from 'lucide-react';

interface ConfigModalProps {
  open: boolean;
  onClose: () => void;
}

const ConfigModal = ({ open, onClose }: ConfigModalProps) => {
  const config = getAiConfig();
  const [ollamaUrl, setOllamaUrl] = useState(config.ollamaUrl);
  const [ollamaModel, setOllamaModel] = useState(config.ollamaModel);
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  if (!open) return null;

  const testConnection = async () => {
    setTesting(true);
    setStatus('idle');
    try {
      const resp = await fetch(`${ollamaUrl}/api/tags`, { signal: AbortSignal.timeout(5000) });
      if (resp.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
    setTesting(false);
  };

  const handleSave = () => {
    saveAiConfig({ ollamaUrl, ollamaModel });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="holo-card rounded-2xl p-8 w-full max-w-md mx-4 animate-float" style={{ animationDuration: '3s' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-primary tracking-wider">UNIVERSE CONFIG</h2>
            <p className="text-xs text-muted-foreground">Configure AI connection</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1 font-display tracking-wider">OLLAMA BASE URL</label>
            <input
              value={ollamaUrl}
              onChange={e => setOllamaUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground focus:border-primary focus:outline-none transition-colors text-sm"
              placeholder="http://localhost:11434"
            />
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-1 font-display tracking-wider">MODEL NAME</label>
            <input
              value={ollamaModel}
              onChange={e => setOllamaModel(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground focus:border-primary focus:outline-none transition-colors text-sm"
              placeholder="llama3"
            />
            <p className="text-xs text-muted-foreground/60 mt-1">e.g. llama3, mistral, gemma2</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={testConnection}
              disabled={testing}
              className="holo-btn flex-1 py-2 rounded-lg text-xs flex items-center justify-center gap-2"
            >
              <Zap className="w-3 h-3 relative z-10" />
              <span className="relative z-10">{testing ? 'TESTING...' : 'TEST CONNECTION'}</span>
            </button>
          </div>

          {status === 'success' && (
            <div className="text-xs text-green-400 font-display tracking-wider text-center">✓ CONNECTION ESTABLISHED</div>
          )}
          {status === 'error' && (
            <div className="text-xs text-destructive font-display tracking-wider text-center">✗ CONNECTION FAILED — Check Ollama is running</div>
          )}

          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="flex-1 py-3 rounded-lg text-sm font-display tracking-wider border border-border text-muted-foreground hover:text-foreground transition-colors">
              CANCEL
            </button>
            <button onClick={handleSave} className="holo-btn flex-1 py-3 rounded-lg text-sm font-display tracking-wider">
              <span className="relative z-10">ACTIVATE</span>
            </button>
          </div>

          <p className="text-xs text-muted-foreground/50 text-center">
            If Ollama is unavailable, the system will use Cloud AI as fallback.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfigModal;
