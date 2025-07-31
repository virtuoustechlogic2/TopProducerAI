import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import DailySchedule from "@/components/DailySchedule";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  Target,
  CheckCircle2,
  Phone,
  Users,
  TrendingUp,
  Filter,
  Search,
  CalendarDays
} from "lucide-react";
import { format } from "date-fns";

interface Task {
  id: number;
  title: string;
  description: string;
  category: string;
  scheduledTime: string;
  isCompleted: boolean;
  targetCount?: number;
  currentProgress?: number;
  date: string;
  priority: string;
}

const categories = [
  { value: "lead_generation", label: "Lead Generation", icon: Phone, color: "bg-primary/10 text-primary border-primary/20" },
  { value: "relationship_building", label: "Relationship Building", icon: Users, color: "bg-secondary/10 text-secondary border-secondary/20" },
  { value: "marketing", label: "Marketing", icon: TrendingUp, color: "bg-accent/10 text-accent border-accent/20" },
  { value: "administrative", label: "Administrative", icon: CheckCircle2, color: "bg-neutral-100 text-neutral-600 border-neutral-200" },
];

const priorities = [
  { value: "high", label: "High", color: "bg-red-100 text-red-700 border-red-200" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { value: "low", label: "Low", color: "bg-green-100 text-green-700 border-green-200" },
];

export default function Tasks() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAddTask, setShowAddTask] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    category: "lead_generation",
    scheduledTime: "",
    targetCount: "",
    priority: "medium"
  });

  const dateString = format(selectedDate, 'yyyy-MM-dd');

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks', { date: dateString }],
    retry: false,
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      return await apiRequest('POST', '/api/tasks', taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      setShowAddTask(false);
      setNewTask({
        title: "",
        description: "",
        category: "lead_generation",
        scheduledTime: "",
        targetCount: "",
        priority: "medium"
      });
      toast({
        title: "Task Created",
        description: "Your new task has been added to your schedule.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Task> }) => {
      return await apiRequest('PATCH', `/api/tasks/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
    },
  });

  const handleCreateTask = () => {
    if (!newTask.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Task title is required.",
        variant: "destructive",
      });
      return;
    }

    createTaskMutation.mutate({
      ...newTask,
      date: dateString,
      targetCount: newTask.targetCount ? parseInt(newTask.targetCount) : null,
    });
  };

  const handleTaskToggle = (task: Task) => {
    updateTaskMutation.mutate({
      id: task.id,
      updates: { 
        isCompleted: !task.isCompleted
      }
    });

    if (!task.isCompleted) {
      toast({
        title: "Task Completed!",
        description: `Great job completing "${task.title}"`,
      });
    }
  };

  const getCategoryData = (categoryValue: string) => {
    return categories.find(cat => cat.value === categoryValue) || categories[0];
  };

  const getPriorityData = (priorityValue: string) => {
    return priorities.find(p => p.value === priorityValue) || priorities[1];
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || task.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const completedTasks = filteredTasks.filter(task => task.isCompleted);
  const incompleteTasks = filteredTasks.filter(task => !task.isCompleted);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Task Management</h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">
              Stay on track with your daily real estate activities
            </p>
          </div>
          <Button 
            onClick={() => setShowAddTask(true)}
            className="gradient-primary text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Tabs for Schedule vs Custom Tasks */}
        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Daily Schedule
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Custom Tasks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="mt-6">
            <DailySchedule />
          </TabsContent>

          <TabsContent value="custom" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Calendar & Controls */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Date</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Search Tasks</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input
                      placeholder="Search tasks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Today's Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-600">Completed</span>
                    <span className="font-medium">{completedTasks.length}/{filteredTasks.length}</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div 
                      className="gradient-success h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${filteredTasks.length > 0 ? (completedTasks.length / filteredTasks.length) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tasks List */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    Tasks for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </span>
                  <Badge variant="outline" className="ml-2">
                    {filteredTasks.length} tasks
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-neutral-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">No tasks found</h3>
                    <p className="text-neutral-500 mb-4">
                      {tasks.length === 0 
                        ? "No tasks scheduled for this date." 
                        : "No tasks match your current filters."
                      }
                    </p>
                    <Button onClick={() => setShowAddTask(true)} variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Task
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Incomplete Tasks */}
                    {incompleteTasks.length > 0 && (
                      <div>
                        <h4 className="font-medium text-neutral-900 mb-3 flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          Pending Tasks ({incompleteTasks.length})
                        </h4>
                        <div className="space-y-3">
                          {incompleteTasks.map((task) => {
                            const categoryData = getCategoryData(task.category);
                            const priorityData = getPriorityData(task.priority);
                            const CategoryIcon = categoryData.icon;

                            return (
                              <div 
                                key={task.id}
                                className="flex items-start space-x-4 p-4 bg-white rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors"
                              >
                                <div className="flex-shrink-0 mt-1">
                                  <Checkbox 
                                    checked={task.isCompleted}
                                    onCheckedChange={() => handleTaskToggle(task)}
                                    disabled={updateTaskMutation.isPending}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h3 className="text-sm font-medium text-neutral-900">
                                        {task.title}
                                      </h3>
                                      <p className="text-sm text-neutral-600 mt-1">
                                        {task.description}
                                      </p>
                                    </div>
                                    <div className="flex items-center space-x-2 ml-4">
                                      <Badge variant="outline" className={priorityData.color}>
                                        {priorityData.label}
                                      </Badge>
                                      {task.scheduledTime && (
                                        <Badge variant="outline" className="text-neutral-600">
                                          <Clock className="h-3 w-3 mr-1" />
                                          {task.scheduledTime}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center mt-3 space-x-4">
                                    <Badge variant="outline" className={`${categoryData.color} flex items-center space-x-1`}>
                                      <CategoryIcon className="h-3 w-3" />
                                      <span>{categoryData.label}</span>
                                    </Badge>
                                    {task.targetCount && (
                                      <span className="text-xs text-neutral-500">
                                        Target: {task.targetCount} | Progress: {task.currentProgress || 0}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Completed Tasks */}
                    {completedTasks.length > 0 && (
                      <div>
                        <h4 className="font-medium text-neutral-900 mb-3 flex items-center">
                          <CheckCircle2 className="h-4 w-4 mr-2 text-secondary" />
                          Completed Tasks ({completedTasks.length})
                        </h4>
                        <div className="space-y-3">
                          {completedTasks.map((task) => {
                            const categoryData = getCategoryData(task.category);
                            const CategoryIcon = categoryData.icon;

                            return (
                              <div 
                                key={task.id}
                                className="flex items-start space-x-4 p-4 bg-secondary/5 rounded-lg border border-secondary/20"
                              >
                                <div className="flex-shrink-0 mt-1">
                                  <Checkbox 
                                    checked={task.isCompleted}
                                    onCheckedChange={() => handleTaskToggle(task)}
                                    disabled={updateTaskMutation.isPending}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h3 className="text-sm font-medium text-neutral-900 line-through">
                                        {task.title}
                                      </h3>
                                      <p className="text-sm text-neutral-600 mt-1 line-through">
                                        {task.description}
                                      </p>
                                    </div>
                                    {task.scheduledTime && (
                                      <Badge variant="outline" className="text-neutral-500 ml-4">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {task.scheduledTime}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center mt-3 space-x-4">
                                    <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20 flex items-center space-x-1">
                                      <CheckCircle2 className="h-3 w-3" />
                                      <span>Completed</span>
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Add Task Modal */}
        {showAddTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md slide-up">
            <CardHeader>
              <CardTitle>Add New Task</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Task Title</label>
                <Input
                  placeholder="Enter task title..."
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  placeholder="Task description..."
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select 
                    value={newTask.category} 
                    onValueChange={(value) => setNewTask(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Priority</label>
                  <Select 
                    value={newTask.priority} 
                    onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Scheduled Time</label>
                  <Input
                    type="time"
                    value={newTask.scheduledTime}
                    onChange={(e) => setNewTask(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Target Count</label>
                  <Input
                    type="number"
                    placeholder="50"
                    value={newTask.targetCount}
                    onChange={(e) => setNewTask(prev => ({ ...prev, targetCount: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddTask(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateTask}
                  disabled={createTaskMutation.isPending}
                  className="flex-1 gradient-primary text-white"
                >
                  {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
