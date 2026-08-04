import React from "react";
import { Home, FileText, Users, Settings, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BottomNavProps {
  activeTab?: "dashboard" | "reports" | "workers" | "settings" | "ai";
  onTabChange?: (
    tab: "dashboard" | "reports" | "workers" | "settings" | "ai",
  ) => void;
}

const BottomNav = ({
  activeTab = "dashboard",
  onTabChange = () => {},
}: BottomNavProps) => {
  const navItems = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    { id: "reports", icon: FileText, label: "Reports" },
    { id: "workers", icon: Users, label: "Workers" },
    { id: "ai", icon: Brain, label: "AI Tools" },
    { id: "settings", icon: Settings, label: "Farm" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border px-4 flex items-center justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <Button
            key={item.id}
            variant="ghost"
            className={`flex flex-col items-center p-1 min-w-[4rem] h-14 ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`}
            onClick={() => onTabChange(item.id as BottomNavProps["activeTab"])}
          >
            <Icon className="h-5 w-5 mb-1" />
            <span className="text-xs">{item.label}</span>
          </Button>
        );
      })}
    </div>
  );
};

export default BottomNav;
