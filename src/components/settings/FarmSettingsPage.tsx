import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Building2, Scale, RefreshCw, Thermometer, Zap } from "lucide-react";

interface FarmSetting {
  id: string;
  title: string;
  value: string;
  type: "text" | "select" | "number" | "textarea" | "switch";
  options?: string[];
  description?: string;
  category: "general" | "operations" | "environment" | "utilities";
  unit?: string;
  min?: number;
  max?: number;
}

const defaultSettings: FarmSetting[] = [
  // General Settings
  {
    id: "farm-name",
    title: "Livestock Farm Name",
    value: "Agrivanna Livestock Farm",
    type: "text",
    category: "general",
    description: "Official name of your livestock farm",
  },
  {
    id: "livestock-type",
    title: "Livestock Type",
    value: "Cattle",
    type: "select",
    options: ["Cattle", "Sheep", "Goats", "Mixed Livestock"],
    category: "general",
    description: "Primary type of livestock operation",
  },
  {
    id: "livestock-capacity",
    title: "Livestock Capacity",
    value: "500",
    type: "number",
    category: "general",
    description: "Maximum number of animals the farm can accommodate",
    min: 1,
  },
  {
    id: "registration-number",
    title: "Livestock Registration",
    value: "LVS123456",
    type: "text",
    category: "general",
    description: "Official livestock farm registration number",
  },

  // Operations Settings
  {
    id: "feeding-schedule",
    title: "Feed Distribution Schedule",
    value: "Three Times Daily",
    type: "select",
    options: ["Once Daily", "Twice Daily", "Three Times Daily", "Automated"],
    category: "operations",
    description: "Standard feeding schedule for livestock",
  },
  {
    id: "health-checks",
    title: "Health Inspection Frequency",
    value: "Weekly",
    type: "select",
    options: ["Daily", "Bi-Weekly", "Weekly", "Monthly"],
    category: "operations",
    description: "Regular health inspection intervals",
  },
  {
    id: "breeding-program",
    title: "Breeding Management",
    value: "Seasonal",
    type: "select",
    options: ["Year-Round", "Seasonal", "Controlled", "Not Active"],
    category: "operations",
    description: "Breeding program management approach",
  },
  {
    id: "quarantine-protocol",
    title: "Quarantine Protocol",
    value: "true",
    type: "switch",
    category: "operations",
    description: "Enable quarantine protocols for new/sick animals",
  },

  // Environment Settings
  {
    id: "housing-temperature",
    title: "Housing Temperature",
    value: "68",
    type: "number",
    category: "environment",
    description: "Target temperature for livestock housing",
    unit: "°F",
    min: 32,
    max: 100,
  },
  {
    id: "humidity-control",
    title: "Humidity Control",
    value: "60",
    type: "number",
    category: "environment",
    description: "Target humidity level for livestock comfort",
    unit: "%",
    min: 30,
    max: 80,
  },
  {
    id: "ventilation-system",
    title: "Ventilation System",
    value: "Smart Control",
    type: "select",
    options: ["Natural", "Mechanical", "Smart Control", "Hybrid"],
    category: "environment",
    description: "Housing ventilation system type",
  },
  {
    id: "bedding-type",
    title: "Bedding Material",
    value: "Straw",
    type: "select",
    options: ["Straw", "Sawdust", "Sand", "Rubber Mats"],
    category: "environment",
    description: "Primary bedding material for livestock",
  },

  // Utilities Settings
  {
    id: "water-system",
    title: "Water Distribution",
    value: "Automated",
    type: "select",
    options: ["Manual", "Semi-Automated", "Automated", "Smart System"],
    category: "utilities",
    description: "Livestock watering system type",
  },
  {
    id: "waste-management",
    title: "Waste Management",
    value: "true",
    type: "switch",
    category: "utilities",
    description: "Enable automated waste management system",
  },
  {
    id: "power-backup",
    title: "Emergency Power",
    value: "true",
    type: "switch",
    category: "utilities",
    description: "Enable backup power for critical systems",
  },
  {
    id: "monitoring-system",
    title: "Livestock Monitoring",
    value: "Advanced",
    type: "select",
    options: ["Basic", "Standard", "Advanced", "Premium"],
    category: "utilities",
    description: "Level of automated livestock monitoring",
  },
];

