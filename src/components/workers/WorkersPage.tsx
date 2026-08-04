import React, { useState, useEffect } from "react";
import { WorkerService } from "@/lib/livestockService";
import type { Worker, WorkerRole, WorkerStatus } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  MoreVertical,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  Edit2,
  Trash2,
  Filter,
} from "lucide-react";

type FilterRole = "all" | "Veterinarian" | "Farm Hand" | "Milking Specialist" | "Maintenance" | "Manager";
type FilterStatus = "all" | "Active" | "On Leave" | "Off Duty";

const WorkersPage = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<FilterRole>("all");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const loadWorkers = async () => {
      try {
        const data = await WorkerService.getAll();
        setWorkers(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load workers");
      } finally {
        setIsLoading(false);
      }
    };
    loadWorkers();
  }, []);

  const getWorkerStatus = (worker: Worker): WorkerStatus => {
    if (!worker.status) return "Active";
    return worker.status as WorkerStatus;
  };

  const getFilteredWorkers = () => {
    return workers.filter((worker) => {
      const matchesSearch =
        worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (worker.email || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === "all" || worker.role === filterRole;
      const matchesStatus = filterStatus === "all" || getWorkerStatus(worker) === filterStatus;
      return matchesSearch && matchesRole && matchesStatus;
    });
  };

  const handleAddWorker = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const newWorker: Omit<Worker, "id"> = {
      name: formData.get("name") as string,
      role: formData.get("role") as WorkerRole,
      status: "Active" as WorkerStatus,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      location: formData.get("location") as string,
      startDate: formData.get("startDate") as string,
      specialization: formData.get("specialization") as string | undefined,
    };

    setWorkers((prev) => [...prev, { ...newWorker, id: Date.now().toString() }]);
    setIsAddWorkerOpen(false);
  };

  const handleDeleteWorker = (workerId: string) => {
    if (window.confirm("Are you sure you want to remove this worker?")) {
      setWorkers((prev) => prev.filter((w) => w.id !== workerId));
    }
  };

  const getStatusColor = (status: WorkerStatus) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200";
      case "On Leave":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Off Duty":
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredWorkers = getFilteredWorkers();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading workers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-4">
          <p className="text-red-600 mb-2">Error: {error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  const workerRoles: FilterRole[] = ["Veterinarian", "Farm Hand", "Milking Specialist", "Maintenance", "Manager"];
  const workerStatuses: FilterStatus[] = ["Active", "On Leave", "Off Duty"];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Workers Management
          </h1>
          <p className="text-gray-500">Manage and track farm workers</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            className="flex items-center gap-2 flex-1 sm:flex-none"
            onClick={() => setIsFilterOpen(true)}
          >
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Button
            className="flex items-center gap-2 flex-1 sm:flex-none"
            onClick={() => setIsAddWorkerOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add Worker
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search workers..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <ScrollArea className="h-[calc(100vh-280px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkers.map((worker) => (
            <Card key={worker.id} className="p-4">
              <div className="flex justify-between">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={worker.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${worker.name}`} />
                    <AvatarFallback>{worker.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{worker.name}</h3>
                    <p className="text-sm text-gray-500">{worker.role}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedWorker(worker);
                        setIsDetailsOpen(true);
                      }}
                    >
                      <Edit2 className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDeleteWorker(worker.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-4 space-y-2">
                <Badge
                  variant="outline"
                  className={`${getStatusColor(getWorkerStatus(worker))}`}
                >
                  {getWorkerStatus(worker)}
                </Badge>

                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Mail className="h-4 w-4" />
                    <span>{worker.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Phone className="h-4 w-4" />
                    <span>{worker.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <MapPin className="h-4 w-4" />
                    <span>{worker.location}</span>
                  </div>
                </div>

                {worker.currentTasks !== undefined && (
                  <div className="mt-3 pt-3 border-t">
                    <span className="text-sm text-gray-500">
                      {worker.currentTasks} Active Tasks
                    </span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <Dialog open={isAddWorkerOpen} onOpenChange={setIsAddWorkerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Worker</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddWorker} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select name="role" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {workerRoles.filter(r => r !== "all").map((role) => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" name="startDate" type="date" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" type="tel" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Work Location</Label>
              <Input id="location" name="location" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Input id="specialization" name="specialization" />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddWorkerOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Worker</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Worker Details</DialogTitle>
          </DialogHeader>
          {selectedWorker && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedWorker.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedWorker.name}`} />
                  <AvatarFallback>{selectedWorker.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedWorker.name}
                  </h3>
                  <p className="text-gray-500">{selectedWorker.role}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Status</Label>
                  <Badge
                    variant="outline"
                    className={getStatusColor(getWorkerStatus(selectedWorker))}
                  >
                    {getWorkerStatus(selectedWorker)}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <Label>Start Date</Label>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{selectedWorker.startDate}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Label>Contact Information</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Mail className="h-4 w-4" />
                    <span>{selectedWorker.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Phone className="h-4 w-4" />
                    <span>{selectedWorker.phone}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Label>Work Details</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedWorker.location}</span>
                  </div>
                  {selectedWorker.specialization && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Briefcase className="h-4 w-4" />
                      <span>{selectedWorker.specialization}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailsOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Workers</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={filterRole}
                onValueChange={(value) => setFilterRole(value as FilterRole)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {workerRoles.filter(r => r !== "all").map((role) => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filterStatus}
                onValueChange={(value) => setFilterStatus(value as FilterStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {workerStatuses.filter(s => s !== "all").map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setFilterRole("all");
                  setFilterStatus("all");
                  setIsFilterOpen(false);
                }}
              >
                Reset
              </Button>
              <Button onClick={() => setIsFilterOpen(false)}>
                Apply Filters
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkersPage;