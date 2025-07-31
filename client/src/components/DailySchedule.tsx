import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { 
  Bell, 
  Phone, 
  Users, 
  TrendingUp, 
  CheckCircle2,
  Clock,
  Target,
  Share2,
  MessageSquare,
  Calendar,
  Plus,
  X
} from "lucide-react";
import { format } from "date-fns";
import { isUnauthorizedError } from "@/lib/authUtils";
import PerformanceModal from "./PerformanceModal";

interface ScheduleTask {
  id: string;
  title: string;
  description: string;
  time: string;
  category: string;
  targetCount?: number;
  isCompleted: boolean;
  priority: string;
  icon: any;
}

// Predefined weekday schedule based on attached PDF schedule
const weekdaySchedule: Omit<ScheduleTask, 'id' | 'isCompleted'>[] = [
  {
    title: "Breakfast & Email Check",
    description: "Check and respond to emails",
    time: "7:00 AM",
    category: "administrative",
    priority: "high",
    icon: MessageSquare
  },
  {
    title: "MLS Research",
    description: "Research MLS in farm area",
    time: "7:30 AM",
    category: "administrative",
    priority: "high",
    icon: TrendingUp
  },
  {
    title: "Social Media Post",
    description: "Create and publish daily social media content",
    time: "8:00 AM",
    category: "marketing",
    targetCount: 1,
    priority: "high",
    icon: Share2
  },
  {
    title: "Quick Communications",
    description: "Quick text message and email responses",
    time: "8:30 AM",
    category: "administrative",
    priority: "medium",
    icon: MessageSquare
  },
  {
    title: "Cold Calling / Prospecting",
    description: "Make 10 cold calls - Target: 1 quality contact",
    time: "9:00 AM",
    category: "lead_generation",
    targetCount: 10,
    priority: "high",
    icon: Phone
  },
  {
    title: "Cold Calling / Prospecting",
    description: "Make 10 cold calls - Target: 1 quality contact",
    time: "9:30 AM",
    category: "lead_generation",
    targetCount: 10,
    priority: "high",
    icon: Phone
  },
  {
    title: "Cold Calling / Prospecting", 
    description: "Make 10 cold calls - Target: 1 quality contact",
    time: "10:00 AM",
    category: "lead_generation",
    targetCount: 10,
    priority: "high",
    icon: Phone
  },
  {
    title: "Cold Calling / Prospecting",
    description: "Make 10 cold calls - Target: 1 quality contact",
    time: "10:30 AM",
    category: "lead_generation",
    targetCount: 10,
    priority: "high",
    icon: Phone
  },
  {
    title: "Cold Calling / Prospecting",
    description: "Make 10 cold calls - Target: 1 quality contact",
    time: "11:00 AM",
    category: "lead_generation",
    targetCount: 10,
    priority: "high",
    icon: Phone
  },
  {
    title: "Cold Calling / Prospecting",
    description: "Make 10 cold calls - Target: 1 quality contact",
    time: "11:30 AM",
    category: "lead_generation",
    targetCount: 10,
    priority: "high",
    icon: Phone
  },
  {
    title: "Lunch & Prospecting",
    description: "Make 2 calls during lunch - Target: 2 contacts",
    time: "12:00 PM",
    category: "lead_generation",
    targetCount: 2,
    priority: "medium",
    icon: Phone
  },
  {
    title: "Lunch & Prospecting",
    description: "Make 2 calls during lunch - Target: 2 contacts",
    time: "12:30 PM",
    category: "lead_generation",
    targetCount: 2,
    priority: "medium",
    icon: Phone
  },
  {
    title: "View New Listings",
    description: "Visit 1 new listing, take photos and notes",
    time: "1:00 PM",
    category: "administrative",
    targetCount: 1,
    priority: "high",
    icon: TrendingUp
  },
  {
    title: "View New Listings",
    description: "Continue visiting listings, document property details",
    time: "1:30 PM",
    category: "administrative",
    targetCount: 1,
    priority: "high",
    icon: TrendingUp
  },
  {
    title: "View New Listings",
    description: "Complete listing visits, update CRM with details",
    time: "2:00 PM",
    category: "administrative",
    targetCount: 1,
    priority: "high",
    icon: TrendingUp
  },
  {
    title: "Social Media Activity",
    description: "Engage with 25 posts, comment on 10 - Target: 3-5 new connections",
    time: "3:00 PM",
    category: "marketing",
    targetCount: 25,
    priority: "medium",
    icon: Share2
  },
  {
    title: "Social Media Activity",
    description: "Continue engagement, respond to comments",
    time: "3:30 PM",
    category: "marketing",
    targetCount: 15,
    priority: "medium",
    icon: Share2
  },
  {
    title: "Dinner & Prospecting",
    description: "Network during dinner - Target: 2 quality contacts",
    time: "5:30 PM",
    category: "relationship_building",
    targetCount: 2,
    priority: "medium",
    icon: Users
  },
  {
    title: "Dinner & Prospecting",
    description: "Continue networking - Target: 2 quality contacts",
    time: "6:00 PM",
    category: "relationship_building",
    targetCount: 2,
    priority: "medium",
    icon: Users
  },
  {
    title: "Networking Event",
    description: "Attend event - Target: Meet 5-8 new professionals",
    time: "6:30 PM",
    category: "relationship_building",
    targetCount: 8,
    priority: "high",
    icon: Users
  },
  {
    title: "Work on CRM",
    description: "Update 15-20 contacts, add notes from today's activities",
    time: "8:00 PM",
    category: "administrative",
    targetCount: 20,
    priority: "medium",
    icon: Users
  },
  {
    title: "Plan Tomorrow",
    description: "Start planning for tomorrow",
    time: "8:30 PM",
    category: "personal_development",
    priority: "medium",
    icon: Calendar
  }
];

