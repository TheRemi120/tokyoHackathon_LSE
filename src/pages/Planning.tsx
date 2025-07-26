import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Filter, Clock, MapPin, Target } from "lucide-react";
import { useState } from "react";

const Planning = () => {
  const [currentMonth, setCurrentMonth] = useState("January 2024");
  
  // Mock calendar data - each day can have: completed, planned, or empty
  const calendarDays = Array.from({ length: 35 }, (_, i) => {
    const day = i - 2; // Start from day -2 to show previous month days
    if (day < 1 || day > 31) return { day: day < 1 ? 30 + day : day - 31, isCurrentMonth: false };
    
    const status = 
      day === 23 || day === 20 || day === 17 ? 'completed' :
      day === 25 || day === 27 ? 'planned' : null;
    
    return { day, isCurrentMonth: true, status, isSelected: day === 24 };
  });

  const upcomingSessions = [
    {
      id: 1,
      date: "Jan 25",
      time: "7:00 AM",
      type: "Tempo Run",
      distance: "6 km",
      status: "planned"
    },
    {
      id: 2,
      date: "Jan 27", 
      time: "6:30 AM",
      type: "Long Run",
      distance: "10 km",
      status: "planned"
    },
    {
      id: 3,
      date: "Jan 29",
      time: "7:15 AM", 
      type: "Recovery Run",
      distance: "4 km",
      status: "validated"
    }
  ];

  const milestones = [
    { title: "Sub-25 5K", progress: 78, status: "in-progress" },
    { title: "10K Race Ready", progress: 45, status: "in-progress" },
    { title: "Half Marathon", progress: 0, status: "locked" }
  ];

  return (
    <div className="min-h-screen bg-background pb-20 font-sf">
      <Header title="Planning" rightIcon={<Filter size={20} />} />
      
      <div className="p-4 space-y-6">
        {/* Monthly Calendar */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm">
              <ChevronLeft size={16} />
            </Button>
            <h3 className="font-semibold text-foreground">{currentMonth}</h3>
            <Button variant="ghost" size="sm">
              <ChevronRight size={16} />
            </Button>
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((dayData, i) => (
              <div
                key={i}
                className={`
                  aspect-square flex items-center justify-center text-sm relative rounded-lg
                  ${dayData.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/50'}
                  ${dayData.isSelected ? 'bg-blue-light' : 'hover:bg-muted/50'}
                `}
              >
                {dayData.day}
                {dayData.status && (
                  <div 
                    className={`
                      absolute bottom-1 w-1.5 h-1.5 rounded-full
                      ${dayData.status === 'completed' ? 'bg-primary' : 'bg-yellow-warning'}
                    `}
                  />
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Sessions */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-foreground">Upcoming Sessions</h2>
          <div className="space-y-3">
            {upcomingSessions.map((session) => (
              <Card key={session.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-muted-foreground" />
                    <span className="font-semibold text-foreground">
                      {session.date} · {session.time}
                    </span>
                  </div>
                  <Badge 
                    variant={session.status === "validated" ? "default" : "warning"}
                  >
                    {session.status === "validated" ? "Validated" : "To do"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-center gap-1">
                    <MapPin size={14} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">{session.type}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{session.distance}</span>
                </div>
                <Button variant="link" className="p-0 h-auto text-primary text-sm">
                  Details
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Milestones & Goals */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-foreground">Milestones & Goals</h2>
          <div className="space-y-3">
            {milestones.map((milestone, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`
                      w-3 h-3 rounded-full
                      ${milestone.status === 'in-progress' ? 'bg-primary' : 'bg-muted-foreground'}
                    `} />
                    <span className="font-medium text-foreground">{milestone.title}</span>
                  </div>
                  <Target size={16} className="text-muted-foreground" />
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${milestone.progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{milestone.progress}% complete</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Planning;