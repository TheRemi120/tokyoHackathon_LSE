import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface ActivitySummary {
  id: string;
  date: string;
  distance: number;
  score: number;
}

interface CoachingRecommendation {
  category: 'underperforming' | 'moderate' | 'high';
  averageScore: number;
  recommendedLaps: string;
  reasoning: string;
  message: string;
}

export function useAICoach() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  const fetchRecentActivities = async (): Promise<ActivitySummary[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('activities')
      .select('id, created_at, distance, score')
      .eq('user_id', user.id)
      .eq('reviewed', true)
      .not('score', 'is', null)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;

    return data.map(activity => ({
      id: activity.id,
      date: new Date(activity.created_at).toLocaleDateString(),
      distance: activity.distance || 0,
      score: activity.score || 0
    }));
  };

  const analyzePerformance = (activities: ActivitySummary[]): CoachingRecommendation => {
    if (activities.length === 0) {
      return {
        category: 'moderate',
        averageScore: 5,
        recommendedLaps: '3-4',
        reasoning: 'No recent activities found - starting with baseline assessment.',
        message: 'Ready to start your running journey? Let\'s begin with a comfortable 3-4 lap session to establish your baseline. Focus on maintaining a steady pace and listening to your body.'
      };
    }

    // Ensure we only analyze the most recent 5 activities
    const recentActivities = activities.slice(0, 5);
    const averageScore = recentActivities.reduce((sum, activity) => sum + activity.score, 0) / recentActivities.length;
    
    let category: 'underperforming' | 'moderate' | 'high';
    let recommendedLaps: string;
    let reasoning: string;

    // Updated scoring thresholds as per requirements
    if (averageScore <= 4) {
      category = 'underperforming';
      recommendedLaps = '2-3';
      reasoning = `Recent average score of ${averageScore.toFixed(1)}/10 indicates you need recovery time and lighter training load.`;
    } else if (averageScore < 8) {
      category = 'moderate';
      recommendedLaps = '4-5';
      reasoning = `Your ${averageScore.toFixed(1)}/10 average shows steady performance. Maintain consistent effort to build endurance.`;
    } else {
      category = 'high';
      recommendedLaps = '6-7';
      reasoning = `Excellent ${averageScore.toFixed(1)}/10 average! You're ready for a more challenging session.`;
    }

    const scoresText = recentActivities.map(a => `${a.score}/10`).join(', ');
    let message = `Based on your recent scores (${scoresText}), `;
    
    switch (category) {
      case 'underperforming':
        message += `let's dial it back today: aim for ${recommendedLaps} relaxed laps focusing on steady pacing and recovery. You'll build strength without overtaxing yourself. I've sent this advice to your audio coach—let's get started!`;
        break;
      case 'moderate':
        message += `let's maintain steady progress: target ${recommendedLaps} laps with consistent effort. Focus on maintaining good form and breathing rhythm. Your audio coach has the details—time to hit the track!`;
        break;
      case 'high':
        message += `you're ready to push harder: challenge yourself with ${recommendedLaps} laps. Increase your pace gradually and see how strong you feel today! Your audio coach is ready with the motivation—let's go!`;
        break;
    }

    return {
      category,
      averageScore: Math.round(averageScore * 10) / 10,
      recommendedLaps,
      reasoning,
      message
    };
  };

  const refineWithLLM = async (recommendation: CoachingRecommendation): Promise<string> => {
    console.log('🤖 Starting LLM refinement for message:', recommendation.message);
    
    try {
      const API_KEY = import.meta.env.VITE_HF_TOKEN;
      
      if (!API_KEY) {
        console.warn('🔑 Hugging Face API key missing, using original message');
        return recommendation.message;
      }

      // Direct API call to Hugging Face for message refinement
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      
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
              content: "You are an experienced running coach. Improve coaching messages to make them more motivational and specific. Always respond in English only. Include specific training details like pace, form, and actionable advice."
            },
            {
              role: "user", 
              content: `Improve this running coaching message (max 2 sentences in English, be specific about training details):

Performance Analysis:
- Category: ${recommendation.category}
- Average Score: ${recommendation.averageScore}/10
- Recommended Laps: ${recommendation.recommendedLaps}

Original Message: "${recommendation.message}"

Make it more specific with actionable training advice (pace, technique, goals).`
            }
          ],
          max_tokens: 120,
          temperature: 0.6
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        let refined = data.choices[0]?.message?.content || '';
        
        if (refined) {
          // Clean up the response
          refined = refined.trim();
          
          // Remove any unwanted formatting
          refined = refined.replace(/^[•\-\*]\s*/gm, '');
          refined = refined.replace(/^\d+\.\s*/gm, '');
          refined = refined.replace(/^["'](.*)["']$/s, '$1');
          
          // Take only the first paragraph
          refined = refined.split('\n\n')[0];
          
          // Validate response quality - check for English prompt keywords
          const lowerRefined = refined.toLowerCase();
          
          // Check for prompt text (bad)
          const hasPromptKeywords = [
            'improve this', 'coaching message', 'max 2 sentences', 
            'training details', 'performance analysis'
          ].some(keyword => lowerRefined.includes(keyword));
          
          // Check for French text (bad)
          const hasFrenchText = [
            'écoutez', 'votre', 'cœur', 'dépassez', 'frontières', 
            'je vous vois', 'tours', 'énergie', 'incroyable'
          ].some(word => lowerRefined.includes(word));
          
          // Check for specific training details (good)
          const hasSpecificDetails = [
            'pace', 'form', 'breathing', 'cadence', 'effort', 'stride',
            'midfoot', 'core', 'shoulders', 'steps per minute', '%', 'tempo',
            'rhythm', 'technique', 'posture', 'landing'
          ].some(detail => lowerRefined.includes(detail));
          
          if (hasPromptKeywords || hasFrenchText || refined.length < 30 || !hasSpecificDetails) {
            console.warn('⚠️ LLM returned invalid response:', {
              hasPromptKeywords,
              hasFrenchText,
              tooShort: refined.length < 30,
              lackSpecifics: !hasSpecificDetails
            });
            return recommendation.message;
          }
          
          console.log('✅ Refined message:', refined);
          return refined;
        }
      } else {
        console.warn('❌ HF API failed:', response.status);
      }
    } catch (error) {
      console.warn('❌ LLM refinement failed:', error);
    }
    
    console.log('📄 Using original message:', recommendation.message);
    return recommendation.message;
  };

  const generateTTS = async (text: string): Promise<void> => {
    const API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
    
    if (!API_KEY) {
      console.warn('🔑 ElevenLabs API key not found, skipping TTS');
      return;
    }

    // Validate the text before sending to TTS
    if (!text || text.trim().length < 10) {
      console.warn('⚠️ Text too short for TTS, skipping');
      return;
    }

    // Check for prompt text that shouldn't be spoken
    const lowerText = text.toLowerCase();
    if (lowerText.includes('improve this') || 
        lowerText.includes('coaching message') ||
        lowerText.includes('max 2 sentences') ||
        lowerText.includes('training details') ||
        lowerText.includes('performance analysis')) {
      console.warn('⚠️ Detected prompt text in TTS, skipping to avoid reading instructions');
      return;
    }

    try {
      setIsPlaying(true);
      console.log('🔊 Starting TTS for:', text.substring(0, 50) + '...');
      
      // Add timeout for TTS to prevent hanging
      const controller = new AbortController();
      const timeout = setTimeout(() => {
        console.warn('⏱️ TTS timeout reached');
        controller.abort();
      }, 8000);
      
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': API_KEY,
        },
        body: JSON.stringify({
          text: text.trim(),
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.8,
            style: 0.3,
            use_speaker_boost: true
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`TTS API failed: ${response.status} ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      console.log('🎵 Playing TTS audio...');
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        console.log('✅ TTS playback completed');
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = (error) => {
        console.error('❌ Audio playback error:', error);
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();
      
    } catch (error) {
      console.warn('❌ TTS generation failed:', error);
      setIsPlaying(false);
      
      // Show a toast to inform user that audio failed but text is still available
      // Note: We don't use toast here to avoid showing errors for optional TTS
    }
  };

  const generateCoaching = async (): Promise<string> => {
    const startTime = Date.now();
    
    try {
      setIsGenerating(true);
      console.log('🏃‍♂️ Starting AI Coach generation...');

      // Step 1: Fetch recent activities (with timeout)
      console.log('📊 Fetching recent activities...');
      const activitiesPromise = Promise.race([
        fetchRecentActivities(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Database timeout')), 2000)
        )
      ]);
      
      const activities = await activitiesPromise;
      console.log(`📈 Found ${activities.length} recent activities`);
      
      // Step 2: Analyze performance (instant)
      console.log('🔍 Analyzing performance...');
      const recommendation = analyzePerformance(activities);
      console.log('💡 Analysis complete:', recommendation);
      
      // Step 3: Refine with LLM (with proper fallback)
      console.log('🤖 Refining message with LLM...');
      let finalMessage = recommendation.message;
      
      try {
        const refinedMessage = await refineWithLLM(recommendation);
        // Only use refined message if it's actually different and meaningful
        if (refinedMessage && refinedMessage !== recommendation.message && refinedMessage.length > 20) {
          finalMessage = refinedMessage;
          console.log('✨ Using refined message');
        } else {
          console.log('📝 Using original message (refinement not suitable)');
        }
      } catch (llmError) {
        console.warn('⚠️ LLM refinement failed, using original message:', llmError);
        finalMessage = recommendation.message;
      }
      
      // Step 4: Generate TTS in background (non-blocking)
      console.log('🔊 Starting TTS generation...');
      generateTTS(finalMessage).catch(error => 
        console.warn('TTS generation failed:', error)
      );
      
      const totalTime = Date.now() - startTime;
      console.log(`✅ AI Coach generation completed in ${totalTime}ms`);
      
      // Step 5: Show success toast
      toast({
        title: "AI Coach Ready",
        description: `Personalized advice generated in ${totalTime}ms. ${activities.length > 0 ? `Based on ${activities.length} recent activities.` : 'Ready to start fresh!'}`,
      });
      
      return finalMessage;
      
    } catch (error) {
      const totalTime = Date.now() - startTime;
      console.error(`❌ AI Coach generation failed after ${totalTime}ms:`, error);
      
      toast({
        variant: "destructive",
        title: "Erreur AI Coach",
        description: "Impossible de générer les conseils. Veuillez réessayer.",
      });
      
      // Fallback message based on error type
      let fallbackMessage = "Prêt pour votre course d'aujourd'hui ? Commencez avec un rythme confortable et écoutez votre corps. Vous pouvez le faire !";
      
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          fallbackMessage = "Allons-y ! Commencez avec 3-4 tours confortables aujourd'hui et concentrez-vous sur le plaisir de courir.";
        } else if (error.message.includes('authenticated')) {
          fallbackMessage = "Bienvenue à votre session d'entraînement ! Commencez par un échauffement doux et visez 3-4 tours réguliers.";
        }
      }
      
      return fallbackMessage;
      
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateCoaching,
    isGenerating,
    isPlaying
  };
}
