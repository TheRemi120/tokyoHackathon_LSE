import { Home, Calendar, Bot, CheckSquare } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export const BottomNav = () => {
  const location = useLocation();
  
  const tabs = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Calendar, label: "Planning", path: "/planning" },
    { icon: Bot, label: "Coach", path: "/coach" },
    { icon: CheckSquare, label: "Activity Log", path: "/activity" }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-glass-bg backdrop-blur-md border-t border-border">
      <div className="max-w-md mx-auto grid grid-cols-4 gap-2 px-4 py-2">
        {tabs.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center py-2 px-1 rounded-lg transition-colors",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon size={20} className="mb-1" />
              <span className="text-xs font-medium leading-none">{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};