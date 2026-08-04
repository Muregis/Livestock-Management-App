import React, { useState, useEffect, useCallback } from "react";
import { TaskService } from "@/lib/livestockService";
import type { Task, TaskPriority, TaskCategory, TaskStatusType } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Brain,
  Calendar,
  Clock,
  Plus,
  MoreVertical,
  AlertCircle,
  CheckCircle2,
  Timer,
  Beef,
  Milk,
  Stethoscope,
  Tractor,
  Search,
  Filter,
  Edit2,
  Trash2,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const TaskCategoryIconMap: Record<TaskCategory, React.ElementType> = {
  feeding: Beef,
  health: Stethoscope,
  maintenance: Tractor,
  milking: Milk,
  breeding: Beef,
};

const getCategoryIcon = (category?: Task["category"]): JSX.Element | null => {
  if (!category) return null;
  const Icon = TaskCategoryIconMap[category];
  return <Icon className="w-4 h-4" />;
};

const TaskCard = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatusType) => void;
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const getPriorityVariant = (priority: TaskPriority) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
    }
  };

  return (
    <>
      <Card
        className="group p-4 mb-3 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer relative"
        onClick={() => setIsDetailsOpen(true)}
      >
        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
              >
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.id);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex justify-between items-start mb-2 pr-8">
          <div className="flex items-center gap-2">
            {task.category && getCategoryIcon(task.category)}
            <h3 className="font-medium">{task.title}</h3>
          </div>
          <Badge variant={getPriorityVariant(task.priority)} className="text-xs">
            {task.priority}
          </Badge>
        </div>

        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
          {task.description}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{task.dueDate}</span>
          </div>
        </div>

        {task.estimatedTime && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <Clock className="w-4 h-4" />
            <span>{task.estimatedTime}</span>
          </div>
        )}
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[500px] w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {task.category && getCategoryIcon(task.category) && getCategoryIcon(task.category)!}
              {task.title}
            </DialogTitle>
            <DialogDescription>{task.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant={getPriorityVariant(task.priority)}>
                {task.priority} Priority
              </Badge>

              <Select
                defaultValue={task.status}
                onValueChange={(value: TaskStatusType) => {
                  onStatusChange(task.id, value);
                  setIsDetailsOpen(false);
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium">Due Date</div>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> {task.dueDate}
                </div>
              </div>
              {task.estimatedTime && (
                <div className="space-y-1">
                  <div className="text-sm font-medium">Estimated Time</div>
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> {task.estimatedTime}
                  </div>
                </div>
              )}
            </div>

            {task.location && (
              <div className="space-y-1">
                <div className="text-sm font-medium">Location</div>
                <div className="text-sm text-gray-500">{task.location}</div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const TaskColumn = ({
  title,
  tasks,
  status,
  icon: Icon,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  title: string;
  tasks: Task[];
  status: string;
  icon: React.ElementType;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatusType) => void;
}) => (
  <div className="h-full">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-gray-500" />
        <h2 className="font-semibold text-gray-700">{title}</h2>
      </div>
      <Badge variant="secondary">{tasks.length}</Badge>
    </div>
    <ScrollArea className="h-[calc(100vh-280px)] pr-4">
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    </ScrollArea>
  </div>
);

const TaskManagementBoard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<TaskCategory | "all">("all");
  const [filterPriority, setFilterPriority] = useState<TaskPriority | "all">("all");
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await TaskService.getAll();
        setTasks(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tasks");
      } finally {
        setIsLoading(false);
      }
    };
    loadTasks();
  }, []);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || task.category === filterCategory;
    const matchesPriority =
      filterPriority === "all" || task.priority === filterPriority;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const todoTasks = filteredTasks.filter((task) => task.status === "todo");
  const inProgressTasks = filteredTasks.filter((task) => task.status === "in-progress");
  const doneTasks = filteredTasks.filter((task) => task.status === "done");

  const handleStatusChange = useCallback(
    (taskId: string, newStatus: TaskStatusType) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task,
        ),
      );
    },
    [],
  );

  const handleDeleteTask = useCallback((taskId: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    }
  }, []);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setIsAddTaskOpen(true);
  }, []);

  const handleAddOrUpdateTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const newTask: Omit<Task, "id"> = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      status: "todo",
      priority: formData.get("priority") as TaskPriority,
      category: formData.get("category") as TaskCategory,
      dueDate: formData.get("dueDate") as string,
      location: formData.get("location") as string,
      estimatedTime: (formData.get("estimatedTime") as string) || undefined,
    };

    if (editingTask) {
      const updated = { ...editingTask, ...newTask };
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === editingTask.id ? updated : task)),
      );
    } else {
      const taskWithId: Task = {
        ...newTask,
        id: Date.now().toString(),
      };
      setTasks((prevTasks) => [...prevTasks, taskWithId]);
    }

    setIsAddTaskOpen(false);
    setEditingTask(null);
  };

  if (isLoading) {
    return (
      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading tasks...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4 sm:p-6">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-500">Manage and track farm tasks</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            className="flex items-center gap-2 flex-1 sm:flex-none"
            onClick={() => setIsAddTaskOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add Task
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search tasks..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          value={filterCategory}
          onValueChange={(v) => setFilterCategory(v as TaskCategory | "all")}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="feeding">Feeding</SelectItem>
            <SelectItem value="health">Health</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="milking">Milking</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filterPriority}
          onValueChange={(v) => setFilterPriority(v as TaskPriority | "all")}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
          <TaskColumn
            title="To Do"
            tasks={todoTasks}
            status="todo"
            icon={AlertCircle}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
          />
        </div>
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
          <TaskColumn
            title="In Progress"
            tasks={inProgressTasks}
            status="in-progress"
            icon={Timer}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
          />
        </div>
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
          <TaskColumn
            title="Done"
            tasks={doneTasks}
            status="done"
            icon={CheckCircle2}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>

      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingTask ? "Edit Task" : "Add New Task"}
            </DialogTitle>
            <DialogDescription>
              {editingTask
                ? "Update the task details below"
                : "Fill in the task details below"}
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4 flex-1 flex flex-col" onSubmit={handleAddOrUpdateTask}>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Enter task title"
                defaultValue={editingTask?.title}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter task description"
                defaultValue={editingTask?.description}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  name="category"
                  defaultValue={editingTask?.category || "feeding"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feeding">Feeding</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="milking">Milking</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  name="priority"
                  defaultValue={editingTask?.priority || "medium"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  defaultValue={editingTask?.dueDate}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedTime">Estimated Time</Label>
                <Input
                  id="estimatedTime"
                  name="estimatedTime"
                  placeholder="e.g., 2 hours"
                  defaultValue={editingTask?.estimatedTime}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                placeholder="Enter location"
                defaultValue={editingTask?.location}
                required
              />
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setIsAddTaskOpen(false);
                  setEditingTask(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingTask ? "Update" : "Create"} Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TaskManagementBoard;