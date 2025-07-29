import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSTT } from '@/hooks/useSTT';
import { useHFLLM } from '@/hooks/useHFLLM';

interface SessionRecorderProps {
  onAddLog: (entry: string) => void;
}

export const SessionRecorder = ({ onAddLog }: SessionRecorderProps) => {
  const { startRecording, stopRecording, isRecording, isTranscribing, transcript } = useSTT();
  const { processText, isProcessing: llmLoading, error: llmError } = useHFLLM();

  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    setError(null);
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  useEffect(() => {
    const run = async () => {
      if (!transcript) return;
      try {
        const result = await processText(transcript);
        if (result.success) {
          onAddLog(result.processedText);
        } else {
          setError(result.error || 'LLM processing failed');
        }
      } catch (e) {
        setError((e as Error).message);
      }
    };
    run();
  }, [transcript]);

  const loading = isRecording || isTranscribing || llmLoading;

  return (
    <Card className="p-4 space-y-2">
      <Button onClick={handleClick} disabled={llmLoading || isTranscribing} className="w-full">
        {loading ? 'Processing...' : isRecording ? 'Stop Recording' : 'Record your session'}
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {llmError && <p className="text-sm text-red-600">{llmError}</p>}
    </Card>
  );
};
