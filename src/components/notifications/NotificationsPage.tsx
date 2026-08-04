import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Search,
  Bell,
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
  X,
} from "lucide-react";

type NotificationType = "alert" | "task" | "system";
type NotificationPriority = "high" | "medium" | "low";

interface Notification {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  priority: NotificationPriority;
  timestamp: string;
  read: boolean;
}

const defaultNotifications: Notification[] = [
  {
    id: "1",
    title: "High Temperature Alert",
    description:
      "Temperature in Barn A exceeds threshold (85°F). Check ventilation system.",
    type: "alert",
    priority: "high",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    read: false,
  },
  {
    id: "2",
    title: "Feed Stock Low",
    description: "Hay storage below 20% capacity. Schedule resupply.",
    type: "alert",
    priority: "medium",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false,
  },
  {
    id: "3",
    title: "Health Check Complete",
    description: "Weekly health inspection completed for Herd B. View report.",
    type: "task",
    priority: "low",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: true,
  },
  {
    id: "4",
    title: "System Maintenance",
    description: "Scheduled maintenance completed for milking equipment.",
    type: "system",
    priority: "low",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    read: true,
  },
];

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState(defaultNotifications);
  const [activeTab, setActiveTab] = useState<"all" | NotificationType>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)),
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const filteredNotifications = notifications.filter((notif) => {
    const matchesSearch =
      notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = activeTab === "all" || notif.type === activeTab;
    return matchesSearch && matchesType;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case "alert":
        return AlertCircle;
      case "task":
        return CheckCircle2;
      case "system":
        return Bell;
      default:
        return Bell;
    }
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-100 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-100 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-100 border-green-200";
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Notifications</h2>
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount} unread</Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark all as read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              disabled={notifications.length === 0}
            >
              Clear all
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search notifications..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as typeof activeTab)}
        >
          <TabsList className="w-full justify-start">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Bell className="w-4 h-4" /> All
            </TabsTrigger>
            <TabsTrigger value="alert" className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Alerts
            </TabsTrigger>
            <TabsTrigger value="task" className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Tasks
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Bell className="w-4 h-4" /> System
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="p-4 space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No notifications found
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const Icon = getTypeIcon(notification.type);
              return (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-colors ${notification.read ? "bg-white" : "bg-blue-50"}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon
                      className={`w-5 h-5 mt-0.5 ${notification.read ? "text-gray-400" : "text-blue-500"}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-sm">
                          {notification.title}
                        </h3>
                        <Badge
                          variant="outline"
                          className={`shrink-0 ${getPriorityColor(notification.priority)}`}
                        >
                          {notification.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(notification.timestamp).toLocaleString()}
                        </span>
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs text-blue-600 hover:text-blue-700"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default NotificationsPage;
