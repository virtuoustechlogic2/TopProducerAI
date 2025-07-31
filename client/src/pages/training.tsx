import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Phone, 
  Home, 
  Users, 
  Building, 
  BarChart3,
  Play,
  FileText,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Video,
  MessageSquare
} from "lucide-react";

interface TrainingCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  order: number;
}

interface TrainingContent {
  id: number;
  categoryId: string;
  type: string;
  title: string;
  content: string;
  description: string;
  tags: string[];
  order: number;
}

interface UserProgress {
  id: number;
  userId: string;
  contentId: number;
  completed: boolean;
  completedAt?: string;
  notes?: string;
}

const categoryIcons = {
  phone: Phone,
  home: Home,
  users: Users,
  building: Building,
  chart: BarChart3,
};

const contentTypeIcons = {
  video: Video,
  script: FileText,
  objection: MessageSquare,
};

export default function Training() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedContent, setSelectedContent] = useState<TrainingContent | null>(null);
  const [notes, setNotes] = useState("");

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<TrainingCategory[]>({
    queryKey: ['/api/training/categories'],
    retry: false,
  });

  const { data: content = [], isLoading: contentLoading } = useQuery<TrainingContent[]>({
    queryKey: ['/api/training/content', selectedCategory],
    queryFn: async () => {
      if (!selectedCategory) return [];
      const response = await fetch(`/api/training/content/${selectedCategory}`);
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!selectedCategory,
    retry: false,
  });

  const markCompletedMutation = useMutation({
    mutationFn: async (data: { contentId: number; notes?: string }) => {
      return await apiRequest('POST', '/api/training/progress', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/training/content'] });
      toast({
        title: "Progress Saved",
        description: "Your training progress has been recorded.",
      });
      setNotes("");
      setSelectedContent(null);
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

  const handleMarkCompleted = () => {
    if (selectedContent) {
      markCompletedMutation.mutate({
        contentId: selectedContent.id,
        notes: notes.trim() || undefined,
      });
    }
  };

  const getCategoryIcon = (iconName: string) => {
    const IconComponent = categoryIcons[iconName as keyof typeof categoryIcons] || BookOpen;
    return IconComponent;
  };

  const getContentIcon = (type: string) => {
    const IconComponent = contentTypeIcons[type as keyof typeof contentTypeIcons] || FileText;
    return IconComponent;
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'video': return 'Video Training';
      case 'script': return 'Script';
      case 'objection': return 'Objection Handling';
      default: return 'Content';
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-blue-100 text-blue-800';
      case 'script': return 'bg-green-100 text-green-800';
      case 'objection': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (categoriesLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Real Estate Training Center</h1>
          <p className="text-neutral-600 mt-1">
            Master your skills with expert training on objections, presentations, and prospecting
          </p>
        </div>

        {/* Training Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const IconComponent = getCategoryIcon(category.icon);
            return (
              <Card 
                key={category.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedCategory === category.id ? 'ring-2 ring-primary border-primary' : ''
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg">
                    <IconComponent className="h-5 w-5 mr-2 text-primary" />
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-600">{category.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Training Content */}
        {selectedCategory && (
          <Card>
            <CardHeader>
              <CardTitle>
                {categories.find(c => c.id === selectedCategory)?.name} Training Materials
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contentLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : content.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                  <p className="text-neutral-500">No training materials available for this category yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {content.map((item) => {
                    const ContentIcon = getContentIcon(item.type);
                    return (
                      <div key={item.id} className="border rounded-lg p-4 hover:bg-neutral-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <ContentIcon className="h-4 w-4 mr-2 text-primary" />
                              <h3 className="font-medium">{item.title}</h3>
                              <Badge 
                                variant="secondary" 
                                className={`ml-2 ${getContentTypeColor(item.type)}`}
                              >
                                {getContentTypeLabel(item.type)}
                              </Badge>
                            </div>
                            <p className="text-sm text-neutral-600 mb-3">{item.description}</p>
                            
                            {/* Content Display */}
                            <div className="bg-neutral-50 rounded p-3 mb-3">
                              {item.type === 'video' ? (
                                <div className="flex items-center text-sm text-neutral-600">
                                  <Play className="h-4 w-4 mr-2" />
                                  <span>Video URL: {item.content}</span>
                                </div>
                              ) : (
                                <div className="text-sm whitespace-pre-wrap">{item.content}</div>
                              )}
                            </div>

                            {/* Tags */}
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {item.tags.map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            onClick={() => setSelectedContent(item)}
                            className="flex items-center"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark as Completed
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Completion Modal */}
        {selectedContent && (
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-primary" />
                Complete Training: {selectedContent.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-neutral-600">
                Add any notes or key takeaways from this training session:
              </p>
              <Textarea
                placeholder="What did you learn? Any questions or insights?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedContent(null)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleMarkCompleted}
                  disabled={markCompletedMutation.isPending}
                  className="gradient-primary text-white"
                >
                  {markCompletedMutation.isPending ? "Saving..." : "Complete Training"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}