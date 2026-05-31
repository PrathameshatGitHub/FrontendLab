import { useState, useCallback } from 'react';
import { generateExplanation } from '@/services/ai.service';

export function useAiExplainer() {
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const explain = useCallback(async (moduleName: string, extraContext?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await generateExplanation(moduleName, extraContext);
      setExplanation(response);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate explanation');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    explanation,
    error,
    explain,
    setExplanation
  };
}
