import { useState, useRef } from 'react';
import { transcribeAudio } from '@/integrations/elevenlabs/stt';

export function useSTT() {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus'
    });
    recorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      chunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
      setIsTranscribing(true);
      try {
        const result = await transcribeAudio(blob);
        setTranscript(result.text);
      } catch (err) {
        console.error('Error during transcription:', err);
        setTranscript(null);
      } finally {
        setIsTranscribing(false);
      }
    };

    recorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return { startRecording, stopRecording, isRecording, isTranscribing, transcript };
}
