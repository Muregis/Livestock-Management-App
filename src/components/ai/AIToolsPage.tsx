import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Brain,
  Camera,
  Microscope,
  Dna,
  Sparkles,
  Upload,
  Search,
  X,
  AlertCircle,
  ChevronRight,
  Loader2,
  ArrowRight,
  CheckCircle,
  Info,
} from "lucide-react";

type AIToolStatus = "active" | "processing" | "error";

interface AITool {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  status: AIToolStatus;
  lastUsed: string;
  features: string[];
  usageCount: number;
  accuracy?: number;
  color?: string;
}

const defaultTools: AITool[] = [
  {
    id: "disease-detection",
    title: "Disease Detection",
    description:
      "AI-powered visual analysis for early disease detection in livestock",
    icon: Microscope,
    status: "active",
    lastUsed: "2 hours ago",
    features: [
      "Real-time disease detection",
      "Multi-animal scanning",
      "Symptom analysis",
      "Treatment recommendations",
    ],
    usageCount: 128,
    accuracy: 95.5,
    color: "blue",
  },
  {
    id: "behavior-analysis",
    title: "Behavior Analysis",
    description:
      "Monitor and analyze livestock behavior patterns using computer vision",
    icon: Camera,
    status: "active",
    lastUsed: "1 day ago",
    features: [
      "24/7 behavior monitoring",
      "Anomaly detection",
      "Movement tracking",
      "Social interaction analysis",
    ],
    usageCount: 256,
    accuracy: 92.8,
    color: "purple",
  },
  {
    id: "genetic-analysis",
    title: "Genetic Analysis",
    description: "AI-driven genetic trait analysis for breeding optimization",
    icon: Dna,
    status: "active",
    lastUsed: "1 week ago",
    features: [
      "Genetic trait prediction",
      "Breeding recommendations",
      "Health risk assessment",
      "Performance forecasting",
    ],
    usageCount: 64,
    accuracy: 97.2,
    color: "orange",
  },
  {
    id: "predictive-health",
    title: "Predictive Health",
    description: "Predict potential health issues before they become serious",
    icon: Brain,
    status: "active",
    lastUsed: "3 days ago",
    features: [
      "Early warning system",
      "Health trend analysis",
      "Risk assessment",
      "Preventive care suggestions",
    ],
    usageCount: 512,
    accuracy: 94.1,
    color: "red",
  },
  {
    id: "feed-optimization",
    title: "Feed Optimization",
    description: "AI recommendations for optimal feed mixtures and schedules",
    icon: Sparkles,
    status: "active",
    lastUsed: "12 hours ago",
    features: [
      "Custom feed formulation",
      "Cost optimization",
      "Nutrition analysis",
      "Consumption tracking",
    ],
    usageCount: 384,
    accuracy: 96.3,
    color: "yellow",
  },
];

const AIToolsPage = () => {
  const [tools, setTools] = useState<AITool[]>(defaultTools);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTool, setSelectedTool] = useState<AITool | null>(null);
  const [isToolDialogOpen, setIsToolDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);

  const filteredTools = tools.filter(
    (tool) =>
      tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleToolLaunch = (tool: AITool) => {
    setSelectedTool(tool);
    setIsToolDialogOpen(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleProcessing = async () => {
    if (!selectedTool || !uploadedFile) return;

    setIsProcessing(true);
    setProcessingProgress(0);

    // Simulate processing with progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setProcessingProgress(i);
    }

    setIsProcessing(false);
    setProcessingProgress(0);
    setUploadedFile(null);
    setIsToolDialogOpen(false);

    // Update tool status and usage count
    setTools((prev) =>
      prev.map((tool) =>
        tool.id === selectedTool.id
          ? { ...tool, lastUsed: "just now", usageCount: tool.usageCount + 1 }
          : tool,
      ),
    );
  };

  const getStatusColor = (status: AIToolStatus) => {
    switch (status) {
      case "active":
        return "bg-green-50 text-green-700 border-green-200";
      case "processing":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "error":
        return "bg-red-50 text-red-700 border-red-200";
    }
  };

  const getToolColor = (color: string) => {
    const colors = {
      blue: "bg-blue-500/10 text-blue-600",
      purple: "bg-purple-500/10 text-purple-600",
      green: "bg-green-500/10 text-green-600",
      orange: "bg-orange-500/10 text-orange-600",
      red: "bg-red-500/10 text-red-600",
      yellow: "bg-yellow-500/10 text-yellow-600",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">AI Tools</h1>
          <p className="text-gray-500">
            Advanced AI solutions for livestock management
          </p>
        </div>
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search AI tools..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card
              key={tool.id}
              className={`group relative p-6 hover:shadow-lg transition-all cursor-pointer overflow-hidden`}
              onClick={() => handleToolLaunch(tool)}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-black/5 to-transparent transition-opacity" />

              <div className="flex items-start justify-between">
                <div
                  className={`h-12 w-12 rounded-lg ${getToolColor(tool.color || "blue")} flex items-center justify-center`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <Badge
                  variant="outline"
                  className={getStatusColor(tool.status)}
                >
                  {tool.status}
                </Badge>
              </div>

              <h3 className="text-lg font-semibold mt-4">{tool.title}</h3>
              <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                {tool.description}
              </p>

              <div className="mt-4 space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Accuracy</span>
                    <span className="font-medium">{tool.accuracy}%</span>
                  </div>
                  <Progress value={tool.accuracy} className="h-1.5" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Usage Count</span>
                  <span className="font-medium">{tool.usageCount}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Last used: {tool.lastUsed}
                </span>
                <Button
                  size="sm"
                  className="gap-2 group-hover:translate-x-1 transition-transform"
                >
                  Launch <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={isToolDialogOpen} onOpenChange={setIsToolDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedTool && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div
                    className={`h-8 w-8 rounded-lg ${getToolColor(selectedTool.color || "blue")} flex items-center justify-center`}
                  >
                    <selectedTool.icon className="w-5 h-5" />
                  </div>
                  {selectedTool.title}
                </DialogTitle>
                <DialogDescription>
                  {selectedTool.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-base font-semibold">
                    Key Features
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedTool.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg"
                      >
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">
                      Upload Data
                    </Label>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Info className="w-4 h-4" />
                      Supports images and videos
                    </div>
                  </div>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors">
                    <input
                      type="file"
                      className="hidden"
                      id="file-upload"
                      onChange={handleFileUpload}
                      accept="image/*,video/*"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center gap-3"
                    >
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Upload className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {uploadedFile
                            ? uploadedFile.name
                            : "Click to upload or drag and drop"}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Maximum file size: 50MB
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Processing...</span>
                      <span>{processingProgress}%</span>
                    </div>
                    <Progress value={processingProgress} className="h-2" />
                  </div>
                )}

                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsToolDialogOpen(false)}
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleProcessing}
                    disabled={!uploadedFile || isProcessing}
                    className="gap-2 min-w-[100px]"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing
                      </>
                    ) : (
                      <>
                        Process <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIToolsPage;
