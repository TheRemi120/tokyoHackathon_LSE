import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSTT } from '@/hooks/useSTT';
import { useHFLLM } from '@/hooks/useHFLLM';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SessionRecorderProps {
  onAddLog: (entry: string) => void;
}

export const SessionRecorder = ({ onAddLog }: SessionRecorderProps) => {
  const { startRecording, stopRecording, isRecording, isTranscribing, transcript } = useSTT();
  const { processText, isProcessing: llmLoading, error: llmError } = useHFLLM();
  const { toast } = useToast();

  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleClick = () => {
    setError(null);
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  useEffect(() => {
    const run = async () => {
      if (!transcript) return;
      
      try {
        // Afficher le status "IA structure vos notes"
        toast({
          title: "IA structure vos notes",
          description: "Traitement en cours...",
        });

        const result = await processText(transcript);
        if (result.success) {
          // Afficher le status "Sauvegarde de l'activité"
          toast({
            title: "Sauvegarde de l'activité",
            description: "Enregistrement en cours...",
          });

          setIsSaving(true);
          
          // Sauvegarder dans la base de données
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            throw new Error("Utilisateur non connecté");
          }

          const { error: dbError } = await supabase
            .from('activities')
            .insert({
              user_id: user.id,
              time: 1800, // 30 minutes par défaut pour une session d'enregistrement
              distance: 5.0, // 5km par défaut
              reviewed: true,
              review: result.processedText, // Le texte structuré avec bullet points
            });

          if (dbError) {
            throw dbError;
          }

          // Afficher dans l'interface locale aussi
          onAddLog(result.processedText);
          
          toast({
            title: "✅ Activité sauvegardée",
            description: "Votre session a été enregistrée avec succès.",
          });
        } else {
          // Afficher l'erreur de traitement IA mais sauvegarder le texte original
          toast({
            title: "⚠️ Traitement IA échoué - texte original utilisé",
            description: "L'activité a été sauvegardée avec le texte original.",
          });

          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase
              .from('activities')
              .insert({
                user_id: user.id,
                time: 1800,
                distance: 5.0,
                reviewed: true,
                review: transcript, // Texte original si l'IA échoue
              });
          }

          onAddLog(transcript);
          setError(result.error || 'LLM processing failed');
        }
      } catch (e) {
        const errorMessage = (e as Error).message;
        toast({
          variant: "destructive",
          title: "⚠️ Erreur de sauvegarde",
          description: errorMessage,
        });
        setError(errorMessage);
      } finally {
        setIsSaving(false);
      }
    };
    run();
  }, [transcript]);

  const loading = isRecording || isTranscribing || llmLoading || isSaving;

  return (
    <Card className="p-4 space-y-2">
      <Button onClick={handleClick} disabled={llmLoading || isTranscribing} className="w-full">
        {loading ? 'Processing...' : isRecording ? 'Stop Recording' : 'Record your session'}
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {llmError && <p className="text-sm text-red-600">{llmError}</p>}
    </Card>
  );
};
