import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Plus, 
  Target,
  TrendingUp,
  DollarSign,
  Phone,
  Users,
  Calendar,
  Home,
  CheckCircle2,
  Clock,
  Edit,
  Trash2
} from "lucide-react";
import { format } from "date-fns";

// Income-based goal types and their configurations
const incomeGoalTypes = [
  { 
    value: "sales_commission", 
    label: "Sales Commission Income", 
    icon: Home, 
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    borderColor: "border-green-200 dark:border-green-800",
    unit: "$",
    incomeType: "sale"
  },
  { 
    value: "rental_commission", 
    label: "Rental Commission Income", 
    icon: Home, 
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    unit: "$",
    incomeType: "rental"
  },
  { 
    value: "other_income", 
    label: "Other Income", 
    icon: DollarSign, 
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    borderColor: "border-purple-200 dark:border-purple-800",
    unit: "$",
    incomeType: "other"
  }
];

// Regular goal types for activity-based goals
const goalTypes = [
  { 
    value: "calls", 
    label: "Phone Calls", 
    icon: Phone, 
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    unit: "calls"
  },
  { 
    value: "contacts", 
    label: "New Contacts", 
    icon: Users, 
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    borderColor: "border-green-200 dark:border-green-800",
    unit: "contacts"
  },
  { 
    value: "appointments", 
    label: "Appointments", 
    icon: Calendar, 
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    borderColor: "border-purple-200 dark:border-purple-800",
    unit: "appointments"
  },
  { 
    value: "listings", 
    label: "New Listings", 
    icon: Home, 
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    borderColor: "border-orange-200 dark:border-orange-800",
    unit: "listings"
  },
  { 
    value: "sales", 
    label: "Closed Sales", 
    icon: CheckCircle2, 
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    borderColor: "border-red-200 dark:border-red-800",
    unit: "sales"
  },
  { 
    value: "rentals", 
    label: "Rental Deals", 
    icon: Home, 
    color: "text-cyan-600",
    bgColor: "bg-cyan-50 dark:bg-cyan-900/20",
    borderColor: "border-cyan-200 dark:border-cyan-800",
    unit: "rentals"
  },
  { 
    value: "buyers", 
    label: "Buyers", 
    icon: Users, 
    color: "text-indigo-600",
    bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
    borderColor: "border-indigo-200 dark:border-indigo-800",
    unit: "buyers"
  }
];

// Time periods
const timePeriods = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Annual" }
];

