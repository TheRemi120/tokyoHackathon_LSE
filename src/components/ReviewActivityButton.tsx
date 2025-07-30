import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [showPreRecordingModal, setShowPreRecordingModal] = useState(false);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [skipDistance, setSkipDistance] = useState(false);
  const [skipDuration, setSkipDuration] = useState(false);
  const [recordingData, setRecordingData] = useState<{ distance: number | null; duration: number | null }>({ distance: null, duration: null });
  
  const { startRecording, stopRecording, isRecording, transcript } = useSTT();
  const { processText, isProcessing: isLLMProcessing, error: llmError } = useHFLLM();
  const { toast } = useToast();

  const handleInitialClick = () => {
    setShowPreRecordingModal(true);
  };

  const handleStartRecording = () => {
    // Validate and save data
    const distanceNum = skipDistance ? null : parseFloat(distance);
    const durationNum = skipDuration ? null : parseFloat(duration);

    if (!skipDistance && (!distance.trim() || isNaN(distanceNum!) || distanceNum! <= 0)) {
      toast({
        variant: "destructive",
        title: "Invalid Distance",
        description: "Please enter a valid distance or check 'Skip'.",
      });
      return;
    }

    if (!skipDuration && (!duration.trim() || isNaN(durationNum!) || durationNum! <= 0)) {
      toast({
        variant: "destructive",
        title: "Invalid Duration",
        description: "Please enter a valid duration or check 'Skip'.",
      });
      return;
    }

    // Store the data for later use
    setRecordingData({ 
      distance: distanceNum, 
      duration: durationNum 
    });

    // Close modal and start recording
    setShowPreRecordingModal(false);
    startRecording();
    setProcessingStep('recording');
    setHasRecorded(false);
  };

  const resetModal = () => {
    setDistance("");
    setDuration("");
    setSkipDistance(false);
    setSkipDuration(false);
  };

  const handleRecordingToggle = async () => {
    if (isRecording) {
      stopRecording();
      setProcessingStep('transcribing');
      setIsProcessing(true);
      setHasRecorded(true);
    } else {
      // This should not be called directly anymore, use handleInitialClick instead
      handleInitialClick();
    }
  };

  const saveActivityFromTranscript = async (transcriptText: string, processedReview?: string, activityScore?: number) => {
    try {
      setProcessingStep('saving');
      
      // Use recorded data with special values (-1) to indicate "skipped" data
      const finalDistance = recordingData.distance || -1; // Use -1 to indicate "N/A"
      const finalDuration = recordingData.duration ? recordingData.duration * 60 : -1; // Convert minutes to seconds, use -1 for "N/A"
      
      const { data, error } = await supabase
        .from('activities')
        .insert({
          user_id: userId,
          time: finalDuration,
          distance: finalDistance,
          reviewed: true,
          review: processedReview || transcriptText, // Use processed review if available
          score: activityScore || null, // LLM-calculated score
        })
        .select('*')
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error("Unable to save activity.");
      }

      onActivityAdded(data);
      setProcessingStep('complete');
    } catch (error) {
      console.error('Error saving activity:', error);
      throw error; // Re-throw for useEffect error handling
    } finally {
      setIsProcessing(false);
    }
  };

  // Enhanced workflow: STT -> LLM -> Save Activity (like SessionRecorder)
  useEffect(() => {
    const processTranscriptWithLLM = async () => {
      if (transcript && hasRecorded && processingStep === 'transcribing') {
        try {
          setProcessingStep('processing');
          
          // Show status "AI structuring your notes"
          toast({
            title: "AI structuring your notes",
            description: "Processing in progress...",
          });
          
          // Pass recorded data to LLM for better processing
          const llmResult = await processText(
            transcript, 
            recordingData.distance || undefined, 
            recordingData.duration || undefined
          );
          
          if (llmResult.success && llmResult.processedText) {
            // Show status "Saving activity"
            toast({
              title: "Saving activity",
              description: "Recording in progress...",
            });
            
            // Save activity with processed review and score
            await saveActivityFromTranscript(transcript, llmResult.processedText, llmResult.score);
            
            toast({
              title: "✅ Activity saved",
              description: "Your session has been recorded successfully.",
            });
          } else {
            // Show AI processing error but save original text with basic scoring
            toast({
              title: "⚠️ AI processing failed - original text used",
              description: "Activity has been saved with original text.",
            });
            
            // Calculate basic fallback score
            let fallbackScore = 5; // Default middle score
            if (recordingData.distance && recordingData.duration) {
              const pace = recordingData.duration / recordingData.distance;
              if (pace <= 5) fallbackScore = 7;
              else if (pace <= 6) fallbackScore = 6;
              else if (pace >= 8) fallbackScore = 4;
            }
            
            await saveActivityFromTranscript(transcript, undefined, fallbackScore);
          }
        } catch (error) {
          console.error('Error in LLM processing workflow:', error);
          
          toast({
            variant: "destructive",
            title: "⚠️ Save error",
            description: "An unexpected error occurred.",
          });
          
          // Fallback to original transcript with basic scoring
          let fallbackScore = 5; // Default middle score
          if (recordingData.distance && recordingData.duration) {
            const pace = recordingData.duration / recordingData.distance;
            if (pace <= 5) fallbackScore = 7;
            else if (pace <= 6) fallbackScore = 6;
            else if (pace >= 8) fallbackScore = 4;
          }
          
          await saveActivityFromTranscript(transcript, undefined, fallbackScore);
        } finally {
          setHasRecorded(false);
        }
      }
    };

    processTranscriptWithLLM();
  }, [transcript, hasRecorded, processingStep]);

  return (
    <>
      <Card className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Plus size={20} className="text-primary" />
            <h3 className="font-semibold text-foreground">Record Activity</h3>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            Record your session and let AI structure your notes
          </p>
          
          <Button
            onClick={isRecording ? handleRecordingToggle : handleInitialClick}
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
                {processingStep === 'transcribing' && "Transcribing..."}
                {processingStep === 'processing' && "AI Processing..."}
                {processingStep === 'saving' && "Saving..."}
              </>
            ) : isRecording ? (
              <>
                <MicOff size={20} className="mr-2" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic size={20} className="mr-2" />
                Start Recording
              </>
            )}
          </Button>
          
          {isRecording && (
            <p className="text-xs text-red-500 animate-pulse">
              🔴 Recording in progress...
            </p>
          )}
          
          {processingStep === 'transcribing' && (
            <p className="text-xs text-blue-500 animate-pulse">
              🎙️ Audio transcription...
            </p>
          )}
          
          {processingStep === 'processing' && (
            <p className="text-xs text-purple-500 animate-pulse">
              <Brain size={12} className="inline mr-1" />
              AI structuring your notes...
            </p>
          )}
          
          {processingStep === 'saving' && (
            <p className="text-xs text-green-500 animate-pulse">
              💾 Saving activity...
            </p>
          )}
          
          {llmError && (
            <p className="text-xs text-orange-500">
              ⚠️ AI processing failed - original text used
            </p>
          )}
          
          {transcript && (
            <div className="mt-3 p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Transcription:</p>
              <p className="text-sm text-foreground">{transcript}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Pre-recording Data Collection Modal */}
      <Dialog open={showPreRecordingModal} onOpenChange={(open) => {
        setShowPreRecordingModal(open);
        if (!open) resetModal();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Activity Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="distance" className="text-sm font-medium">
                Distance (km)
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="distance"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="5.2"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  disabled={skipDistance}
                  className="flex-1"
                />
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="skip-distance"
                    checked={skipDistance}
                    onCheckedChange={(checked) => setSkipDistance(checked as boolean)}
                  />
                  <Label htmlFor="skip-distance" className="text-sm text-muted-foreground">
                    Skip
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="text-sm font-medium">
                Duration (minutes)
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="duration"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="30"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  disabled={skipDuration}
                  className="flex-1"
                />
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="skip-duration"
                    checked={skipDuration}
                    onCheckedChange={(checked) => setSkipDuration(checked as boolean)}
                  />
                  <Label htmlFor="skip-duration" className="text-sm text-muted-foreground">
                    Skip
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowPreRecordingModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleStartRecording}
                className="flex-1"
              >
                Start Recording
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
