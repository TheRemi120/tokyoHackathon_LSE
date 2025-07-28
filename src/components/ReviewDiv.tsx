import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Mic, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Activity } from "@/types/Activity";

interface ReviewDivProps {
  activity: Activity;
  onReviewSubmitted: (updatedActivity: Activity) => void;
}

export const ReviewDiv = ({ activity, onReviewSubmitted }: ReviewDivProps) => {
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
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

  const startVoiceRecording = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'fr-FR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setReview(prev => prev + (prev ? ' ' : '') + transcript);
      };

      recognition.onerror = () => {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible d'utiliser la reconnaissance vocale.",
        });
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      toast({
        variant: "destructive",
        title: "Non supporté",
        description: "La reconnaissance vocale n'est pas supportée sur ce navigateur.",
      });
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
            disabled={loading || isListening}
            className="flex items-center gap-2"
          >
            <Mic size={16} />
            {isListening ? "Écoute..." : "Vocal"}
          </Button>
          
          <Button
            onClick={handleSubmitReview}
            disabled={loading || !review.trim()}
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

// Type declaration for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}