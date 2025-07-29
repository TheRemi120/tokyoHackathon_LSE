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
      const API_KEY = import.meta.env.VITE_HF_TOKEN;
      
      if (!API_KEY) {
        throw new Error('Hugging Face API key missing');
      }

      // Use the new Hugging Face Inference Providers API with chat completions format
      const response = await fetch(
        'https://router.huggingface.co/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'meta-llama/Llama-3.1-8B-Instruct',
            messages: [
              {
                role: 'system',
                content: 'You are a helpful assistant that structures text into clear, concise bullet points. Focus on the main ideas and make them easy to read.'
              },
              {
                role: 'user',
                content: `Please structure this text and make the ideas concise in bullet points:

${transcript}`
              }
            ],
            max_tokens: 500,
            temperature: 0.7,
            top_p: 0.9,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HF LLM API Error:', errorText);
        throw new Error(`LLM processing failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      // Handle chat completions response format
      let processedText: string;
      if (data.choices && data.choices.length > 0) {
        processedText = data.choices[0].message?.content || '';
      } else if (data.message?.content) {
        processedText = data.message.content;
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
