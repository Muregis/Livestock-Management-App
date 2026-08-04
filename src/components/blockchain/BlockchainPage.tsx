import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
  Search,
  QrCode,
  Link,
  History,
  ArrowRight,
  CheckCircle2,
  Beef,
  Truck,
  Package,
  Activity,
  Info,
  ExternalLink,
  Copy,
  Loader2,
} from "lucide-react";

interface BlockchainTransaction {
  id: string;
  type: "livestock" | "feed" | "health" | "transport";
  timestamp: string;
  status: "confirmed" | "pending";
  hash: string;
  details: string;
  animalId?: string;
  location?: string;
  data?: {
    weight?: string;
    health?: string;
    destination?: string;
    quantity?: string;
  };
}

const defaultTransactions: BlockchainTransaction[] = [
  {
    id: "1",
    type: "livestock",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    status: "confirmed",
    hash: "0x1234...5678",
    details: "Cattle ID #1234 health record update",
    animalId: "CTL-1234",
    location: "Barn A",
    data: {
      weight: "750 kg",
      health: "Vaccination completed",
    },
  },
  {
    id: "2",
    type: "feed",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    status: "confirmed",
    hash: "0x5678...9012",
    details: "Feed batch #789 quality verification",
    location: "Storage Unit B",
    data: {
      quantity: "2000 kg",
    },
  },
  {
    id: "3",
    type: "transport",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    status: "pending",
    hash: "0x9012...3456",
    details: "Livestock transport record #456",
    animalId: "CTL-1234, CTL-1235",
    data: {
      destination: "Processing Facility",
    },
  },
];

interface BlockchainPageProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const BlockchainPage = ({ open, onOpenChange }: BlockchainPageProps) => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState(defaultTransactions);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("trace");
  const [isProcessing, setIsProcessing] = useState(false);
  const [traceInput, setTraceInput] = useState("");
  const [hashInput, setHashInput] = useState("");

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "livestock":
        return <Beef className="h-4 w-4" />;
      case "transport":
        return <Truck className="h-4 w-4" />;
      case "feed":
        return <Package className="h-4 w-4" />;
      case "health":
        return <Activity className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const handleTrace = async () => {
    if (!traceInput) return;
    setIsProcessing(true);

    // Simulate blockchain query
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const found = transactions.find(
      (tx) => tx.animalId === traceInput || tx.hash.includes(traceInput),
    );

    if (found) {
      toast({
        title: "Record found",
        description: `Found blockchain record for ${found.details}`,
      });
    } else {
      toast({
        title: "No record found",
        description: "No matching records found in the blockchain",
        variant: "destructive",
      });
    }

    setIsProcessing(false);
  };

  const handleVerify = async () => {
    if (!hashInput) return;
    setIsProcessing(true);

    // Simulate blockchain verification
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const found = transactions.find((tx) => tx.hash.includes(hashInput));

    if (found) {
      toast({
        title: "Hash verified",
        description: `Transaction verified: ${found.details}`,
      });
    } else {
      toast({
        title: "Verification failed",
        description: "Invalid or unknown transaction hash",
        variant: "destructive",
      });
    }

    setIsProcessing(false);
  };

  const handleScan = async () => {
    setIsProcessing(true);

    // Simulate QR scanning
    await new Promise((resolve) => setTimeout(resolve, 2000));

    toast({
      title: "QR Code Scanned",
      description: "Livestock ID CTL-1234 verified on blockchain",
    });

    setIsProcessing(false);
  };

  const filteredTransactions = transactions.filter((tx) =>
    searchTerm
      ? tx.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.animalId?.toLowerCase().includes(searchTerm.toLowerCase())
      : true,
  );

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Blockchain Traceability</h2>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search transactions..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="p-4 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start">
              <TabsTrigger value="trace" className="flex items-center gap-2">
                <Link className="w-4 h-4" /> Trace
              </TabsTrigger>
              <TabsTrigger value="scan" className="flex items-center gap-2">
                <QrCode className="w-4 h-4" /> Scan
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="w-4 h-4" /> History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trace">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Quick Trace</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter animal ID or batch number"
                      value={traceInput}
                      onChange={(e) => setTraceInput(e.target.value)}
                    />
                    <Button
                      onClick={handleTrace}
                      disabled={!traceInput || isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Trace <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Transaction Hash</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter blockchain transaction hash"
                      value={hashInput}
                      onChange={(e) => setHashInput(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      onClick={handleVerify}
                      disabled={!hashInput || isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Verify <ExternalLink className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="scan">
              <div className="flex flex-col items-center justify-center space-y-4 py-8">
                <div className="h-48 w-48 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50">
                  {isProcessing ? (
                    <Loader2 className="h-12 w-12 text-gray-400 animate-spin" />
                  ) : (
                    <QrCode className="h-24 w-24 text-gray-400" />
                  )}
                </div>
                <Button
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={handleScan}
                  disabled={isProcessing}
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  {isProcessing ? "Scanning..." : "Scan QR Code"}
                </Button>
                <p className="text-sm text-gray-500 text-center max-w-sm">
                  Point your camera at a QR code on livestock tags or feed
                  packages
                </p>
              </div>
            </TabsContent>

            <TabsContent value="history">
              {filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-4"
                >
                  <div className="space-y-3 w-full sm:w-auto">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-white`}>
                        {getTypeIcon(tx.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium">{tx.details}</h3>
                          <Badge
                            variant={
                              tx.status === "confirmed"
                                ? "success"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {tx.status === "confirmed" && (
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                            )}
                            {tx.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span>{new Date(tx.timestamp).toLocaleString()}</span>
                          <div className="flex items-center gap-1 font-mono">
                            {tx.hash}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => {
                                navigator.clipboard.writeText(tx.hash);
                                toast({
                                  description: "Hash copied to clipboard",
                                });
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {(tx.animalId || tx.location || tx.data) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pl-11">
                        {tx.animalId && (
                          <div className="p-2 bg-white rounded border">
                            <span className="text-sm font-medium">
                              Animal ID:
                            </span>
                            <p className="text-sm text-gray-600">
                              {tx.animalId}
                            </p>
                          </div>
                        )}
                        {tx.location && (
                          <div className="p-2 bg-white rounded border">
                            <span className="text-sm font-medium">
                              Location:
                            </span>
                            <p className="text-sm text-gray-600">
                              {tx.location}
                            </p>
                          </div>
                        )}
                        {tx.data &&
                          Object.entries(tx.data).map(([key, value]) => (
                            <div
                              key={key}
                              className="p-2 bg-white rounded border"
                            >
                              <span className="text-sm font-medium">
                                {key.charAt(0).toUpperCase() + key.slice(1)}:
                              </span>
                              <p className="text-sm text-gray-600">{value}</p>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </Card>
  );
};

export default BlockchainPage;
