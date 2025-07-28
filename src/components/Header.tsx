import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  rightIcon?: React.ReactNode;
}

export const Header = ({ title, rightIcon = <Settings size={20} /> }: HeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 bg-background border-b border-border">
      <h1 className="text-xl font-semibold text-foreground font-sf">{title}</h1>
      <div>
        {rightIcon}
      </div>
    </div>
  );
};