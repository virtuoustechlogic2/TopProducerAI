import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  BarChart3, 
  Bell, 
  Home, 
  CheckSquare, 
  Users, 
  DollarSign, 
  User,
  Menu,
  X,
  GraduationCap,
  Calculator,
  Target,
  Clock,
  Phone,
  UserPlus,
  AlertCircle
} from "lucide-react";
import { useLocation } from "wouter";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useQuery } from "@tanstack/react-query";


interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Get upcoming follow-ups and tasks for notifications
  const { data: followUps = [] } = useQuery({
    queryKey: ['/api/contacts/follow-ups'],
    enabled: !!user,
  });

  const today = new Date().toISOString().split('T')[0];
  const { data: todayTasks = [] } = useQuery({
    queryKey: ['/api/schedule', today],
    queryFn: () => fetch(`/api/schedule?date=${today}`).then(res => res.json()),
    enabled: !!user,
  });

  // Generate notifications from follow-ups and incomplete tasks
  const notifications = [
    ...followUps.slice(0, 3).map((followUp: any) => ({
      id: `followup-${followUp.id}`,
      type: 'follow-up',
      title: 'Follow-up Due',
      message: `Call ${followUp.firstName} ${followUp.lastName}`,
      time: followUp.nextFollowUpDate ? new Date(followUp.nextFollowUpDate).toLocaleDateString() : 'Today',
      icon: Phone,
      priority: 'high'
    })),
    ...todayTasks.filter((task: any) => !task.isCompleted).slice(0, 2).map((task: any) => ({
      id: `task-${task.id}`,
      type: 'task',
      title: 'Pending Task',
      message: task.title,
      time: task.scheduledTime,
      icon: Clock,
      priority: 'medium'
    }))
  ].slice(0, 5);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home, current: location === '/' },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare, current: location === '/tasks' },
    { name: 'CRM', href: '/crm', icon: Users, current: location === '/crm' },
    { name: 'Goals', href: '/goals', icon: Target, current: location === '/goals' },
    { name: 'Income', href: '/income', icon: DollarSign, current: location === '/income' },
    { name: 'Tools', href: '/tools', icon: Calculator, current: location === '/tools' },
    { name: 'Training', href: '/training', icon: GraduationCap, current: location === '/training' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header Navigation */}
      <header className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-sm">
                <BarChart3 className="text-white h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-neutral-900">My Virtual Boss</h1>
                <p className="text-xs text-neutral-500">Real Estate Edition</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => setLocation(item.href)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      item.current
                        ? 'bg-primary/10 text-primary'
                        : 'text-neutral-600 hover:text-primary hover:bg-primary/5'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
            
            <div className="flex items-center space-x-4">
              <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
                <PopoverTrigger asChild>
                  <button className="relative p-2 text-neutral-400 hover:text-primary transition-colors">
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                      <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-accent text-accent-foreground text-xs">
                        {notifications.length}
                      </Badge>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Notifications</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-neutral-500">
                          <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No new notifications</p>
                        </div>
                      ) : (
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.map((notification) => {
                            const Icon = notification.icon;
                            return (
                              <div 
                                key={notification.id}
                                className="flex items-start space-x-3 px-4 py-3 border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer transition-colors"
                                onClick={() => {
                                  if (notification.type === 'follow-up') {
                                    setLocation('/crm');
                                  } else if (notification.type === 'task') {
                                    setLocation('/tasks');
                                  }
                                  setNotificationOpen(false);
                                }}
                              >
                                <div className={`p-2 rounded-full ${
                                  notification.priority === 'high' 
                                    ? 'bg-red-100 text-red-600' 
                                    : 'bg-blue-100 text-blue-600'
                                }`}>
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-neutral-900">
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-neutral-600 truncate">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-neutral-500 mt-1">
                                    {notification.time}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </PopoverContent>
              </Popover>
              
              <div className="flex items-center space-x-3">
                {user?.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full object-cover border-2 border-neutral-200"
                  />
                ) : (
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-neutral-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-neutral-500">Licensed Agent</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-neutral-500 hover:text-neutral-700"
                >
                  Logout
                </Button>
              </div>

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 text-neutral-400 hover:text-primary"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-neutral-200">
              <nav className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        setLocation(item.href);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        item.current
                          ? 'bg-primary/10 text-primary'
                          : 'text-neutral-600 hover:text-primary hover:bg-primary/5'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Bottom Action Bar for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-4 md:hidden">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => setLocation(item.href)}
                className={`flex flex-col items-center space-y-1 transition-colors ${
                  item.current ? 'text-primary' : 'text-neutral-400 hover:text-primary'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>


    </div>
  );
}
