import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  Bell,
  Search,
  Filter,
  ArrowRight,
  Stethoscope,
  X,
} from "lucide-react";

interface HealthAlert {
  id: string;
  title: string;
  severity: number;
  timestamp: string;
  recommendation: string;
  status: "critical" | "warning" | "normal";
  location: string;
  affectedAnimals: number;
  assignedTo?: string;
  details: string;
}

interface HealthMonitorPanelProps {
  alerts?: HealthAlert[];
}

const defaultAlerts: HealthAlert[] = [
  {
    id: "1",
    title: "High fever detected in Barn A",
    severity: 85,
    timestamp: new Date().toISOString(),
    recommendation:
      "Isolate affected livestock and contact veterinarian immediately. Monitor temperature every 2 hours.",
    status: "critical",
    location: "Barn A - Section 2",
    affectedAnimals: 3,
    assignedTo: "Dr. Sarah",
    details:
      "Three Holstein cows showing signs of fever above 103°F. Possible respiratory infection.",
  },
  {
    id: "2",
    title: "Unusual behavior in Pen B3",
    severity: 65,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    recommendation:
      "Monitor closely for next 24 hours. Check feed and water intake.",
    status: "warning",
    location: "Pen B3",
    affectedAnimals: 2,
    details:
      "Two cows showing reduced appetite and lethargy. No visible symptoms of illness.",
  },
  {
    id: "3",
    title: "Regular health check due",
    severity: 30,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    recommendation: "Schedule routine checkup for herd in Barn C",
    status: "normal",
    location: "Barn C",
    affectedAnimals: 15,
    details: "Monthly health assessment for breeding stock.",
  },
];

const HealthMonitorPanel = ({
  alerts: initialAlerts = defaultAlerts,
}: HealthMonitorPanelProps) => {
  const [alerts, setAlerts] = useState<HealthAlert[]>(initialAlerts);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | HealthAlert["status"]
  >("all");
  const [selectedAlert, setSelectedAlert] = useState<HealthAlert | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAlerts((current) => {
        return current.map((alert) => ({
          ...alert,
          severity: Math.max(
            0,
            Math.min(100, alert.severity + (Math.random() - 0.5) * 10),
          ),
        }));
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || alert.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getSeverityColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

  const handleAction = (alert: HealthAlert) => {
    setSelectedAlert(alert);
    setIsActionDialogOpen(true);
  };

  const handleResolveAlert = () => {
    if (selectedAlert) {
      setAlerts((current) =>
        current.filter((alert) => alert.id !== selectedAlert.id),
      );
      setIsActionDialogOpen(false);
      setSelectedAlert(null);
    }
  };

  const handleShowDetails = (alert: HealthAlert) => {
    setSelectedAlert(alert);
    setIsDetailsOpen(true);
  };

  return (
    <Card className="bg-white shadow-sm h-full">
      <div className="p-4 sm:p-6 border-b space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
            <h2 className="text-lg sm:text-xl font-semibold">
              Health Monitoring
            </h2>
          </div>
          <Badge
            variant="outline"
            className="flex items-center gap-1.5 px-2 py-1 text-sm sm:text-base sm:px-3 sm:py-1.5 sm:gap-2 self-start sm:self-auto"
          >
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            {filteredAlerts.length} Active Alerts
          </Badge>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search alerts..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={filterStatus}
            onValueChange={(value) =>
              setFilterStatus(value as typeof filterStatus)
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-280px)]">
        <div className="p-4 sm:p-6 space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No alerts found
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 sm:p-6 rounded-lg border ${getSeverityColor(alert.status)} cursor-pointer transition-all hover:shadow-md`}
                onClick={() => handleShowDetails(alert)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                  <h3 className="text-base sm:text-lg font-medium">
                    {alert.title}
                  </h3>
                  <Badge
                    variant="outline"
                    className="self-start sm:self-auto px-2 py-1 text-xs sm:text-sm"
                  >
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </Badge>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Severity Level</span>
                    <span className="font-bold">
                      {Math.round(alert.severity)}%
                    </span>
                  </div>
                  <Progress
                    value={alert.severity}
                    className={`h-2 sm:h-3 ${
                      alert.status === "critical"
                        ? "bg-red-500"
                        : alert.status === "warning"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }`}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Location:</span>
                      <span>{alert.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Affected Animals:</span>
                      <span>{alert.affectedAnimals}</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className={`w-full sm:w-auto ${
                      alert.status === "critical"
                        ? "bg-red-600 hover:bg-red-700"
                        : alert.status === "warning"
                          ? "bg-yellow-600 hover:bg-yellow-700"
                          : "bg-green-600 hover:bg-green-700"
                    } text-white`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(alert);
                    }}
                  >
                    Take Action
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5" />
              Alert Details
            </DialogTitle>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {selectedAlert.title}
                </h3>
                <Badge
                  variant={
                    selectedAlert.status === "critical"
                      ? "destructive"
                      : selectedAlert.status === "warning"
                        ? "default"
                        : "secondary"
                  }
                >
                  {selectedAlert.status.toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Location</Label>
                  <p className="text-sm">{selectedAlert.location}</p>
                </div>
                <div>
                  <Label>Affected Animals</Label>
                  <p className="text-sm">{selectedAlert.affectedAnimals}</p>
                </div>
                <div>
                  <Label>Time Reported</Label>
                  <p className="text-sm">
                    {new Date(selectedAlert.timestamp).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label>Assigned To</Label>
                  <p className="text-sm">
                    {selectedAlert.assignedTo || "Unassigned"}
                  </p>
                </div>
              </div>

              <div>
                <Label>Details</Label>
                <p className="text-sm mt-1">{selectedAlert.details}</p>
              </div>

              <div>
                <Label>Recommendation</Label>
                <p className="text-sm mt-1">{selectedAlert.recommendation}</p>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setIsDetailsOpen(false)}
                >
                  Close
                </Button>
                <Button
                  className="w-full sm:w-auto"
                  onClick={() => {
                    setIsDetailsOpen(false);
                    handleAction(selectedAlert);
                  }}
                >
                  Take Action
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent className="w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>Take Action</DialogTitle>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Assign To</Label>
                <Select defaultValue={selectedAlert.assignedTo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dr. Sarah">Dr. Sarah</SelectItem>
                    <SelectItem value="Dr. John">Dr. John</SelectItem>
                    <SelectItem value="Nurse Emma">Nurse Emma</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority Level</Label>
                <Select defaultValue={selectedAlert.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setIsActionDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="w-full sm:w-auto"
                  onClick={handleResolveAlert}
                >
                  Mark as Resolved
                </Button>
                <Button
                  className="w-full sm:w-auto"
                  onClick={() => setIsActionDialogOpen(false)}
                >
                  Update Status
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default HealthMonitorPanel;
