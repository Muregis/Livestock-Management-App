import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Filter,
  Printer,
  FileText,
  Calendar,
  MoreVertical,
  Search,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ReportType =
  | "Production"
  | "Health"
  | "Inventory"
  | "Breeding"
  | "Maintenance"
  | "Compliance";
type ReportStatus = "Completed" | "Processing";

interface Report {
  id: number;
  title: string;
  date: string;
  type: ReportType;
  status: ReportStatus;
  description: string;
}

const initialReports: Report[] = [
  {
    id: 1,
    title: "Monthly Milk Production Report",
    date: "2024-02-01",
    type: "Production",
    status: "Completed",
    description: "Detailed analysis of milk yield and quality metrics",
  },
  {
    id: 2,
    title: "Cattle Health Assessment",
    date: "2024-02-15",
    type: "Health",
    status: "Processing",
    description: "Comprehensive health check results for all cattle",
  },
  {
    id: 3,
    title: "Feed Consumption Analysis",
    date: "2024-02-28",
    type: "Inventory",
    status: "Completed",
    description: "Monthly feed usage and nutrition optimization report",
  },
  {
    id: 4,
    title: "Breeding Program Status",
    date: "2024-03-01",
    type: "Breeding",
    status: "Completed",
    description: "Current status of breeding program and genetic improvements",
  },
  {
    id: 5,
    title: "Dairy Equipment Maintenance",
    date: "2024-03-05",
    type: "Maintenance",
    status: "Processing",
    description: "Maintenance logs for milking and dairy processing equipment",
  },
  {
    id: 6,
    title: "Veterinary Visit Summary",
    date: "2024-03-10",
    type: "Health",
    status: "Completed",
    description:
      "Documentation of recent veterinary examinations and treatments",
  },
  {
    id: 7,
    title: "Quality Assurance Audit",
    date: "2024-03-15",
    type: "Compliance",
    status: "Completed",
    description: "Results from monthly dairy quality and safety inspections",
  },
];

const ReportsPage = () => {
  const [reports] = useState<Report[]>(initialReports);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<ReportType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<ReportStatus | "all">("all");
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

  // Filter reports based on search term and filters
  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType =
      filterType === "all" ? true : report.type === filterType;
    const matchesStatus =
      filterStatus === "all" ? true : report.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDownload = (report: Report) => {
    console.log(`Downloading report: ${report.title}`);
    alert(`Downloading ${report.title}...`);
  };

  const handlePrint = (report: Report) => {
    console.log(`Printing report: ${report.title}`);
    alert(`Printing ${report.title}...`);
  };

  const handleExportAll = () => {
    console.log("Exporting all reports");
    alert("Exporting all reports...");
  };

  const clearFilters = () => {
    setFilterType("all");
    setFilterStatus("all");
    setSearchTerm("");
    setIsFilterDialogOpen(false);
  };

  const reportTypes = Array.from(
    new Set(reports.map((report) => report.type)),
  ).sort() as ReportType[];

  const reportStatuses = Array.from(
    new Set(reports.map((report) => report.status)),
  ).sort() as ReportStatus[];

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 flex-shrink-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Reports Archive</h1>
          <p className="text-sm md:text-base text-gray-500">
            Access and download detailed cattle management reports
          </p>
        </div>

        {/* Search input */}
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setIsFilterDialogOpen(true)}
          >
            <Filter className="w-4 h-4" /> Filter
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleExportAll}
          >
            <Download className="w-4 h-4" /> Export All
          </Button>
        </div>

        {/* Mobile actions */}
        <div className="md:hidden flex gap-2">
          <Button
            variant="outline"
            className="flex-1 h-9"
            onClick={() => setIsFilterDialogOpen(true)}
          >
            <Filter className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-9"
            onClick={handleExportAll}
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Active filters */}
      {(filterType !== "all" || filterStatus !== "all") && (
        <div className="flex gap-2 flex-wrap">
          {filterType !== "all" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Type: {filterType}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setFilterType("all")}
              />
            </Badge>
          )}
          {filterStatus !== "all" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Status: {filterStatus}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setFilterStatus("all")}
              />
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={clearFilters}
          >
            Clear all
          </Button>
        </div>
      )}

      <Card className="flex-1 flex flex-col min-h-0 p-4">
        <h3 className="text-lg font-semibold mb-4 flex-shrink-0">
          Available Reports{" "}
          {filteredReports.length > 0 && `(${filteredReports.length})`}
        </h3>
        <ScrollArea className="flex-1">
          <div className="space-y-3 pr-4">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-3"
              >
                <div className="flex items-start gap-3">
                  <FileText className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-sm md:text-base truncate">
                      {report.title}
                    </h4>
                    <p className="text-xs md:text-sm text-gray-600 mt-1 line-clamp-2">
                      {report.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                      <Calendar className="w-3 h-3" />
                      <span>{report.date}</span>
                    </div>
                  </div>
                </div>

                {/* Desktop badges and actions */}
                <div className="hidden md:flex items-center gap-4 flex-shrink-0">
                  <Badge variant="outline">{report.type}</Badge>
                  <Badge
                    variant={
                      report.status === "Completed" ? "success" : "secondary"
                    }
                  >
                    {report.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDownload(report)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>

                {/* Mobile badges and actions */}
                <div className="flex md:hidden items-center justify-between">
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs px-2 h-5">
                      {report.type}
                    </Badge>
                    <Badge
                      variant={
                        report.status === "Completed" ? "success" : "secondary"
                      }
                      className="text-xs px-2 h-5"
                    >
                      {report.status}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDownload(report)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePrint(report)}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Filter Dialog */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Reports</DialogTitle>
            <DialogDescription>
              Select criteria to filter the reports list
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select
                value={filterType}
                onValueChange={(value) =>
                  setFilterType(value as ReportType | "all")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {reportTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filterStatus}
                onValueChange={(value) =>
                  setFilterStatus(value as ReportStatus | "all")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {reportStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={clearFilters}>
                Reset
              </Button>
              <Button onClick={() => setIsFilterDialogOpen(false)}>
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportsPage;
