import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Mic, Send, Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Activity } from "@/types/Activity";
import { useSTT } from "@/hooks/useSTT";
import { useHFLLM } from "@/hooks/useHFLLM";

interface ReviewDivProps {
  activity: Activity;
  onReviewSubmitted: (updatedActivity: Activity) => void;
}

export const ReviewDiv = ({ activity, onReviewSubmitted }: ReviewDivProps) => {
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  const { startRecording, stopRecording, isRecording, transcript } = useSTT();
  const { processText } = useHFLLM();
  const { toast } = useToast();

  const handleSubmitReview = async () => {
    if (!review.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez écrire un commentaire avant de valider.",
      });
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('activities')
        .update({
          reviewed: true,
          review: review.trim(),
        })
        .eq('id', activity.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de sauvegarder votre commentaire.",
        });
        return;
      }

      const updatedActivity = {
        ...activity,
        reviewed: true,
        review: review.trim(),
      };

      onReviewSubmitted(updatedActivity);
      
      toast({
        title: "Commentaire ajouté",
        description: "Votre commentaire a été sauvegardé avec succès.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Enhanced AI processing function for manual reviews
  const handleAIStructure = async () => {
    if (!review.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez écrire du texte avant de demander la structuration IA.",
      });
      return;
    }

    try {
      setAiProcessing(true);
      const result = await processText(review);
      
      if (result.success && result.processedText) {
        setReview(result.processedText);
        toast({
          title: "Texte structuré",
          description: "Votre commentaire a été structuré en points clés par l'IA.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erreur IA",
          description: "Impossible de structurer le texte. Veuillez réessayer.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur s'est produite lors du traitement IA.",
      });
    } finally {
      setAiProcessing(false);
    }
  };

  useEffect(() => {
    if (transcript) {
      setReview(prev => prev + (prev ? ' ' : '') + transcript);
    }
  }, [transcript]);

  const startVoiceRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Card className="p-4 border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare size={20} className="text-orange-600" />
        <h3 className="font-medium text-orange-800 dark:text-orange-200">
          Ajoutez un commentaire sur cette activité
        </h3>
      </div>
      
      <div className="space-y-3">
        <Textarea
          placeholder="Comment s'est passée cette séance ? Ressentis, difficultés, points positifs..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
          rows={3}
          className="resize-none"
        />
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={startVoiceRecording}
            disabled={loading || aiProcessing}
            className="flex items-center gap-2"
          >
            <Mic size={16} />
            {isRecording ? "Stop" : "Vocal"}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleAIStructure}
            disabled={loading || aiProcessing || !review.trim()}
            className="flex items-center gap-2"
          >
            <Brain size={16} />
            {aiProcessing ? "IA..." : "Structurer"}
          </Button>
          
          <Button
            onClick={handleSubmitReview}
            disabled={loading || aiProcessing || !review.trim()}
            className="flex items-center gap-2 ml-auto"
            size="sm"
          >
            <Send size={16} />
            {loading ? "Envoi..." : "Valider"}
          </Button>
        </div>
      </div>
    </Card>
  );
};
