import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Plus, Brain } from "lucide-react";
import { useSTT } from "@/hooks/useSTT";
import { useHFLLM } from "@/hooks/useHFLLM";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Activity } from "@/types/Activity";

interface ReviewActivityButtonProps {
  userId: string;
  onActivityAdded: (activity: Activity) => void;
}

export const ReviewActivityButton = ({ userId, onActivityAdded }: ReviewActivityButtonProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [processingStep, setProcessingStep] = useState<'recording' | 'transcribing' | 'processing' | 'saving' | 'complete'>('complete');
  const { startRecording, stopRecording, isRecording, transcript } = useSTT();
  const { processText, isProcessing: isLLMProcessing, error: llmError } = useHFLLM();
  const { toast } = useToast();

  const handleRecordingToggle = async () => {
    if (isRecording) {
      stopRecording();
      setProcessingStep('transcribing');
      setIsProcessing(true);
      setHasRecorded(true);
    } else {
      startRecording();
      setProcessingStep('recording');
      setHasRecorded(false);
    }
  };

  const saveActivityFromTranscript = async (transcriptText: string, processedReview?: string) => {
    try {
      setProcessingStep('saving');
      
      // Parse the transcript to extract activity data
      // For now, we'll create a default activity with the processed review
      // In a real implementation, you might want to use AI to parse the transcript
      // and extract duration, distance, etc.
      
      const defaultDuration = 1800; // 30 minutes in seconds
      const defaultDistance = 5.0; // 5 km
      
      const { data, error } = await supabase
        .from('activities')
        .insert({
          user_id: userId,
          time: defaultDuration,
          distance: defaultDistance,
          reviewed: true,
          review: processedReview || transcriptText, // Use processed review if available
        })
        .select()
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de sauvegarder l'activité.",
        });
        return;
      }

      onActivityAdded(data);
      
      toast({
        title: "Activité ajoutée",
        description: processedReview 
          ? "Votre session a été enregistrée et structurée par l'IA avec succès."
          : "Votre session a été enregistrée avec succès.",
      });
      
      setProcessingStep('complete');
    } catch (error) {
      console.error('Error saving activity:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Enhanced workflow: STT -> LLM -> Save Activity
  useEffect(() => {
    const processTranscriptWithLLM = async () => {
      if (transcript && hasRecorded && processingStep === 'transcribing') {
        try {
          setProcessingStep('processing');
          
          // Process the transcript with LLM to structure it into bullet points
          const llmResult = await processText(transcript);
          
          if (llmResult.success && llmResult.processedText) {
            // Save activity with both original transcript and processed review
            await saveActivityFromTranscript(transcript, llmResult.processedText);
          } else {
            // Fallback to original transcript if LLM fails
            console.warn('LLM processing failed, using original transcript:', llmResult.error);
            toast({
              variant: "destructive",
              title: "Traitement IA échoué",
              description: "Utilisation du texte original.",
            });
            await saveActivityFromTranscript(transcript);
          }
        } catch (error) {
          console.error('Error in LLM processing workflow:', error);
          // Fallback to original transcript
          await saveActivityFromTranscript(transcript);
        } finally {
          setHasRecorded(false);
        }
      }
    };

    processTranscriptWithLLM();
  }, [transcript, hasRecorded, processingStep]);

  return (
    <Card className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Plus size={20} className="text-primary" />
          <h3 className="font-semibold text-foreground">Review Activity</h3>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          Enregistrez vocalement votre session puis laissez l'IA structurer vos notes
        </p>
        
        <Button
          onClick={handleRecordingToggle}
          disabled={isProcessing}
          className={`w-full transition-all duration-300 ${
            isRecording 
              ? "bg-red-500 hover:bg-red-600 animate-pulse" 
              : "bg-primary hover:bg-primary/90"
          }`}
          size="lg"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {processingStep === 'transcribing' && "Transcription..."}
              {processingStep === 'processing' && "Traitement IA..."}
              {processingStep === 'saving' && "Sauvegarde..."}
            </>
          ) : isRecording ? (
            <>
              <MicOff size={20} className="mr-2" />
              Arrêter l'enregistrement
            </>
          ) : (
            <>
              <Mic size={20} className="mr-2" />
              Commencer l'enregistrement
            </>
          )}
        </Button>
        
        {isRecording && (
          <p className="text-xs text-red-500 animate-pulse">
            🔴 Enregistrement en cours...
          </p>
        )}
        
        {processingStep === 'transcribing' && (
          <p className="text-xs text-blue-500 animate-pulse">
            🎙️ Transcription audio...
          </p>
        )}
        
        {processingStep === 'processing' && (
          <p className="text-xs text-purple-500 animate-pulse">
            <Brain size={12} className="inline mr-1" />
            IA structure vos notes...
          </p>
        )}
        
        {processingStep === 'saving' && (
          <p className="text-xs text-green-500 animate-pulse">
            💾 Sauvegarde de l'activité...
          </p>
        )}
        
        {llmError && (
          <p className="text-xs text-orange-500">
            ⚠️ Traitement IA échoué - texte original utilisé
          </p>
        )}
        
        {transcript && (
          <div className="mt-3 p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Transcription :</p>
            <p className="text-sm text-foreground">{transcript}</p>
          </div>
        )}
      </div>
    </Card>
  );
};