export default function Goals() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    type: "",
    title: "",
    description: "",
    targetValue: "",
    period: "monthly",
    deadline: ""
  });

  // Fetch goals
  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['/api/goals'],
    retry: false,
  });

  // Initialize income goals mutation
  const initializeGoalsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/goals/initialize', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      toast({
        title: "Goals Initialized",
        description: "Your income goals have been set up successfully.",
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

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: async (goalData: any) => {
      return await apiRequest('POST', '/api/goals', goalData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      setShowAddGoal(false);
      setNewGoal({
        type: "",
        title: "",
        description: "",
        targetValue: "",
        period: "monthly",
        deadline: ""
      });
      toast({
        title: "Goal Created",
        description: "Your new goal has been successfully created.",
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

  // Update goal mutation
  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      return await apiRequest('PATCH', `/api/goals/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      toast({
        title: "Goal Updated",
        description: "Your goal has been successfully updated.",
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

  const handleCreateGoal = () => {
    if (!newGoal.type || !newGoal.title || !newGoal.targetValue) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createGoalMutation.mutate({
      ...newGoal,
      targetValue: parseFloat(newGoal.targetValue),
      deadline: newGoal.deadline || null,
    });
  };

  const handleProgressUpdate = (goalId: number, currentValue: number) => {
    updateGoalMutation.mutate({
      id: goalId,
      updates: { currentValue }
    });
  };

  const getGoalTypeData = (type: string) => {
    // First try to find in income goal types
    const incomeType = incomeGoalTypes.find(gt => gt.value === type);
    if (incomeType) return incomeType;
    
    // Then try to find in regular goal types
    const regularType = goalTypes.find(gt => gt.value === type);
    if (regularType) return regularType;
    
    // Default fallback
    return incomeGoalTypes[0];
  };

  const getProgressPercentage = (current: number, target: number) => {
    return target > 0 ? Math.min((current / target) * 100, 100) : 0;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "text-green-600";
    if (percentage >= 75) return "text-blue-600";
    if (percentage >= 50) return "text-yellow-600";
    if (percentage >= 25) return "text-orange-600";
    return "text-red-600";
  };

  // Helper function to format goal values properly
  const formatGoalValue = (value: number | string, type: string, unit: string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    // Income types should show as currency
    if (type === 'sales_commission' || type === 'rental_commission' || type === 'other_income' || type === 'quarterly_income') {
      return `$${numValue.toLocaleString()}`;
    } else if (unit === "$") {
      return `$${numValue.toLocaleString()}`;
    } else {
      // For non-monetary values, show as whole numbers without unit for cleaner display
      return `${Math.round(numValue)}`;
    }
  };

  // Group goals by type for overview
  const goalsByType = Array.isArray(goals) ? goals.reduce((acc: any, goal: any) => {
    if (!acc[goal.type]) {
      acc[goal.type] = [];
    }
    acc[goal.type].push(goal);
    return acc;
  }, {}) : {};

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Goals & Targets</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Track and measure your progress towards success
            </p>
          </div>
          
          <Button 
            onClick={() => setShowAddGoal(true)}
            className="gradient-primary text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Auto-initialize goals if none exist */}
            {Array.isArray(goals) && goals.length === 0 && !isLoading && (
              <Card className="p-6 text-center">
                <div className="space-y-4">
                  <Target className="h-12 w-12 mx-auto text-gray-400" />
                  <div>
                    <h3 className="text-lg font-semibold">Set Up Your Income Goals</h3>
                    <p className="text-gray-600 mt-2">
                      Get started by setting up your quarterly income targets for sales, rentals, and other income.
                    </p>
                  </div>
                  <Button 
                    onClick={() => initializeGoalsMutation.mutate()}
                    disabled={initializeGoalsMutation.isPending}
                    className="gradient-primary text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {initializeGoalsMutation.isPending ? 'Setting Up...' : 'Set Up Income Goals'}
                  </Button>
                </div>
              </Card>
            )}

            {/* Summary cards for income goal types - moved to top */}
            {Array.isArray(goals) && goals.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-3">
                  <h3 className="text-lg font-semibold mb-4">Income Goals Summary</h3>
                </div>
                {incomeGoalTypes.map((goalType) => {
                  const typeGoals = goalsByType[goalType.value] || [];
                  const activeGoals = typeGoals.filter((g: any) => !g.isCompleted);
                  const totalTarget = activeGoals.reduce((sum: number, g: any) => sum + (g.targetValue || 0), 0);
                  const totalCurrent = activeGoals.reduce((sum: number, g: any) => sum + (g.currentValue || 0), 0);
                  const progressPercentage = getProgressPercentage(totalCurrent, totalTarget);
                  const Icon = goalType.icon;

                  return (
                    <Card key={goalType.value} className={`${goalType.bgColor} ${goalType.borderColor} border`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Icon className={`h-5 w-5 ${goalType.color}`} />
                            <CardTitle className="text-lg">{goalType.label}</CardTitle>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {activeGoals.length} active
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Progress</span>
                            <span className={`text-sm font-medium ${getProgressColor(progressPercentage)}`}>
                              {progressPercentage.toFixed(1)}%
                            </span>
                          </div>
                          
                          <Progress value={progressPercentage} className="h-2" />
                          
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              Current: <span className="font-medium">
                                {formatGoalValue(totalCurrent, goalType.value, goalType.unit)}
                              </span>
                            </span>
                            <span className="text-gray-600">
                              Target: <span className="font-medium">
                                {formatGoalValue(totalTarget, goalType.value, goalType.unit)}
                              </span>
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Show all active goals individually */}
            <div className="grid gap-4 mt-8">
              <h3 className="text-lg font-semibold mb-4">All Active Goals</h3>
              {Array.isArray(goals) && goals.filter((goal: any) => !goal.isCompleted).map((goal: any) => {
                const typeData = getGoalTypeData(goal.type);
                const Icon = typeData.icon;
                const progressPercentage = getProgressPercentage(goal.currentValue || 0, goal.targetValue);

                return (
                  <Card key={goal.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${typeData.bgColor}`}>
                          <Icon className={`h-5 w-5 ${typeData.color}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{goal.title}</h3>
                          <p className="text-sm text-gray-600">{goal.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={typeData.color}>
                          {goal.period}
                        </Badge>
                        {goal.deadline && (
                          <Badge variant="outline" className="text-gray-600">
                            <Clock className="h-3 w-3 mr-1" />
                            {format(new Date(goal.deadline), 'MMM d, yyyy')}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Progress</span>
                        <span className={`text-sm font-medium ${getProgressColor(progressPercentage)}`}>
                          {progressPercentage.toFixed(1)}%
                        </span>
                      </div>
                      
                      <Progress value={progressPercentage} className="h-3" />
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          Current: <span className="font-medium">
                            {formatGoalValue(goal.currentValue || 0, goal.type, typeData.unit)}
                          </span>
                        </span>
                        <span className="text-gray-600">
                          Target: <span className="font-medium">
                            {formatGoalValue(goal.targetValue, goal.type, typeData.unit)}
                          </span>
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>


          </TabsContent>

          {/* Active Goals Tab */}
          <TabsContent value="active" className="space-y-6">
            <div className="grid gap-4">
              {goals.filter((goal: any) => !goal.isCompleted).map((goal: any) => {
                const typeData = getGoalTypeData(goal.type);
                const Icon = typeData.icon;
                const progressPercentage = getProgressPercentage(goal.currentValue || 0, goal.targetValue);

                return (
                  <Card key={goal.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${typeData.bgColor}`}>
                          <Icon className={`h-5 w-5 ${typeData.color}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{goal.title}</h3>
                          <p className="text-sm text-gray-600">{goal.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={typeData.color}>
                          {goal.period}
                        </Badge>
                        {goal.deadline && (
                          <Badge variant="outline" className="text-gray-600">
                            <Clock className="h-3 w-3 mr-1" />
                            {format(new Date(goal.deadline), 'MMM d, yyyy')}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Progress</span>
                        <span className={`text-sm font-medium ${getProgressColor(progressPercentage)}`}>
                          {progressPercentage.toFixed(1)}%
                        </span>
                      </div>
                      
                      <Progress value={progressPercentage} className="h-3" />
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          Current: <span className="font-medium">
                            {formatGoalValue(goal.currentValue || 0, goal.type, typeData.unit)}
                          </span>
                        </span>
                        <span className="text-gray-600">
                          Target: <span className="font-medium">
                            {formatGoalValue(goal.targetValue, goal.type, typeData.unit)}
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 pt-2">
                        <Input 
                          type="number" 
                          placeholder="Update progress..."
                          className="flex-1"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const value = parseFloat((e.target as HTMLInputElement).value);
                              if (!isNaN(value)) {
                                handleProgressUpdate(goal.id, value);
                                (e.target as HTMLInputElement).value = '';
                              }
                            }
                          }}
                        />
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            const input = document.querySelector(`input[placeholder="Update progress..."]`) as HTMLInputElement;
                            const value = parseFloat(input.value);
                            if (!isNaN(value)) {
                              handleProgressUpdate(goal.id, value);
                              input.value = '';
                            }
                          }}
                        >
                          Update
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Completed Goals Tab */}
          <TabsContent value="completed" className="space-y-6">
            <div className="grid gap-4">
              {goals.filter((goal: any) => goal.isCompleted).map((goal: any) => {
                const typeData = getGoalTypeData(goal.type);
                const Icon = typeData.icon;

                return (
                  <Card key={goal.id} className="p-6 opacity-75">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg line-through">{goal.title}</h3>
                        <p className="text-sm text-gray-600">{goal.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge variant="outline" className="text-green-600">
                            Completed
                          </Badge>
                          <span className="text-sm text-gray-500">
                            Final: {formatGoalValue(goal.currentValue || 0, goal.type, typeData.unit)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Active Goals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{goals.filter((g: any) => !g.isCompleted).length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Completed Goals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{goals.filter((g: any) => g.isCompleted).length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Average Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {goals.length > 0 
                      ? (goals.reduce((sum: number, g: any) => sum + getProgressPercentage(g.currentValue || 0, g.targetValue), 0) / goals.length).toFixed(1)
                      : 0
                    }%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Goals This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {goals.filter((g: any) => g.period === 'monthly').length}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Goal Modal */}
        {showAddGoal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Create New Goal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Goal Type</label>
                  <Select value={newGoal.type} onValueChange={(value) => setNewGoal(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select goal type" />
                    </SelectTrigger>
                    <SelectContent>
                      {incomeGoalTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Title</label>
                  <Input
                    placeholder="e.g., Q1 Income Target"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    placeholder="Describe your goal..."
                    value={newGoal.description}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Target Value</label>
                    <Input
                      type="number"
                      placeholder="100"
                      value={newGoal.targetValue}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, targetValue: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Period</label>
                    <Select value={newGoal.period} onValueChange={(value) => setNewGoal(prev => ({ ...prev, period: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timePeriods.map(period => (
                          <SelectItem key={period.value} value={period.value}>
                            {period.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Deadline (Optional)</label>
                  <Input
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, deadline: e.target.value }))}
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAddGoal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateGoal}
                    disabled={createGoalMutation.isPending}
                    className="flex-1 gradient-primary text-white"
                  >
                    {createGoalMutation.isPending ? "Creating..." : "Create Goal"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}