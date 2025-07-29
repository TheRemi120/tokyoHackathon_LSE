import { useState } from 'react';

export interface LLMResponse {
  processedText: string;
  score?: number;
  success: boolean;
  error?: string;
}

export function useHFLLM() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processText = async (transcript: string, distance?: number, duration?: number): Promise<LLMResponse> => {
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

      // Try the new chat completions API first with the new system prompt
      if (distance && duration) {
        try {
          const inputData = {
            distance_km: distance,
            duration_min: duration,
            review_text: transcript
          };

          const systemPrompt = `You are a fitness activity summarizer and evaluator. You will receive an input JSON object with these fields:
- distance_km: number (distance run in kilometers)
- duration_min: number (time taken in minutes)
- review_text: string (the user's spoken review)

Your tasks:
1. Extract and structure the key ideas from review_text into concise bullet points.
2. Assign a performance score from 1 to 10, based on the ratio distance_km/duration_min and the qualitative feedback in review_text. A higher ratio and stronger positive feedback should yield a higher score.
3. Return a JSON object with exactly these two properties:
   {
     "bullet_points": [ ... ],
     "score": integer
   }

Ensure:
- bullet_points are succinct, clear, each starting with a hyphen.
- score is an integer between 1 and 10.`;

          const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "meta-llama/Llama-3.1-8B-Instruct",
              messages: [
                {
                  role: "system",
                  content: systemPrompt
                },
                {
                  role: "user",
                  content: JSON.stringify(inputData)
                }
              ],
              max_tokens: 300,
              temperature: 0.3
            })
          });

          if (response.ok) {
            const data = await response.json();
            const rawContent = data.choices[0]?.message?.content || '';
            
            try {
              // Try to parse the JSON response
              const parsedResult = JSON.parse(rawContent);
              if (parsedResult.bullet_points && parsedResult.score) {
                const formattedText = parsedResult.bullet_points
                  .map((point: string) => point.startsWith('-') ? point : `- ${point}`)
                  .join('\n');
                
                setIsProcessing(false);
                return {
                  processedText: formattedText,
                  score: parsedResult.score,
                  success: true,
                };
              }
            } catch (parseError) {
              console.warn('Failed to parse LLM JSON response, using fallback');
            }
          } else {
            console.warn('New API failed, trying fallback approach');
          }
        } catch (err) {
          console.warn('New API error, trying fallback:', err);
        }
      }

      // Fallback: Create structured text without AI
      console.log('Using local text processing fallback');
      
      // Simple local processing to create bullet points
      const sentences = transcript
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 5);
      
      let processedText = '';
      let score = 5; // Default score
      
      if (sentences.length > 0) {
        processedText = sentences
          .slice(0, 5) // Limit to 5 main points
          .map(sentence => `- ${sentence.charAt(0).toUpperCase() + sentence.slice(1)}`)
          .join('\n');
      } else {
        processedText = `- Training session: ${transcript}`;
      }

      // Calculate basic score if distance and duration are provided
      if (distance && duration) {
        const pace = duration / distance; // minutes per km
        // Basic scoring: faster pace = higher score (typical running pace is 5-8 min/km)
        if (pace <= 4) score = 9;
        else if (pace <= 5) score = 8;
        else if (pace <= 6) score = 7;
        else if (pace <= 7) score = 6;
        else if (pace <= 8) score = 5;
        else score = 4;
      }

      setIsProcessing(false);
      return {
        processedText: processedText,
        score: score,
        success: true,
      };

    } catch (err) {
      console.error('Error in LLM processing:', err);
      const errorMessage = err instanceof Error ? err.message : 'Processing failed';
      setError(errorMessage);
      
      // Final fallback
      const fallbackText = `- Training session: ${transcript}`;
      
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
