import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Target, Phone, Users, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";

interface PerformanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
}

interface PerformanceData {
  callsMade: number;
  conversations: number;
  followUps: number;
  appointments: number;
  notes?: string;
}

export default function PerformanceModal({ isOpen, onClose, date }: PerformanceModalProps) {
  const { toast } = useToast();
  const [performance, setPerformance] = useState<PerformanceData>({
    callsMade: 0,
    conversations: 0,
    followUps: 0,
    appointments: 0,
    notes: ""
  });

  const { data: existingPerformance } = useQuery<PerformanceData>({
    queryKey: ['/api/performance', { date }],
    enabled: isOpen,
  });

  // Update local state when existing performance data is loaded
  useEffect(() => {
    if (existingPerformance) {
      setPerformance(existingPerformance);
    }
  }, [existingPerformance]);

  const savePerformanceMutation = useMutation({
    mutationFn: async (data: PerformanceData & { date: string }) => {
      return await apiRequest('POST', '/api/performance', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/performance'] });
      toast({
        title: "Performance Saved",
        description: "Your daily performance has been recorded successfully.",
      });
      onClose();
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

  const handleSave = () => {
    savePerformanceMutation.mutate({ ...performance, date });
  };

  const handleInputChange = (field: keyof PerformanceData, value: string | number) => {
    setPerformance(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg slide-up">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl">Daily Performance Check-in</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              How did your morning prospecting go?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Track your daily activities to monitor progress toward your goals
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium">
                <Phone className="h-4 w-4 mr-2 text-blue-500" />
                Calls Made
              </label>
              <Input
                type="number"
                placeholder="0"
                value={performance.callsMade}
                onChange={(e) => handleInputChange('callsMade', parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium">
                <Users className="h-4 w-4 mr-2 text-green-500" />
                Conversations
              </label>
              <Input
                type="number"
                placeholder="0"
                value={performance.conversations}
                onChange={(e) => handleInputChange('conversations', parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium">
                <Target className="h-4 w-4 mr-2 text-orange-500" />
                Follow-ups
              </label>
              <Input
                type="number"
                placeholder="0"
                value={performance.followUps}
                onChange={(e) => handleInputChange('followUps', parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium">
                <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                Appointments
              </label>
              <Input
                type="number"
                placeholder="0"
                value={performance.appointments}
                onChange={(e) => handleInputChange('appointments', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Additional Notes</label>
            <Textarea
              placeholder="Any insights, challenges, or observations from today's prospecting..."
              value={performance.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
            />
          </div>

          {/* Performance Indicators */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              📊 Today's Conversion Rate
            </h4>
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <div>
                Conversation Rate: {performance.callsMade > 0 ? Math.round((performance.conversations / performance.callsMade) * 100) : 0}%
              </div>
              <div>
                Appointment Rate: {performance.conversations > 0 ? Math.round((performance.appointments / performance.conversations) * 100) : 0}%
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={savePerformanceMutation.isPending}
              className="flex-1 gradient-primary text-white"
            >
              {savePerformanceMutation.isPending ? "Saving..." : "Save Performance"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}