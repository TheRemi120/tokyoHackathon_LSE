import { Header } from "@/components/Header";
import { RunCard } from "@/components/RunCard";
import { Card } from "@/components/ui/card";
import { Volume2, TrendingUp, Moon, Heart, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock data
const pendingRuns = [
  {
    id: "1",
    title: "Morning Run",
    date: "Jan 24, 7:00 AM",
    distance: "5.0 km",
    duration: "24:32",
    pace: "4:54/km",
    isDebriefed: false
  },
  {
    id: "2", 
    title: "Easy Recovery",
    date: "Jan 22, 6:30 PM",
    distance: "3.2 km",
    duration: "18:45",
    pace: "5:51/km",
    isDebriefed: false
  }
];

const weeklyStats = [
  { icon: TrendingUp, label: "Steps", value: "8,432", status: "good" },
  { icon: Moon, label: "Sleep", value: "7.2h", status: "warning" },
  { icon: Heart, label: "Recovery", value: "Good", status: "good" }
];

const Home = () => {
  const handleRecordDebrief = (id: string) => {
    console.log("Recording debrief for run:", id);
  };

  const handleTypeDebrief = (id: string) => {
    console.log("Typing debrief for run:", id);
  };

  return (
    <div className="min-h-screen bg-background pb-20 font-sf">
      <Header title="Home" />
      
      <div className="p-4 space-y-6">
        {/* Pending Debriefs */}
        {pendingRuns.length > 0 ? (
          <div>
            <h2 className="text-lg font-semibold mb-4 text-foreground">Pending Debriefs</h2>
            {pendingRuns.map((run) => (
              <RunCard
                key={run.id}
                {...run}
                isPending={true}
                onRecordDebrief={handleRecordDebrief}
                onTypeDebrief={handleTypeDebrief}
              />
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <CheckCircle className="mx-auto mb-2 text-green-success" size={24} />
            <p className="text-foreground font-medium">All caught up!</p>
            <p className="text-sm text-muted-foreground">No pending debriefs</p>
          </Card>
        )}

        {/* AI Coach Card */}
        <Card className="p-4 bg-blue-glass">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-primary">AI Coach</h3>
            <Button variant="ghost" size="sm" className="p-1">
              <Volume2 size={16} className="text-primary" />
            </Button>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            Great job on your consistency this week! Your recovery metrics look good. 
            Consider adding a tempo run to your schedule for next week to build speed endurance.
          </p>
        </Card>

        {/* This Week's Summary */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-foreground">This Week's Summary</h2>
          <div className="grid grid-cols-3 gap-3">
            {weeklyStats.map(({ icon: Icon, label, value, status }) => (
              <Card key={label} className="p-3 text-center">
                <div className="flex justify-center mb-2">
                  <Icon 
                    size={20} 
                    className={status === "good" ? "text-green-success" : "text-yellow-warning"} 
                  />
                  {status === "warning" && (
                    <AlertCircle size={12} className="text-yellow-warning ml-1" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className="text-sm font-semibold text-foreground">{value}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;