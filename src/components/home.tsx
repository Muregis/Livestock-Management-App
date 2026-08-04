import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AnalyticsGrid from "./dashboard/AnalyticsGrid";
import TaskManagementBoard from "./dashboard/TaskManagementBoard";
import WorkersPage from "./workers/WorkersPage";
import FarmSettingsPage from "./settings/FarmSettingsPage";
import HealthMonitorPanel from "./dashboard/HealthMonitorPanel";
import ActionFAB from "./dashboard/ActionFAB";
import BottomNav from "./dashboard/BottomNav";
import Header from "./dashboard/Header";
import ReportsPage from "./reports/ReportsPage";
import AIToolsPage from "./ai/AIToolsPage";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Users,
  Settings,
  LayoutDashboard,
  Activity,
  ListTodo,
  HeartPulse,
  Brain,
} from "lucide-react";

const HomePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "reports" | "workers" | "settings" | "ai"
  >("dashboard");
  const [activeDashboardView, setActiveDashboardView] = useState<
    "analytics" | "tasks" | "health"
  >("analytics");

  const dashboardViews = [
    { id: "analytics", label: "Analytics", icon: Activity },
    { id: "tasks", label: "Tasks", icon: ListTodo },
    { id: "health", label: "Health", icon: HeartPulse },
  ];

  const renderDashboardContent = () => {
    switch (activeDashboardView) {
      case "analytics":
        return <AnalyticsGrid />;
      case "tasks":
        return <TaskManagementBoard />;
      case "health":
        return <HealthMonitorPanel />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gray-50 max-w-[100vw] overflow-hidden">
      <Header />

      <main className="flex-1 overflow-y-auto pb-20 pt-4 px-2 sm:px-4 -mx-2 sm:mx-0">
        <div className="container mx-auto max-w-7xl space-y-4">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <Tabs
                value={activeDashboardView}
                onValueChange={(v) =>
                  setActiveDashboardView(v as typeof activeDashboardView)
                }
                className="w-full"
              >
                <TabsList className="w-full justify-start h-11 bg-white overflow-x-auto flex-nowrap">
                  {dashboardViews.map((view, index) => {
                    const Icon = view.icon;
                    return (
                      <TabsTrigger
                        key={view.id}
                        value={view.id}
                        className="flex items-center gap-2 px-4 py-2 whitespace-nowrap"
                      >
                        <span className="sm:hidden">{index + 1}</span>
                        <Icon className="h-4 w-4" />
                        {view.label}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>
              <div className="mt-6">{renderDashboardContent()}</div>
            </div>
          )}
          {activeTab === "reports" && <ReportsPage />}
          {activeTab === "workers" && <WorkersPage />}
          {activeTab === "ai" && <AIToolsPage />}
          {activeTab === "settings" && <FarmSettingsPage />}
        </div>
      </main>

      <ActionFAB />
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default HomePage;
