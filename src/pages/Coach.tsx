import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, Scale, Target, Mic, Send, BarChart3, FileText, Trophy, Shield, Brain, Volume2 } from "lucide-react";
import { useState } from "react";
import { useAICoach } from "@/hooks/useAICoach";

const Coach = () => {
  const [message, setMessage] = useState("");
  const [coachingMessage, setCoachingMessage] = useState("");
  const { generateCoaching, isGenerating, isPlaying } = useAICoach();
  
  const insights = [
    { icon: TrendingUp, value: "+2.3%", label: "Weekly Progress" },
    { icon: Scale, value: "Optimal", label: "Training Load" },
    { icon: Target, value: "Sub-25 5K", label: "Next Goal" }
  ];

  const quickActions = [
    { icon: BarChart3, label: "Analyze last run" },
    { icon: FileText, label: "Create training plan" },
    { icon: Trophy, label: "Race preparation" },
    { icon: Shield, label: "Injury prevention" }
  ];

  const chatMessages = [
    {
      id: 1,
      isAI: true,
      message: "Hi! I've analyzed your recent runs and noticed great improvement in your consistency. How are you feeling today?",
      timestamp: "10:30 AM"
    },
    {
      id: 2,
      isAI: false,
      message: "Feeling good! My legs feel recovered from yesterday's run.",
      timestamp: "10:32 AM"
    },
    {
      id: 3,
      isAI: true,
      message: "That's excellent! Based on your recovery metrics, you're ready for today's tempo session. Remember to warm up properly and keep the first 2km easy.",
      timestamp: "10:33 AM"
    }
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  const handleAICoachClick = async () => {
    const coaching = await generateCoaching();
    setCoachingMessage(coaching);
  };

  return (
    <div className="min-h-screen bg-background pb-20 font-sf">
      <Header title="AI Running Coach" />
      
      <div className="p-4 space-y-6">
        {/* Today's Insights */}
        <div>
          <div className="grid grid-cols-3 gap-3">
            {insights.map(({ icon: Icon, value, label }, i) => (
              <Card key={i} className="p-3 text-center h-20 flex flex-col justify-center">
                <Icon size={16} className="text-primary mx-auto mb-1" />
                <p className="text-sm font-semibold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* AI Coach Button */}
        <div>
          <Button 
            onClick={handleAICoachClick}
            disabled={isGenerating}
            className="w-full h-12 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold"
          >
            <Brain size={20} className="mr-2" />
            {isGenerating ? "Analyzing Performance..." : "Get AI Coaching"}
            {isPlaying && <Volume2 size={16} className="ml-2 animate-pulse" />}
          </Button>
        </div>

        {/* AI Coaching Message */}
        {coachingMessage && (
          <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Brain size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-purple-900 mb-2">Your AI Coach Says:</h3>
                <p className="text-sm text-purple-800 leading-relaxed">{coachingMessage}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Chat Feed */}
        <div>
          <Card className="p-4 h-[28rem] overflow-y-auto">
            <div className="space-y-4">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isAI ? 'justify-start' : 'justify-end'}`}>
                  <div className={`
                    max-w-[80%] p-3 rounded-2xl
                    ${msg.isAI 
                      ? 'bg-muted text-foreground rounded-bl-md' 
                      : 'bg-primary text-primary-foreground rounded-br-md'
                    }
                  `}>
                    <p className="text-sm">{msg.message}</p>
                    <p className={`text-xs mt-1 ${msg.isAI ? 'text-muted-foreground' : 'text-primary-foreground/70'}`}>
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          
          {/* Message Input */}
          <div className="flex gap-2 mt-3">
            <div className="flex-1 relative">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask me about training..."
                className="pr-10"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1"
              >
                <Mic size={16} className="text-muted-foreground" />
              </Button>
            </div>
            <Button onClick={handleSendMessage} size="sm" className="px-4">
              <Send size={16} />
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold mb-3 text-foreground">Quick Actions</h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {quickActions.map(({ icon: Icon, label }, i) => (
              <Button
                key={i}
                variant="outline"
                className="flex items-center gap-2 whitespace-nowrap flex-shrink-0 text-primary border-primary/30"
              >
                <Icon size={16} />
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Coach;