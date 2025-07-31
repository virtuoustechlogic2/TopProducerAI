import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import NotificationModal from "@/components/NotificationModal";

import { 
  Target, 
  CheckCircle, 
  Users, 
  DollarSign, 
  TrendingUp,
  Phone,
  UserPlus,
  Calculator,
  Activity
} from "lucide-react";

interface DashboardStats {
  quarterlyProgress: number;
  todayTasksCompleted: number;
  todayTasksTotal: number;
  totalContacts: number;
  newContactsToday: number;
  quarterlyIncome: number;
  quarterlyGoal: number;
}

interface Task {
  id: number;
  title: string;
  description: string;
  category: string;
  scheduledTime: string;
  isCompleted: boolean;
  targetCount?: number;
  currentProgress?: number;
}

interface Activity {
  id: number;
  type: string;
  description: string;
  createdAt: string;
}

interface Affirmation {
  text: string;
  author?: string;
}

export default function Home() {
  const { toast } = useToast();
  const [showNotification, setShowNotification] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ['/api/schedule', today],
    queryFn: () => fetch(`/api/schedule?date=${today}`).then(res => res.json()),
  });

  // Auto-initialize today's schedule if no tasks exist
  const autoInitializeMutation = useMutation({
    mutationFn: async () => {
      const dayOfWeek = new Date().getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      // Simplified weekday schedule for auto-initialization
      const weekdaySchedule = [
        {
          title: "Morning Preparation & Goal Review",
          description: "Review daily objectives and prepare for the day",
          time: "8:00 AM",
          category: "personal_development",
          priority: "high"
        },
        {
          title: "FSBO Cold Calls",
          description: "Call For Sale By Owner listings to build relationships",
          time: "9:00 AM",
          category: "lead_generation",
          targetCount: 50,
          priority: "high"
        },
        {
          title: "Expired Listing Outreach",
          description: "Contact expired listings to offer services",
          time: "11:00 AM",
          category: "lead_generation",
          targetCount: 50,
          priority: "high"
        },
        {
          title: "Client Follow-up Calls",
          description: "Check in with current clients and prospects",
          time: "2:00 PM",
          category: "relationship_building",
          targetCount: 20,
          priority: "medium"
        },
        {
          title: "Social Media Marketing",
          description: "Create and share content, engage with followers",
          time: "4:00 PM",
          category: "marketing",
          targetCount: 5,
          priority: "medium"
        }
      ];

      const weekendSchedule = [
        {
          title: "Open House Preparation",
          description: "Set up marketing materials and property staging",
          time: "9:00 AM",
          category: "marketing",
          priority: "high"
        },
        {
          title: "Open House Event",
          description: "Host open house and collect contact information",
          time: "11:00 AM",
          category: "lead_generation",
          targetCount: 10,
          priority: "high"
        },
        {
          title: "Client Showings",
          description: "Conduct property showings with buyers",
          time: "3:00 PM",
          category: "relationship_building",
          targetCount: 3,
          priority: "high"
        }
      ];
      
      const defaultSchedule = isWeekend ? weekendSchedule : weekdaySchedule;
      
      return await apiRequest('POST', '/api/schedule/initialize', {
        date: today,
        schedule: defaultSchedule
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schedule', today] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    },
  });

  // Auto-initialize if no tasks exist for today (only once)
  const [hasInitialized, setHasInitialized] = useState(false);
  
  useEffect(() => {
    if (tasks.length === 0 && !autoInitializeMutation.isPending && !hasInitialized) {
      const timer = setTimeout(() => {
        autoInitializeMutation.mutate();
        setHasInitialized(true);
      }, 2000); // Wait 2 seconds to allow data to load

      return () => clearTimeout(timer);
    }
  }, [tasks.length, autoInitializeMutation, hasInitialized]);

  const { data: activities = [] } = useQuery<Activity[]>({
    queryKey: ['/api/activities', { limit: 5 }],
  });

  const { data: affirmation } = useQuery<Affirmation>({
    queryKey: ['/api/affirmation/random'],
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Task> }) => {
      return await apiRequest('PATCH', `/api/tasks/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schedule', today] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
    },
  });

  const handleTaskToggle = (task: Task) => {
    updateTaskMutation.mutate({
      id: task.id,
      updates: { 
        isCompleted: !task.isCompleted,
        completedAt: !task.isCompleted ? new Date().toISOString() : null
      }
    });

    if (!task.isCompleted) {
      toast({
        title: "Task Completed!",
        description: `Great job completing "${task.title}"`,
        variant: "default",
      });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'lead_generation': return 'bg-primary/10 text-primary border-primary/20';
      case 'relationship_building': return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'marketing': return 'bg-accent/10 text-accent border-accent/20';
      default: return 'bg-neutral-100 text-neutral-600 border-neutral-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'lead_generation': return <Phone className="h-4 w-4" />;
      case 'relationship_building': return <Users className="h-4 w-4" />;
      case 'marketing': return <TrendingUp className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'contact_added': return <UserPlus className="h-4 w-4 text-primary" />;
      case 'task_completed': return <CheckCircle className="h-4 w-4 text-secondary" />;
      case 'income_recorded': return <DollarSign className="h-4 w-4 text-accent" />;
      default: return <Activity className="h-4 w-4 text-neutral-500" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  // Show notification after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Layout>
      {/* Daily Motivation Banner */}
      <div className="gradient-primary text-white py-4 mb-8 rounded-xl">
        <div className="px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl opacity-75">"</div>
              <div>
                <p className="font-medium text-lg">
                  {affirmation?.text || "My potential is limitless."}
                </p>
                <p className="text-sm opacity-90">
                  Daily Affirmation • {new Date().toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['/api/affirmation/random'] });
              }}
            >
              New Quote
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Q1 Progress</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {stats?.quarterlyProgress ? `${stats.quarterlyProgress}%` : '0%'}
                </p>
                <p className="text-xs text-secondary mt-1">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  On track for goals
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Target className="text-secondary h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Today's Tasks</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {stats?.todayTasksCompleted || 0}/{stats?.todayTasksTotal || 0}
                </p>
                <p className="text-xs text-accent mt-1">
                  {(stats?.todayTasksTotal || 0) - (stats?.todayTasksCompleted || 0)} remaining
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-primary h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">CRM Contacts</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {stats?.totalContacts?.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-secondary mt-1">
                  <UserPlus className="inline h-3 w-3 mr-1" />
                  +{stats?.newContactsToday || 0} today
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Users className="text-accent h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">This Quarter</p>
                <p className="text-2xl font-bold text-neutral-900">
                  ${stats?.quarterlyIncome?.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-secondary mt-1">
                  Goal: ${stats?.quarterlyGoal?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <DollarSign className="text-secondary h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Schedule */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Today's Schedule</CardTitle>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-neutral-500">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-neutral-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tasks scheduled for today</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <div 
                    key={task.id} 
                    className={`flex items-start space-x-4 p-4 rounded-lg border transition-all ${
                      task.isCompleted 
                        ? 'bg-secondary/5 border-secondary/20' 
                        : 'bg-neutral-50 border-neutral-200'
                    }`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      <Checkbox 
                        checked={task.isCompleted}
                        onCheckedChange={() => handleTaskToggle(task)}
                        className="data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-medium ${
                          task.isCompleted ? 'line-through text-neutral-500' : 'text-neutral-900'
                        }`}>
                          {task.title}
                        </h3>
                        <span className="text-xs text-neutral-500">{task.scheduledTime}</span>
                      </div>
                      <p className={`text-sm mt-1 ${
                        task.isCompleted ? 'line-through text-neutral-400' : 'text-neutral-600'
                      }`}>
                        {task.description}
                      </p>
                      <div className="flex items-center mt-2 space-x-4">
                        <Badge 
                          variant="outline" 
                          className={`${getCategoryColor(task.category)} flex items-center space-x-1`}
                        >
                          {getCategoryIcon(task.category)}
                          <span className="capitalize">
                            {task.category.replace('_', ' ')}
                          </span>
                        </Badge>
                        {task.targetCount && (
                          <span className="text-xs text-neutral-500">
                            Progress: {task.currentProgress || 0}/{task.targetCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick CRM Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick CRM Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start hover:bg-primary/5 hover:border-primary/20"
                onClick={() => window.location.href = '/crm?action=add'}
              >
                <UserPlus className="h-4 w-4 mr-2 text-primary" />
                Add New Contact
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start hover:bg-secondary/5 hover:border-secondary/20"
                onClick={() => window.location.href = '/crm?filter=follow-ups'}
              >
                <Phone className="h-4 w-4 mr-2 text-secondary" />
                View Follow-ups Due
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start hover:bg-accent/5 hover:border-accent/20"
                onClick={() => window.location.href = '/tools'}
              >
                <Calculator className="h-4 w-4 mr-2 text-accent" />
                Real Estate Tools
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-start hover:bg-primary/5 hover:border-primary/20"
                onClick={() => window.location.href = '/goals'}
              >
                <Target className="h-4 w-4 mr-2 text-primary" />
                View Goals & Progress
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activities.length === 0 ? (
                <div className="text-center py-4 text-neutral-500">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent activity</p>
                </div>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-900">{activity.description}</p>
                      <p className="text-xs text-neutral-500">{formatTimeAgo(activity.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Income Goal Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Q1 Income Goal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">Progress</span>
                <span className="text-sm font-medium text-neutral-900">
                  {stats?.quarterlyProgress || 0}%
                </span>
              </div>
              
              <div className="w-full bg-neutral-200 rounded-full h-3">
                <div 
                  className="gradient-success h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(stats?.quarterlyProgress || 0, 100)}%` }}
                />
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">
                  Current: <span className="font-medium text-neutral-900">
                    ${stats?.quarterlyIncome?.toLocaleString() || '0'}
                  </span>
                </span>
                <span className="text-neutral-600">
                  Goal: <span className="font-medium text-neutral-900">
                    ${stats?.quarterlyGoal?.toLocaleString() || '0'}
                  </span>
                </span>
              </div>
              
              {stats?.quarterlyGoal && stats?.quarterlyIncome && (
                <div className="bg-neutral-50 rounded-lg p-3 mt-4">
                  <p className="text-xs text-neutral-600 mb-2">To reach your goal, you need:</p>
                  <div className="text-xs">
                    <span className="font-medium text-neutral-900">
                      ${(stats.quarterlyGoal - stats.quarterlyIncome).toLocaleString()} more
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>



      <NotificationModal 
        isOpen={showNotification} 
        onClose={() => setShowNotification(false)} 
      />
    </Layout>
  );
}
