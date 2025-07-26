import { Header } from "@/components/Header";
import { RunCard } from "@/components/RunCard";
import { Card } from "@/components/ui/card";
import { TrendingUp, Clock, Zap, Award } from "lucide-react";

const ActivityLog = () => {
  const weekSummary = {
    totalRuns: 4,
    totalDistance: "18.2 km",
    avgPace: "5:12/km",
    bestSplit: "4:45/km"
  };

  const runs = [
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
      title: "Tempo Session",
      date: "Jan 23, 6:30 AM", 
      distance: "6.0 km",
      duration: "28:45",
      pace: "4:47/km",
      isDebriefed: true,
      aiRating: 8.5
    },
    {
      id: "3",
      title: "Easy Recovery",
      date: "Jan 22, 6:30 PM",
      distance: "3.2 km", 
      duration: "18:45",
      pace: "5:51/km",
      isDebriefed: false
    },
    {
      id: "4",
      title: "Long Run",
      date: "Jan 21, 8:00 AM",
      distance: "8.0 km",
      duration: "42:30",
      pace: "5:18/km", 
      isDebriefed: true,
      aiRating: 9.2
    },
    {
      id: "5",
      title: "Track Intervals", 
      date: "Jan 19, 7:15 AM",
      distance: "4.5 km",
      duration: "20:15",
      pace: "4:30/km",
      isDebriefed: true,
      aiRating: 7.8
    },
    {
      id: "6",
      title: "Easy Run",
      date: "Jan 18, 6:45 PM",
      distance: "5.5 km", 
      duration: "30:22",
      pace: "5:31/km",
      isDebriefed: true,
      aiRating: 8.0
    }
  ];

  const summaryStats = [
    { icon: TrendingUp, label: "Total Runs", value: weekSummary.totalRuns },
    { icon: Clock, label: "Total Distance", value: weekSummary.totalDistance },
    { icon: Zap, label: "Avg Pace", value: weekSummary.avgPace },
    { icon: Award, label: "Best Split", value: weekSummary.bestSplit }
  ];

  return (
    <div className="min-h-screen bg-background pb-20 font-sf">
      <Header title="Activity Log" />
      
      <div className="p-4 space-y-6">
        {/* This Week's Summary */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4 text-foreground">This Week's Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            {summaryStats.map(({ icon: Icon, label, value }, i) => (
              <div key={i} className="text-center">
                <Icon size={20} className="text-primary mx-auto mb-2" />
                <p className="text-sm font-semibold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Runs List */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-foreground">Recent Runs</h2>
          <div className="space-y-0">
            {runs.map((run) => (
              <RunCard
                key={run.id}
                {...run}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;