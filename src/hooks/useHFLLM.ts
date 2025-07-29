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

    const models = [
      'google/flan-t5-large',
      'microsoft/DialoGPT-medium',
      'facebook/blenderbot-400M-distill'
    ];

    for (const model of models) {
      try {
        const API_KEY =
          typeof process !== 'undefined'
            ? process.env.REACT_APP_HF_TOKEN ?? import.meta.env.VITE_HF_TOKEN
            : import.meta.env.VITE_HF_TOKEN;

        
        if (!API_KEY) {
          throw new Error('Hugging Face API key missing');
        }

        console.log(`Trying model: ${model}`); // Debug log

        const response = await fetch(
          `https://api-inference.huggingface.co/models/${model}`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inputs: `Convert this running session transcript into structured bullet points: ${transcript}`,
              parameters: {
                max_new_tokens: 150,
                temperature: 0.3
              }
            })
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Model ${model} failed:`, response.status, errorText);
          
          // Try next model if this one fails
          if (response.status === 404 || response.status === 503) {
            continue;
          }
          
          throw new Error(`LLM processing failed with status ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log(`Model ${model} response:`, data); // Debug log

        // Handle inference API response format
        let processedText: string;
        if (Array.isArray(data) && data[0]?.generated_text) {
          processedText = data[0].generated_text;
        } else if (data.generated_text) {
          processedText = data.generated_text;
        } else if (typeof data === 'string') {
          processedText = data;
        } else if (Array.isArray(data) && typeof data[0] === 'string') {
          processedText = data[0];
        } else {
          console.error('Unexpected response format:', data);
          continue; // Try next model
        }

        // Success! Return the processed text
        setIsProcessing(false);
        return {
          processedText: processedText.trim(),
          success: true,
        };

      } catch (err) {
        console.error(`Error with model ${model}:`, err);
        // Continue to next model
        continue;
      }
    }

    // If all models failed
    const errorMessage = 'All LLM models failed to process the text';
    setError(errorMessage);
    console.error(errorMessage);
    
    setIsProcessing(false);
    
    return {
      processedText: '',
      success: false,
      error: errorMessage,
    };
  };

  return {
    processText,
    isProcessing,
    error,
  };
}
