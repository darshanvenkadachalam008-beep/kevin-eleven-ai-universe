import { useState, useEffect } from 'react';
import ConfigModal from './ConfigModal';
import { isConfigured } from '@/lib/aiConfig';

const ConfigGuard = () => {
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    if (!isConfigured()) {
      // Show config after a brief delay so the page loads first
      const timer = setTimeout(() => setShowConfig(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  return <ConfigModal open={showConfig} onClose={() => setShowConfig(false)} />;
};

export default ConfigGuard;
