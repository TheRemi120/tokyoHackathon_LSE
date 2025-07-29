import { useState } from 'react';

export interface LLMResponse {
  processedText: string;
  success: boolean;
  error?: string;
}

export function useHFLLM() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processText = async (transcript: string): Promise<LLMResponse> => {
    setIsProcessing(true);
    setError(null);

    try {
      const API_KEY = process.env.REACT_APP_HF_TOKEN ?? import.meta.env.VITE_HF_TOKEN;
      
      if (!API_KEY) {
        throw new Error('Hugging Face API key missing');
      }

      const response = await fetch(
        'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: `Structure this text and make the ideas concise in bullet points.\n${transcript}`
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HF LLM API Error:', errorText);
        throw new Error(`LLM processing failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      // Handle inference API response format
      let processedText: string;
      if (Array.isArray(data) && data[0]?.generated_text) {
        processedText = data[0].generated_text;
      } else if (data.generated_text) {
        processedText = data.generated_text;
      } else if (typeof data === 'string') {
        processedText = data;
      } else {
        throw new Error('Unexpected response format from LLM');
      }

      return {
        processedText: processedText.trim(),
        success: true,
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error processing text with LLM:', err);
      
      return {
        processedText: '',
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processText,
    isProcessing,
    error,
  };
}