// Weekend schedule with open houses, showings, and networking
const weekendSchedule: Omit<ScheduleTask, 'id' | 'isCompleted'>[] = [
  {
    title: "Morning Review & Goal Setting",
    description: "Review weekly progress and set weekend objectives",
    time: "8:00 AM",
    category: "personal_development",
    priority: "high",
    icon: Target
  },
  {
    title: "Open House Preparation",
    description: "Set up marketing materials, signage, and property staging",
    time: "9:00 AM",
    category: "marketing",
    priority: "high",
    icon: TrendingUp
  },
  {
    title: "Open House Event",
    description: "Host open house, greet visitors, collect contact information",
    time: "11:00 AM",
    category: "lead_generation",
    targetCount: 10,
    priority: "high",
    icon: Users
  },
  {
    title: "Social Media Content Creation",
    description: "Create weekend property showcase posts and market updates",
    time: "2:00 PM",
    category: "marketing",
    targetCount: 3,
    priority: "medium",
    icon: Share2
  },
  {
    title: "Client Showings",
    description: "Conduct property showings with interested buyers",
    time: "3:00 PM",
    category: "relationship_building",
    targetCount: 3,
    priority: "high",
    icon: Users
  },
  {
    title: "Follow-up with Open House Leads",
    description: "Contact visitors from today's open house events",
    time: "5:00 PM",
    category: "lead_generation",
    targetCount: 10,
    priority: "high",
    icon: Phone
  },
  {
    title: "Networking Events",
    description: "Attend community events, real estate meetups, or social gatherings",
    time: "6:30 PM",
    category: "relationship_building",
    priority: "medium",
    icon: Users
  },
  {
    title: "Week Planning & Preparation",
    description: "Plan upcoming week activities and prepare materials",
    time: "8:00 PM",
    category: "administrative",
    priority: "medium",
    icon: Calendar
  }
];

