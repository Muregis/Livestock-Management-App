import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

type WorkerRole =
  | "Veterinarian"
  | "Farm Hand"
  | "Milking Specialist"
  | "Maintenance"
  | "Manager";
type WorkerStatus = "Active" | "On Leave" | "Off Duty";

interface Worker {
  id: string;
  name: string;
  role: WorkerRole;
  status: WorkerStatus;
  avatar: string;
  phone: string;
  email: string;
  location: string;
  startDate: string;
  specialization?: string;
  currentTasks?: number;
  bio?: string;
}

const defaultWorkers: Worker[] = [
  {
    id: "1",
    name: "Dr. Sarah Miller",
    role: "Veterinarian",
    status: "Active",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    phone: "+1 (555) 123-4567",
    email: "sarah.miller@farm.com",
    location: "Main Clinic",
    startDate: "2023-01-15",
    specialization: "Large Animal Medicine",
    currentTasks: 3,
    bio: "Experienced veterinarian specializing in dairy cattle health and reproductive management.",
  },
  {
    id: "2",
    name: "Mike Johnson",
    role: "Milking Specialist",
    status: "Active",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
    phone: "+1 (555) 234-5678",
    email: "mike.j@farm.com",
    location: "Milking Parlor A",
    startDate: "2023-03-20",
    currentTasks: 2,
    bio: "Expert in modern milking techniques and dairy hygiene protocols.",
  },
  {
    id: "3",
    name: "Emma Davis",
    role: "Farm Hand",
    status: "On Leave",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma",
    phone: "+1 (555) 345-6789",
    email: "emma.d@farm.com",
    location: "Field Operations",
    startDate: "2023-06-10",
    currentTasks: 0,
  },
];

const WorkersPage = () => {
  const [workers, setWorkers] = useState<Worker[]>(defaultWorkers);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<WorkerRole | "all">("all");
  const [filterStatus, setFilterStatus] = useState<WorkerStatus | "all">("all");
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredWorkers = workers.filter((worker) => {
    const matchesSearch =
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || worker.role === filterRole;
    const matchesStatus =
      filterStatus === "all" || worker.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddWorker = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const newWorker: Worker = {
      id: Date.now().toString(),
      name: formData.get("name") as string,
      role: formData.get("role") as WorkerRole,
      status: "Active",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      location: formData.get("location") as string,
      startDate: formData.get("startDate") as string,
      specialization: formData.get("specialization") as string,
      bio: formData.get("bio") as string,
      currentTasks: 0,
    };

    setWorkers((prev) => [...prev, newWorker]);
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
                    <AvatarImage src={worker.avatar} />
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
                  className={`${getStatusColor(worker.status)}`}
                >
                  {worker.status}
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

      {/* Add Worker Dialog */}
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
                    <SelectItem value="Veterinarian">Veterinarian</SelectItem>
                    <SelectItem value="Farm Hand">Farm Hand</SelectItem>
                    <SelectItem value="Milking Specialist">
                      Milking Specialist
                    </SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
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

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" name="bio" />
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

      {/* Worker Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Worker Details</DialogTitle>
          </DialogHeader>
          {selectedWorker && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedWorker.avatar} />
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
                    className={getStatusColor(selectedWorker.status)}
                  >
                    {selectedWorker.status}
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

              {selectedWorker.bio && (
                <div className="space-y-1">
                  <Label>Bio</Label>
                  <p className="text-gray-600">{selectedWorker.bio}</p>
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
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
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
                onValueChange={(value) =>
                  setFilterRole(value as WorkerRole | "all")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="Veterinarian">Veterinarian</SelectItem>
                  <SelectItem value="Farm Hand">Farm Hand</SelectItem>
                  <SelectItem value="Milking Specialist">
                    Milking Specialist
                  </SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filterStatus}
                onValueChange={(value) =>
                  setFilterStatus(value as WorkerStatus | "all")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
                  <SelectItem value="Off Duty">Off Duty</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setFilterRole("all");
                  setFilterStatus("all");
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
