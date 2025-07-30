import { Calendar, Clock, MapPin, Mic, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RunCardProps {
  id: string;
  title: string;
  date: string;
  distance: string;
  duration: string;
  pace: string;
  isDebriefed: boolean;
  review?: string;
  aiRating?: number;
  isPending?: boolean;
  onRecordDebrief?: (id: string) => void;
  onTypeDebrief?: (id: string) => void;
}

export const RunCard = ({ 
  id, 
  title, 
  date, 
  distance, 
  duration, 
  pace, 
  isDebriefed, 
  review,
  aiRating,
  isPending = false,
  onRecordDebrief,
  onTypeDebrief 
}: RunCardProps) => {
  const getRatingEmoji = (rating: number) => {
    if (rating >= 9) return "🏆";
    if (rating >= 8) return "😃";
    if (rating >= 7) return "😊";
    if (rating >= 6) return "🙂";
    return "😐";
  };

  if (isPending) {
    return (
      <Card className="p-4 mb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-foreground font-sf">{title}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar size={14} />
              {date}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => onRecordDebrief?.(id)}
            size="sm" 
            className="flex-1 bg-primary text-primary-foreground"
          >
            <Mic size={16} className="mr-2" />
            Record Debrief
          </Button>
          <Button 
            onClick={() => onTypeDebrief?.(id)}
            variant="outline" 
            size="sm" 
            className="flex-1 text-primary border-primary/30 bg-blue-light"
          >
            <Edit3 size={16} className="mr-2" />
            Type Instead
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 mb-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-success rounded-full" />
          <span className="font-semibold text-foreground font-sf">{title}</span>
        </div>
        {isDebriefed && (aiRating !== null && aiRating !== undefined) && (
          <Badge variant="secondary" className="bg-blue-glass text-primary">
            {aiRating}/10 {getRatingEmoji(aiRating)}
          </Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
        <Calendar size={14} />
        {date}
      </p>
      <p className="text-sm text-muted-foreground">
        {distance} · {duration} · {pace}
      </p>
      
      {/* Afficher le texte de la review traité par l'IA */}
      {isDebriefed && review && (
        <div className="mt-3 p-3 bg-muted/50 rounded-lg">
          <h4 className="font-medium text-sm text-foreground mb-2">Notes de session :</h4>
          <div className="text-sm text-muted-foreground whitespace-pre-line">
            {review}
          </div>
        </div>
      )}
      
      {!isDebriefed && (
        <p className="text-xs text-muted-foreground mt-2">Debrief pending</p>
      )}
    </Card>
  );
};