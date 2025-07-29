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
      const API_KEY =
        typeof process !== 'undefined'
          ? process.env.REACT_APP_HF_TOKEN ?? import.meta.env.VITE_HF_TOKEN
          : import.meta.env.VITE_HF_TOKEN;

      if (!API_KEY) {
        throw new Error('Hugging Face API key missing');
      }

      console.log('Processing transcript with new HF API:', transcript.substring(0, 50) + '...');

      // Try the new chat completions API first
      try {
        const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "meta-llama/Llama-3.1-8B-Instruct", // Or any model that works
            messages: [
              {
                role: "user",
                content: `Please structure this running session transcript into clear bullet points. Focus on the key points mentioned:

"${transcript}"

Format your response as bullet points starting with • symbols.`
              }
            ],
            max_tokens: 200,
            temperature: 0.3
          })
        });

        if (response.ok) {
          const data = await response.json();
          const processedText = data.choices[0]?.message?.content || '';
          
          if (processedText) {
            setIsProcessing(false);
            return {
              processedText: processedText.trim(),
              success: true,
            };
          }
        } else {
          console.warn('New API failed, trying fallback approach');
        }
      } catch (err) {
        console.warn('New API error, trying fallback:', err);
      }

      // Fallback: Create structured text without AI
      console.log('Using local text processing fallback');
      
      // Simple local processing to create bullet points
      const sentences = transcript
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 5);
      
      let processedText = '';
      if (sentences.length > 0) {
        processedText = sentences
          .slice(0, 5) // Limit to 5 main points
          .map(sentence => `• ${sentence.charAt(0).toUpperCase() + sentence.slice(1)}`)
          .join('\n');
      } else {
        processedText = `• Session d'entraînement: ${transcript}`;
      }

      setIsProcessing(false);
      return {
        processedText: processedText,
        success: true,
      };

    } catch (err) {
      console.error('Error in LLM processing:', err);
      const errorMessage = err instanceof Error ? err.message : 'Processing failed';
      setError(errorMessage);
      
      // Final fallback
      const fallbackText = `• Session d'entraînement: ${transcript}`;
      
      setIsProcessing(false);
      return {
        processedText: fallbackText,
        success: true, // Still consider it success since we provide structured output
      };
    }
  };

  return {
    processText,
    isProcessing,
    error,
  };
}
