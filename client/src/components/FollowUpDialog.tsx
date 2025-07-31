import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Phone, MessageSquare, Mail, Calendar } from "lucide-react";

interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  category: string;
}

interface FollowUpDialogProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
}

const followUpMethods = [
  { value: "phone", label: "Phone Call", icon: Phone },
  { value: "text", label: "Text Message", icon: MessageSquare },
  { value: "email", label: "Email", icon: Mail },
];

export default function FollowUpDialog({ contact, isOpen, onClose }: FollowUpDialogProps) {
  const { toast } = useToast();
  const [followUpData, setFollowUpData] = useState({
    method: "",
    notes: "",
    nextFollowUpDate: "",
  });

  const followUpMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/follow-ups', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/contacts/follow-ups'] });
      queryClient.invalidateQueries({ queryKey: ['/api/follow-ups'] });
      
      toast({
        title: "Follow-up Recorded",
        description: `Successfully recorded follow-up with ${contact?.firstName} ${contact?.lastName}`,
      });
      
      resetForm();
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

  const resetForm = () => {
    setFollowUpData({
      method: "",
      notes: "",
      nextFollowUpDate: "",
    });
  };

  const handleSubmit = () => {
    if (!followUpData.method) {
      toast({
        title: "Validation Error",
        description: "Please select a follow-up method.",
        variant: "destructive",
      });
      return;
    }

    const submitData = {
      contactId: contact?.id,
      method: followUpData.method,
      notes: followUpData.notes,
      nextFollowUpDate: followUpData.nextFollowUpDate || null,
    };

    followUpMutation.mutate(submitData);
  };

  const handleNotFollowedUp = () => {
    // Set next follow-up for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toISOString().split('T')[0];
    
    // Update contact without recording a follow-up
    const updateData = {
      nextFollowUpDate: tomorrowString,
    };
    
    // Update the contact directly
    apiRequest('PATCH', `/api/contacts/${contact?.id}`, updateData)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
        queryClient.invalidateQueries({ queryKey: ['/api/contacts/follow-ups'] });
        
        toast({
          title: "Follow-up Rescheduled",
          description: `Follow-up with ${contact?.firstName} ${contact?.lastName} rescheduled for tomorrow`,
        });
        
        onClose();
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to reschedule follow-up",
          variant: "destructive",
        });
      });
  };

  if (!contact) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Follow-up with {contact.firstName} {contact.lastName}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Did you follow up with <strong>{contact.firstName} {contact.lastName}</strong>?
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="method">How did you follow up?</Label>
              <Select 
                value={followUpData.method} 
                onValueChange={(value) => setFollowUpData(prev => ({ ...prev, method: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select follow-up method" />
                </SelectTrigger>
                <SelectContent>
                  {followUpMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <SelectItem key={method.value} value={method.value}>
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4" />
                          <span>{method.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about the follow-up..."
                value={followUpData.notes}
                onChange={(e) => setFollowUpData(prev => ({ ...prev, notes: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>

            <div>
              <Label htmlFor="nextFollowUp">Next follow-up date (optional)</Label>
              <Input
                id="nextFollowUp"
                type="date"
                value={followUpData.nextFollowUpDate}
                onChange={(e) => setFollowUpData(prev => ({ ...prev, nextFollowUpDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleNotFollowedUp}
            className="w-full sm:w-auto"
          >
            Not Yet - Remind Tomorrow
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={followUpMutation.isPending}
            className="w-full sm:w-auto"
          >
            {followUpMutation.isPending ? "Recording..." : "Yes, I Followed Up"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}