export default function DailySchedule() {
  const { toast } = useToast();
  const [scheduleDate] = useState(new Date());
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    time: "",
    category: "lead_generation",
    priority: "medium",
    targetCount: ""
  });

  const dateString = format(scheduleDate, 'yyyy-MM-dd');
  const dayOfWeek = scheduleDate.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
  const defaultSchedule = isWeekend ? weekendSchedule : weekdaySchedule;

  // Check for notification permission
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setNotificationsEnabled(true);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          setNotificationsEnabled(permission === 'granted');
        });
      }
    }
  }, []);

  // Set up notifications for upcoming tasks and performance check-ins
  useEffect(() => {
    if (!notificationsEnabled || isWeekend) return;

    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();

    // Schedule 9:00 AM motivational notification
    const morningTime = 900; // 9:00 AM
    if (currentTime < morningTime) {
      const timeUntil9AM = (morningTime - currentTime) * 60000; // Convert to milliseconds
      setTimeout(() => {
        new Notification("🔥 Time to Dominate Your Prospecting!", {
          body: "You've got this! Every call is a step closer to your goals. Make today count!",
          icon: '/favicon.ico',
          badge: '/favicon.ico'
        });
      }, timeUntil9AM);
    }

    // Schedule 12:00 PM performance check-in notification
    const lunchTime = 1200; // 12:00 PM
    if (currentTime < lunchTime) {
      const timeUntil12PM = (lunchTime - currentTime) * 60000;
      setTimeout(() => {
        new Notification("📊 Performance Check-in Time!", {
          body: "How did your morning prospecting go? Click to log your results.",
          icon: '/favicon.ico',
          badge: '/favicon.ico'
        });
        // Auto-open performance modal
        setShowPerformanceModal(true);
      }, timeUntil12PM);
    }

    // Schedule task reminders
    defaultSchedule.forEach(task => {
      const [hours, minutes] = task.time.split(':');
      const taskTime = parseInt(hours) * 100 + parseInt(minutes.split(' ')[0]);
      
      // Schedule notification 5 minutes before task time
      const notificationTime = taskTime - 5;
      const notificationDateTime = new Date();
      notificationDateTime.setHours(Math.floor(notificationTime / 100));
      notificationDateTime.setMinutes(notificationTime % 100);

      if (notificationDateTime > now) {
        const timeUntilNotification = notificationDateTime.getTime() - now.getTime();
        
        setTimeout(() => {
          new Notification(`Upcoming Task: ${task.title}`, {
            body: `Starting in 5 minutes: ${task.description}`,
            icon: '/favicon.ico',
            badge: '/favicon.ico'
          });
        }, timeUntilNotification);
      }
    });
  }, [notificationsEnabled, isWeekend]);

  const { data: todayTasks = [], isLoading } = useQuery<ScheduleTask[]>({
    queryKey: ['/api/schedule', { date: dateString }],
    retry: false,
  });

  const createScheduleTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      return await apiRequest('POST', '/api/schedule/initialize', taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schedule'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Schedule Initialized",
        description: "Your daily schedule has been set up successfully.",
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
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      return await apiRequest('PATCH', `/api/tasks/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schedule'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
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

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      return await apiRequest('POST', '/api/tasks', taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schedule'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      setShowAddTask(false);
      setNewTask({
        title: "",
        description: "",
        time: "",
        category: "lead_generation",
        priority: "medium",
        targetCount: ""
      });
      toast({
        title: "Task Created",
        description: "Your custom task has been added to the schedule.",
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

  const initializeSchedule = () => {
    createScheduleTaskMutation.mutate({
      date: dateString,
      schedule: defaultSchedule
    });
  };

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

  const handleTaskToggle = (task: any) => {
    updateTaskMutation.mutate({
      id: task.id,
      updates: { 
        isCompleted: !task.isCompleted,
        completedAt: !task.isCompleted ? new Date().toISOString() : null,
        currentProgress: task.targetCount || 1
      }
    });

    if (!task.isCompleted) {
      toast({
        title: "Task Completed!",
        description: `Excellent work completing "${task.title}"`,
      });

      // Show motivational notification
      if (notificationsEnabled) {
        new Notification("Task Completed! 🎉", {
          body: `Great job on "${task.title}". Keep up the momentum!`,
          icon: '/favicon.ico'
        });
      }
    }
  };

  const enableNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
      
      if (permission === 'granted') {
        toast({
          title: "Notifications Enabled",
          description: "You'll now receive task reminders throughout the day.",
        });
      }
    }
  };

  const currentTime = new Date().getHours() * 100 + new Date().getMinutes();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isWeekend ? 'Weekend' : 'Daily'} Schedule - {format(scheduleDate, 'EEEE, MMMM d, yyyy')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isWeekend 
              ? 'Weekend focus: Open houses, showings, and networking events'
              : 'Follow your proven success schedule with automatic reminders'
            }
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowAddTask(true)}
            className="gradient-primary text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
          
          {!notificationsEnabled && (
            <Button onClick={enableNotifications} variant="outline">
              <Bell className="h-4 w-4 mr-2" />
              Enable Notifications
            </Button>
          )}
          
          {todayTasks.length === 0 && (
            <Button 
              onClick={initializeSchedule}
              disabled={createScheduleTaskMutation.isPending}
            >
              Initialize Today's Schedule
            </Button>
          )}
        </div>
      </div>

      {notificationsEnabled && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <Bell className="h-4 w-4" />
            <span className="text-sm font-medium">
              Notifications Enabled - You'll receive reminders 5 minutes before each task
            </span>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {(todayTasks.length > 0 ? todayTasks : defaultSchedule).map((task: any, index: number) => {
          const [hoursStr, minutesStr] = task.time.split(':');
          let hours = parseInt(hoursStr);
          const minutes = parseInt(minutesStr.split(' ')[0]);
          const isPM = task.time.includes('PM');
          
          // Convert to 24-hour format
          if (isPM && hours !== 12) {
            hours += 12;
          } else if (!isPM && hours === 12) {
            hours = 0;
          }
          
          const taskTime = hours * 100 + minutes;
          const isCurrentTask = currentTime >= taskTime && currentTime < taskTime + 60;
          const isPastTask = currentTime > taskTime + 60;
          const IconComponent = task.icon || Clock;

          return (
            <Card 
              key={task.id || index}
              className={`transition-all duration-200 ${
                isCurrentTask 
                  ? 'ring-2 ring-primary bg-primary/5 dark:bg-primary/10' 
                  : isPastTask && !task.isCompleted
                  ? 'opacity-60 bg-red-50 dark:bg-red-900/10'
                  : task.isCompleted
                  ? 'opacity-75 bg-green-50 dark:bg-green-900/10'
                  : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    {todayTasks.length > 0 && (
                      <Checkbox
                        checked={task.isCompleted}
                        onCheckedChange={() => handleTaskToggle(task)}
                        className="h-5 w-5"
                      />
                    )}
                    
                    <div className={`p-2 rounded-lg bg-primary/10 text-primary`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold ${task.isCompleted ? 'line-through text-gray-500' : ''}`}>
                          {task.title}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {task.time}
                        </Badge>
                        {task.targetCount && (
                          <Badge variant="secondary" className="text-xs">
                            Target: {task.targetCount}
                          </Badge>
                        )}
                      </div>
                      <p className={`text-sm text-gray-600 dark:text-gray-400 ${task.isCompleted ? 'line-through' : ''}`}>
                        {task.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {task.priority}
                    </Badge>
                    
                    {isCurrentTask && (
                      <Badge variant="default" className="animate-pulse bg-primary text-primary-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        Current
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          💡 Success Tips
        </h3>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Follow this schedule consistently for maximum results</li>
          <li>• Complete high-priority tasks (FSBO & Expired calls) first</li>
          <li>• Track your actual numbers vs. targets each day</li>
          <li>• Use CRM to log all contacts and follow-ups immediately</li>
          <li>• Remember: Success requires discipline and consistency</li>
        </ul>
      </div>

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md slide-up">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Add Custom Task</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowAddTask(false)}>
                <X className="h-4 w-4" />
              </Button>
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
                      <SelectItem value="lead_generation">Lead Generation</SelectItem>
                      <SelectItem value="relationship_building">Relationship Building</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="administrative">Administrative</SelectItem>
                      <SelectItem value="personal_development">Personal Development</SelectItem>
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
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Scheduled Time</label>
                  <Input
                    type="time"
                    value={newTask.time}
                    onChange={(e) => setNewTask(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Target Count</label>
                  <Input
                    type="number"
                    placeholder="10"
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

      {/* Performance Tracking Modal */}
      <PerformanceModal 
        isOpen={showPerformanceModal}
        onClose={() => setShowPerformanceModal(false)}
        date={dateString}
      />
    </div>
  );
}