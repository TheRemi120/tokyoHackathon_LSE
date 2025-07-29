export const ELEVENLABS_STT_ENDPOINT = 'https://api.elevenlabs.io/v1/speech-to-text';

const API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;

export interface STTResponse {
  text: string;
}

export async function transcribeAudio(audio: Blob): Promise<STTResponse> {
  if (!API_KEY) {
    throw new Error('ElevenLabs API key missing');
  }

  const formData = new FormData();
  formData.append('audio', audio, 'recording.webm');

  const response = await fetch(ELEVENLABS_STT_ENDPOINT, {
    method: 'POST',
    headers: {
      'xi-api-key': API_KEY
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error(`STT failed with status ${response.status}`);
  }

  const data = await response.json();
  return data as STTResponse;
}