const FarmSettingsPage = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState(defaultSettings);
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(false);

  const handleSettingChange = (id: string, value: string) => {
    setSettings((prev) =>
      prev.map((setting) =>
        setting.id === id ? { ...setting, value } : setting,
      ),
    );
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    toast({
      title: "Farm settings saved",
      description: "Your livestock farm configuration has been updated.",
    });
  };

  const handleResetSettings = () => {
    setSettings(defaultSettings);
    toast({
      title: "Settings reset",
      description: "Farm settings have been restored to default values.",
    });
  };

  const getTabIcon = (category: string) => {
    switch (category) {
      case "general":
        return Building2;
      case "operations":
        return Scale;
      case "environment":
        return Thermometer;
      case "utilities":
        return Zap;
      default:
        return Building2;
    }
  };

  return (
    <div className="space-y-6 pb-20 sm:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">
            Livestock Farm Settings
          </h1>
          <p className="text-sm sm:text-base text-gray-500">
            Manage your livestock farm configuration
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="gap-2 w-full sm:w-auto text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Reset All
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="w-[95vw] max-w-[425px]">
            <AlertDialogHeader>
              <AlertDialogTitle>Reset farm settings?</AlertDialogTitle>
              <AlertDialogDescription>
                This will reset all farm settings to their default values. This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel className="w-full sm:w-auto">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleResetSettings}
                className="w-full sm:w-auto"
              >
                Reset
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start h-12 bg-white overflow-x-auto flex-nowrap -mx-2 sm:mx-0 px-2 sm:px-0 gap-1">
          {["general", "operations", "environment", "utilities"].map(
            (category) => {
              const Icon = getTabIcon(category);
              return (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="flex items-center gap-2 flex-1 sm:flex-none px-3 sm:px-4 min-w-[80px] sm:min-w-0"
                >
                  <Icon className="w-4 h-4" />
                  <span className="capitalize">{category}</span>
                </TabsTrigger>
              );
            },
          )}
        </TabsList>

        <div className="mt-6">
          {["general", "operations", "environment", "utilities"].map(
            (category) => (
              <TabsContent key={category} value={category}>
                <Card className="p-4 sm:p-6">
                  <div className="space-y-8">
                    {settings
                      .filter((setting) => setting.category === category)
                      .map((setting) => (
                        <div key={setting.id} className="space-y-3">
                          <Label
                            className="text-sm sm:text-base font-medium"
                            htmlFor={setting.id}
                          >
                            {setting.title}
                          </Label>
                          <div className="mt-1.5">
                            {setting.type === "select" ? (
                              <Select
                                value={setting.value}
                                onValueChange={(value) =>
                                  handleSettingChange(setting.id, value)
                                }
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {setting.options?.map((option) => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : setting.type === "textarea" ? (
                              <Textarea
                                id={setting.id}
                                value={setting.value}
                                onChange={(e) =>
                                  handleSettingChange(
                                    setting.id,
                                    e.target.value,
                                  )
                                }
                                className="w-full min-h-[100px]"
                              />
                            ) : setting.type === "switch" ? (
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={setting.value === "true"}
                                  onCheckedChange={(checked) =>
                                    handleSettingChange(
                                      setting.id,
                                      String(checked),
                                    )
                                  }
                                />
                                <span className="text-sm text-gray-500">
                                  {setting.value === "true"
                                    ? "Enabled"
                                    : "Disabled"}
                                </span>
                              </div>
                            ) : (
                              <div className="relative">
                                <Input
                                  id={setting.id}
                                  type={setting.type}
                                  value={setting.value}
                                  onChange={(e) =>
                                    handleSettingChange(
                                      setting.id,
                                      e.target.value,
                                    )
                                  }
                                  className="w-full pr-10"
                                  min={setting.min}
                                  max={setting.max}
                                />
                                {setting.unit && (
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                                    {setting.unit}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          {setting.description && (
                            <p className="text-xs sm:text-sm text-gray-500">
                              {setting.description}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                </Card>
              </TabsContent>
            ),
          )}
        </div>
      </Tabs>

      <div className="fixed bottom-[4.5rem] left-0 right-0 p-4 bg-background border-t sm:relative sm:bottom-auto sm:left-auto sm:right-auto sm:p-0 sm:bg-transparent sm:border-0 flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-4 z-10">
        <Button
          variant="outline"
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSaveChanges}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default FarmSettingsPage;
