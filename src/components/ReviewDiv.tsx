import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  const { startRecording, stopRecording, isRecording, transcript } = useSTT();
  const { processText } = useHFLLM();
  const { toast } = useToast();

  const handleSubmitReview = async () => {
    if (!review.trim() || !distance.trim() || !duration.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields (distance, duration and review).",
      });
      return;
    }

    const distanceNum = parseFloat(distance);
    const durationNum = parseFloat(duration);

    if (isNaN(distanceNum) || isNaN(durationNum) || distanceNum <= 0 || durationNum <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter valid numerical values for distance and duration.",
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
          title: "Error",
          description: "Unable to save your review.",
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
        title: "Review Added",
        description: "Your review has been saved successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Enhanced AI processing function for manual reviews
  const handleAIStructure = async () => {
    if (!review.trim() || !distance.trim() || !duration.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields (distance, duration and review) before AI structuring.",
      });
      return;
    }

    const distanceNum = parseFloat(distance);
    const durationNum = parseFloat(duration);

    if (isNaN(distanceNum) || isNaN(durationNum) || distanceNum <= 0 || durationNum <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter valid numerical values for distance and duration.",
      });
      return;
    }

    try {
      setAiProcessing(true);
      const result = await processText(review, distanceNum, durationNum);
      
      if (result.success && result.processedText) {
        setReview(result.processedText);
        const scoreMessage = result.score ? ` Performance score: ${result.score}/10` : '';
        toast({
          title: "Text Structured",
          description: `Your review has been structured into key points by AI.${scoreMessage}`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "AI Error",
          description: "Unable to structure the text. Please try again.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred during AI processing.",
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
    if (!distance.trim() || !duration.trim()) {
      toast({
        variant: "destructive",
        title: "Required Fields",
        description: "Please enter distance and duration before starting voice recording.",
      });
      return;
    }

    const distanceNum = parseFloat(distance);
    const durationNum = parseFloat(duration);

    if (isNaN(distanceNum) || isNaN(durationNum) || distanceNum <= 0 || durationNum <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter valid numerical values for distance and duration.",
      });
      return;
    }

    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const calculateAveragePace = () => {
    const distanceNum = parseFloat(distance);
    const durationNum = parseFloat(duration);
    
    if (distanceNum > 0 && durationNum > 0) {
      const paceMinPerKm = durationNum / distanceNum;
      const paceMin = Math.floor(paceMinPerKm);
      const paceSec = Math.round((paceMinPerKm - paceMin) * 60);
      return `${paceMin}:${paceSec.toString().padStart(2, '0')} min/km`;
    }
    return "";
  };

  return (
    <Card className="p-4 border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare size={20} className="text-orange-600" />
        <h3 className="font-medium text-orange-800 dark:text-orange-200">
          Add a review for this activity
        </h3>
      </div>
      
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="distance" className="text-sm font-medium text-orange-800 dark:text-orange-200">
              Distance (km) *
            </Label>
            <Input
              id="distance"
              type="number"
              step="0.1"
              min="0"
              placeholder="5.2"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="duration" className="text-sm font-medium text-orange-800 dark:text-orange-200">
              Duration (min) *
            </Label>
            <Input
              id="duration"
              type="number"
              step="1"
              min="0"
              placeholder="30"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
        
        {distance && duration && (
          <div className="text-sm text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900 p-2 rounded">
            Average pace: {calculateAveragePace()}
          </div>
        )}
        
        <Textarea
          placeholder="How was this workout? Share your feelings, difficulties, positive points..."
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
            {isRecording ? "Stop Recording" : "Start Recording"}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleAIStructure}
            disabled={loading || aiProcessing || !review.trim() || !distance.trim() || !duration.trim()}
            className="flex items-center gap-2"
          >
            <Brain size={16} />
            {aiProcessing ? "AI..." : "Structure"}
          </Button>
          
          <Button
            onClick={handleSubmitReview}
            disabled={loading || aiProcessing || !review.trim() || !distance.trim() || !duration.trim()}
            className="flex items-center gap-2 ml-auto"
            size="sm"
          >
            <Send size={16} />
            {loading ? "Sending..." : "Submit"}
          </Button>
        </div>
      </div>
    </Card>
  );
};
