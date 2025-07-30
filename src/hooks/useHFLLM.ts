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
      console.log('Distance:', distance, 'Duration:', duration);

      // Try the new chat completions API first with the new system prompt
      if (distance && duration) {
        try {
          const inputData = {
            distance_km: distance,
            duration_min: duration,
            review_text: transcript
          };

          console.log('Sending to LLM:', inputData);

          const systemPrompt = `You are an expert fitness coach and performance analyst. You will receive an input JSON object with these fields:
- distance_km: number (distance covered in kilometers)
- duration_min: number (total workout time in minutes)
- review_text: string (the user's spoken feedback about their training session)

Your tasks:
1. Extract and structure the key insights from review_text into clear, concise bullet points
2. Calculate a comprehensive performance score from 1-10 using this weighted scoring system:

SCORING FRAMEWORK (Total = 10 points):

A) SUBJECTIVE WELL-BEING (4 points - 40%):
   - Energy levels during workout (felt strong/weak, energetic/tired)
   - Motivation and mental state (excited, focused, struggling mentally)
   - Post-workout satisfaction (proud, accomplished, disappointed)
   - Overall enjoyment of the session

B) PHYSICAL PERFORMANCE (3 points - 30%):
   - Pace efficiency: Calculate minutes per km (duration_min ÷ distance_km)
     * <5 min/km = excellent (2.5-3 pts)
     * 5-6 min/km = good (2-2.5 pts)  
     * 6-7 min/km = moderate (1.5-2 pts)
     * >7 min/km = needs improvement (1-1.5 pts)
   - Endurance and consistency throughout the session
   - Technique and form mentions

C) GOAL ACHIEVEMENT (2 points - 20%):
   - Whether they met their intended distance/time targets
   - Progress compared to previous sessions (if mentioned)
   - Challenge level appropriateness (too easy/hard/just right)

D) RECOVERY INDICATORS (1 point - 10%):
   - Fatigue levels during and after
   - Any pain, discomfort, or exceptional recovery
   - Sleep quality or preparation mentions

SCORING EXAMPLES:
- 9-10: "Felt amazing, crushed my pace goals, could have gone longer"
- 7-8: "Good solid run, felt strong most of the way, happy with performance"  
- 5-6: "Okay session, struggled a bit but completed the distance"
- 3-4: "Tough day, felt tired, pace was slower than usual"
- 1-2: "Really struggled, had to stop multiple times, felt awful"

3. Return a JSON object with exactly these properties:
   {
     "bullet_points": [ ... ],
     "score": integer
   }

Requirements:
- bullet_points: 3-5 concise points capturing physical and emotional experience
- Each bullet point starts with a hyphen (-)
- score: integer from 1-10 reflecting holistic training quality
- Prioritize user's subjective experience over raw performance metrics
- A slower pace can still score high if the user felt great and achieved personal goals`;

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
            console.log('LLM API Response:', data);
            const rawContent = data.choices[0]?.message?.content || '';
            console.log('Raw LLM content:', rawContent);
            
            try {
              // Try to parse the JSON response
              const parsedResult = JSON.parse(rawContent);
              console.log('Parsed LLM result:', parsedResult);
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
              console.warn('Failed to parse LLM JSON response, using fallback. Parse error:', parseError);
              console.warn('Raw content that failed to parse:', rawContent);
            }
          } else {
            console.warn('New API failed, trying fallback approach. Status:', response.status, 'StatusText:', response.statusText);
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
        let paceScore = 5; // Base score for pace
        
        // Pace-based scoring (30% weight in final score)
        if (pace <= 4) paceScore = 9;
        else if (pace <= 5) paceScore = 8;
        else if (pace <= 6) paceScore = 7;
        else if (pace <= 7) paceScore = 6;
        else if (pace <= 8) paceScore = 5;
        else paceScore = 4;
        
        // Sentiment analysis of transcript (70% weight in final score)
        const lowerTranscript = transcript.toLowerCase();
        let sentimentScore = 5; // Base sentiment score
        
        // Positive indicators
        const positiveWords = ['great', 'good', 'amazing', 'strong', 'easy', 'comfortable', 'energetic', 'motivated', 'excellent', 'fantastic', 'smooth', 'effortless', 'powerful', 'confident'];
        const negativeWords = ['tired', 'exhausted', 'difficult', 'struggled', 'hard', 'painful', 'slow', 'terrible', 'awful', 'weak', 'heavy', 'sluggish', 'unmotivated'];
        
        const positiveMatches = positiveWords.filter(word => lowerTranscript.includes(word)).length;
        const negativeMatches = negativeWords.filter(word => lowerTranscript.includes(word)).length;
        
        // Adjust sentiment score based on word analysis
        sentimentScore += (positiveMatches * 0.8) - (negativeMatches * 0.8);
        sentimentScore = Math.max(1, Math.min(10, sentimentScore)); // Clamp to 1-10
        
        // Combine pace (30%) and sentiment (70%) for final score
        score = Math.round((paceScore * 0.3) + (sentimentScore * 0.7));
        score = Math.max(1, Math.min(10, score)); // Ensure score is between 1-10
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
