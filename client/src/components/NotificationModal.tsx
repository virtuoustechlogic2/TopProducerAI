import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Megaphone, Clock } from "lucide-react";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  type?: "reminder" | "motivation" | "achievement";
}

export default function NotificationModal({ 
  isOpen, 
  onClose, 
  title = "Time for Action!",
  message = "It's time to make your FSBO calls! Remember: For every 200 people you contact, 1 becomes a customer within 3-6 months. Stay consistent!",
  type = "reminder"
}: NotificationModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "achievement":
        return <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
          <Megaphone className="h-6 w-6 text-secondary" />
        </div>;
      case "motivation":
        return <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
          <Megaphone className="h-6 w-6 text-accent" />
        </div>;
      default:
        return <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
          <Megaphone className="h-6 w-6 text-primary" />
        </div>;
    }
  };

  const handleSnooze = () => {
    // In a real app, this would schedule the notification for later
    onClose();
  };

  const handleStartNow = () => {
    // In a real app, this would mark the task as started and navigate to the appropriate page
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <Card className="w-full max-w-md p-6 relative slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          {getIcon()}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
            <p className="text-sm text-neutral-600">Your Virtual Boss Reminder</p>
          </div>
        </div>
        
        <div className="bg-neutral-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-neutral-800 font-medium mb-2">
            {message.split('!')[0]}!
          </p>
          {message.includes('Remember:') && (
            <p className="text-xs text-neutral-600">
              {message.split('Remember: ')[1]}
            </p>
          )}
        </div>
        
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            className="flex-1 flex items-center justify-center space-x-2"
            onClick={handleSnooze}
          >
            <Clock className="h-4 w-4" />
            <span>Snooze 30min</span>
          </Button>
          <Button 
            className="flex-1 gradient-primary text-white"
            onClick={handleStartNow}
          >
            Start Now
          </Button>
        </div>
      </Card>
    </div>
  );
}
