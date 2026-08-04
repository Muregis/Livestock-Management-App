import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Bell, Shield, Palette, Mail, Wifi, Cloud } from "lucide-react";

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  priority?: "high" | "medium" | "low";
  lastNotification?: string;
}

const defaultNotifications: NotificationSetting[] = [
  {
    id: "task-updates",
    title: "Task Updates",
    description: "Get notified when tasks are assigned or completed",
    enabled: true,
    priority: "medium",
    lastNotification: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "system-updates",
    title: "System Updates",
    description: "Notifications about system maintenance and updates",
    enabled: true,
    priority: "low",
    lastNotification: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "security-alerts",
    title: "Security Alerts",
    description: "Get notified about important security events",
    enabled: true,
    priority: "high",
    lastNotification: new Date(Date.now() - 3600000).toISOString(),
  },
];

export const SettingsPage = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(defaultNotifications);
  const [activeTab, setActiveTab] = useState("notifications");
  const [theme, setTheme] = useState("light");
  const [isLoading, setIsLoading] = useState(false);

  const handleNotificationToggle = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, enabled: !notification.enabled }
          : notification,
      ),
    );
    toast({
      title: "Notification settings updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    toast({
      title: "Settings saved",
      description: "Your changes have been successfully saved.",
    });
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start h-11 bg-white overflow-x-auto flex-nowrap">
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <Bell className="w-4 h-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="w-4 h-4" /> Appearance
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" /> Security
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="notifications">
            <Card className="p-4">
              <div className="space-y-6">
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{notification.title}</p>
                          {notification.priority && (
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                notification.priority === "high"
                                  ? "border-red-200 text-red-800"
                                  : notification.priority === "medium"
                                    ? "border-yellow-200 text-yellow-800"
                                    : "border-green-200 text-green-800"
                              }`}
                            >
                              {notification.priority}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {notification.description}
                        </p>
                      </div>
                      <Switch
                        checked={notification.enabled}
                        onCheckedChange={() =>
                          handleNotificationToggle(notification.id)
                        }
                      />
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Notification Channels</h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Card className="p-4 flex items-center gap-4">
                      <Mail className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-sm text-gray-500">
                          user@example.com
                        </p>
                      </div>
                      <Switch defaultChecked className="ml-auto" />
                    </Card>
                    <Card className="p-4 flex items-center gap-4">
                      <Wifi className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium">Push</p>
                        <p className="text-sm text-gray-500">Browser</p>
                      </div>
                      <Switch defaultChecked className="ml-auto" />
                    </Card>
                    <Card className="p-4 flex items-center gap-4">
                      <Cloud className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="font-medium">Mobile</p>
                        <p className="text-sm text-gray-500">
                          App notifications
                        </p>
                      </div>
                      <Switch className="ml-auto" />
                    </Card>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card className="p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="p-4">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-500">
                        Add an extra layer of security
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Session Timeout</Label>
                      <p className="text-sm text-gray-500">
                        Auto logout after inactivity
                      </p>
                    </div>
                    <Select defaultValue="30">
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button variant="outline" disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleSaveChanges} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};
