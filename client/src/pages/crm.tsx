import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { isUnauthorizedError } from "@/lib/authUtils";
import FollowUpDialog from "@/components/FollowUpDialog";
import { 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  Star,
  Edit,
  Trash2,
  UserPlus,
  Filter,
  Users,
  Building,
  Home,
  TrendingUp,
  Clock
} from "lucide-react";

interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  category: string;
  source?: string;
  notes?: string;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  tags?: string[];
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  leadScore: number;
  isActive: boolean;
  createdAt: string;
}

const contactCategories = [
  { value: "Agent", label: "Agent", icon: Users, color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "Buyer", label: "Buyer", icon: Home, color: "bg-green-100 text-green-700 border-green-200" },
  { value: "Seller", label: "Seller", icon: TrendingUp, color: "bg-purple-100 text-purple-700 border-purple-200" },
  { value: "Renter", label: "Renter", icon: Building, color: "bg-orange-100 text-orange-700 border-orange-200" },
  { value: "Landlord", label: "Landlord", icon: Building, color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { value: "FSBO", label: "FSBO", icon: Home, color: "bg-red-100 text-red-700 border-red-200" },
  { value: "FRBO", label: "FRBO", icon: Building, color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { value: "Expired", label: "Expired", icon: Clock, color: "bg-gray-100 text-gray-700 border-gray-200" },
  { value: "Investor", label: "Investor", icon: TrendingUp, color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
];

const leadSources = [
  "Cold Call", "Social Media", "Referral", "Open House", "Website", "Networking Event",
  "Direct Mail", "Online Ad", "Walk-in", "Past Client", "Other"
];

export default function CRM() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [showAddContact, setShowAddContact] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [followUpContact, setFollowUpContact] = useState<Contact | null>(null);
  const [showFollowUpDialog, setShowFollowUpDialog] = useState(false);
  const [newContact, setNewContact] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    category: "Buyer",
    source: "",
    notes: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const { data: contacts = [], isLoading } = useQuery<Contact[]>({
    queryKey: ['/api/contacts'],
    retry: false,
  });

  const { data: followUps = [] } = useQuery<Contact[]>({
    queryKey: ['/api/contacts/follow-ups'],
    retry: false,
  });

  // Check for follow-ups and prompt user
  useEffect(() => {
    if (followUps.length > 0 && !showFollowUpDialog) {
      const firstFollowUp = followUps[0];
      // Show follow-up prompt after a delay
      const timer = setTimeout(() => {
        setFollowUpContact(firstFollowUp);
        setShowFollowUpDialog(true);
      }, 3000); // Show after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [followUps, showFollowUpDialog]);

  // Call tracking mutation
  const callContactMutation = useMutation({
    mutationFn: async (contactId: number) => {
      return await apiRequest('POST', '/api/activities', {
        type: "phone_call_initiated",
        description: `Initiated phone call to contact`,
        contactId: contactId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
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
      console.error("Error tracking call:", error);
    },
  });

  const handleCallContact = (contact: Contact) => {
    if (!contact.phone) {
      toast({
        title: "No Phone Number",
        description: "This contact doesn't have a phone number on file.",
        variant: "destructive",
      });
      return;
    }

    // Format phone number for tel: link (remove non-digits)
    const phoneNumber = contact.phone.replace(/\D/g, '');
    
    // Track the call attempt
    callContactMutation.mutate(contact.id);
    
    // Open phone dialer
    window.location.href = `tel:+1${phoneNumber}`;
    
    toast({
      title: "Calling Contact",
      description: `Initiating call to ${contact.firstName} ${contact.lastName}`,
    });
  };

  const createContactMutation = useMutation({
    mutationFn: async (contactData: any) => {
      // Calculate follow-up date (24 hours from now)
      const followUpDate = new Date();
      followUpDate.setDate(followUpDate.getDate() + 1);
      
      const contactWithFollowUp = {
        ...contactData,
        nextFollowUpDate: followUpDate.toISOString().split('T')[0]
      };
      
      return await apiRequest('POST', '/api/contacts', contactWithFollowUp);
    },
    onSuccess: (newContact) => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      setShowAddContact(false);
      resetForm();
      
      // First toast: Contact added
      toast({
        title: "Contact Added",
        description: "New contact has been added to your CRM.",
      });
      
      // Immediate prompt for virtual card
      setTimeout(() => {
        toast({
          title: "📱 Send Virtual Card",
          description: `Send your virtual business card to ${newContact.firstName || 'the new contact'} via text message to make a great first impression!`,
          duration: 8000,
        });
      }, 2000);
      
      // Set reminder for 24-hour follow-up
      setTimeout(() => {
        toast({
          title: "⏰ Follow-up Reminder Set",
          description: `Follow-up with ${newContact.firstName || 'this contact'} has been scheduled for tomorrow. Check your follow-ups tab!`,
          duration: 6000,
        });
      }, 4000);
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

  const updateContactMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Contact> }) => {
      return await apiRequest('PATCH', `/api/contacts/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      setEditingContact(null);
      toast({
        title: "Contact Updated",
        description: "Contact information has been updated.",
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
    },
  });

  const resetForm = () => {
    setNewContact({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      category: "Buyer",
      source: "",
      notes: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
    });
  };

  const handleCreateContact = () => {
    if (!newContact.firstName.trim() || !newContact.lastName.trim()) {
      toast({
        title: "Validation Error",
        description: "First name and last name are required.",
        variant: "destructive",
      });
      return;
    }

    createContactMutation.mutate(newContact);
  };

  const getCategoryData = (categoryValue: string) => {
    return contactCategories.find(cat => cat.value === categoryValue) || contactCategories[0];
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
  };

  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone?.includes(searchTerm);
    
    const matchesCategory = categoryFilter === "all" || contact.category === categoryFilter;
    const matchesTab = activeTab === "all" || 
                      (activeTab === "follow-ups" && followUps.some(f => f.id === contact.id)) ||
                      contact.category.toLowerCase() === activeTab;
    
    return matchesSearch && matchesCategory && matchesTab && contact.isActive;
  });

  const getContactsByCategory = () => {
    const categoryCounts = contactCategories.map(category => ({
      ...category,
      count: contacts.filter(c => c.category === category.value && c.isActive).length
    }));
    return categoryCounts;
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">CRM</h1>
            <p className="text-neutral-600 mt-1">
              Manage your contacts and build lasting relationships
            </p>
          </div>
          <Button 
            onClick={() => setShowAddContact(true)}
            className="gradient-primary text-white"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Total Contacts</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {contacts.filter(c => c.isActive).length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Follow-ups Due</p>
                  <p className="text-2xl font-bold text-neutral-900">{followUps.length}</p>
                </div>
                <Clock className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">High Priority</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {contacts.filter(c => c.leadScore >= 80 && c.isActive).length}
                  </p>
                </div>
                <Star className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">This Month</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {contacts.filter(c => {
                      const thisMonth = new Date();
                      const contactDate = new Date(c.createdAt);
                      return contactDate.getMonth() === thisMonth.getMonth() && 
                             contactDate.getFullYear() === thisMonth.getFullYear();
                    }).length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="space-y-6">
            {/* Search */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </CardContent>
            </Card>

            {/* Category Filter */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {contactCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Categories Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {getContactsByCategory().map((category) => {
                    const Icon = category.icon;
                    return (
                      <div key={category.value} className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4 text-neutral-600" />
                          <span className="text-sm">{category.label}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {category.count}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contacts List */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">All Contacts</TabsTrigger>
                    <TabsTrigger value="follow-ups">Follow-ups</TabsTrigger>
                    <TabsTrigger value="buyer">Buyers</TabsTrigger>
                    <TabsTrigger value="seller">Sellers</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>

              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-20 bg-neutral-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredContacts.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">No contacts found</h3>
                    <p className="text-neutral-500 mb-4">
                      {contacts.length === 0 
                        ? "Start building your network by adding your first contact." 
                        : "No contacts match your current filters."
                      }
                    </p>
                    <Button onClick={() => setShowAddContact(true)} variant="outline">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Contact
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredContacts.map((contact) => {
                      const categoryData = getCategoryData(contact.category);
                      const CategoryIcon = categoryData.icon;

                      return (
                        <div 
                          key={contact.id}
                          className="flex items-center space-x-4 p-4 border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors"
                        >
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {getInitials(contact.firstName, contact.lastName)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-lg font-medium text-neutral-900">
                                  {contact.firstName} {contact.lastName}
                                </h3>
                                <div className="flex items-center space-x-4 mt-1">
                                  {contact.email && (
                                    <div className="flex items-center text-sm text-neutral-600">
                                      <Mail className="h-4 w-4 mr-1" />
                                      {contact.email}
                                    </div>
                                  )}
                                  {contact.phone && (
                                    <div className="flex items-center text-sm text-neutral-600">
                                      <Phone className="h-4 w-4 mr-1" />
                                      {contact.phone}
                                    </div>
                                  )}
                                </div>
                                {contact.address && (
                                  <div className="flex items-center text-sm text-neutral-600 mt-1">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    {contact.address}, {contact.city}, {contact.state} {contact.zipCode}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1">
                                  <Star className={`h-4 w-4 ${getLeadScoreColor(contact.leadScore)}`} />
                                  <span className={`text-sm font-medium ${getLeadScoreColor(contact.leadScore)}`}>
                                    {contact.leadScore}
                                  </span>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setEditingContact(contact)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className={`${categoryData.color} flex items-center space-x-1`}>
                                  <CategoryIcon className="h-3 w-3" />
                                  <span>{contact.category}</span>
                                </Badge>
                                {contact.source && (
                                  <Badge variant="outline" className="text-neutral-600">
                                    {contact.source}
                                  </Badge>
                                )}
                              </div>

                              <div className="flex items-center space-x-2">
                                {contact.nextFollowUpDate && (
                                  <Badge variant="outline" className="text-accent border-accent/20">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    Follow-up: {new Date(contact.nextFollowUpDate).toLocaleDateString()}
                                  </Badge>
                                )}
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleCallContact(contact)}
                                  disabled={!contact.phone || callContactMutation.isPending}
                                >
                                  <Phone className="h-4 w-4 mr-1" />
                                  {callContactMutation.isPending ? "Calling..." : "Call"}
                                </Button>
                              </div>
                            </div>

                            {contact.notes && (
                              <p className="text-sm text-neutral-600 mt-2 line-clamp-2">
                                {contact.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Contact Modal */}
      {showAddContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto slide-up">
            <CardHeader>
              <CardTitle>Add New Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">First Name *</label>
                  <Input
                    placeholder="John"
                    value={newContact.firstName}
                    onChange={(e) => setNewContact(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Last Name *</label>
                  <Input
                    placeholder="Doe"
                    value={newContact.lastName}
                    onChange={(e) => setNewContact(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={newContact.email}
                    onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Phone</label>
                  <Input
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={newContact.phone}
                    onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select 
                    value={newContact.category} 
                    onValueChange={(value) => setNewContact(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {contactCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Source</label>
                  <Select 
                    value={newContact.source} 
                    onValueChange={(value) => setNewContact(prev => ({ ...prev, source: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source..." />
                    </SelectTrigger>
                    <SelectContent>
                      {leadSources.map((source) => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Address</label>
                <Input
                  placeholder="123 Main Street"
                  value={newContact.address}
                  onChange={(e) => setNewContact(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">City</label>
                  <Input
                    placeholder="Miami"
                    value={newContact.city}
                    onChange={(e) => setNewContact(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">State</label>
                  <Input
                    placeholder="FL"
                    value={newContact.state}
                    onChange={(e) => setNewContact(prev => ({ ...prev, state: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">ZIP Code</label>
                  <Input
                    placeholder="33101"
                    value={newContact.zipCode}
                    onChange={(e) => setNewContact(prev => ({ ...prev, zipCode: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Notes</label>
                <Textarea
                  placeholder="Additional notes about this contact..."
                  value={newContact.notes}
                  onChange={(e) => setNewContact(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddContact(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateContact}
                  disabled={createContactMutation.isPending}
                  className="flex-1 gradient-primary text-white"
                >
                  {createContactMutation.isPending ? "Creating..." : "Add Contact"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Contact Modal */}
      {editingContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto slide-up">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Edit className="h-5 w-5" />
                <span>Edit Contact</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">First Name *</label>
                  <Input
                    placeholder="John"
                    value={editingContact.firstName}
                    onChange={(e) => setEditingContact(prev => prev ? { ...prev, firstName: e.target.value } : null)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Last Name *</label>
                  <Input
                    placeholder="Doe"
                    value={editingContact.lastName}
                    onChange={(e) => setEditingContact(prev => prev ? { ...prev, lastName: e.target.value } : null)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={editingContact.email || ""}
                    onChange={(e) => setEditingContact(prev => prev ? { ...prev, email: e.target.value } : null)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Phone</label>
                  <Input
                    placeholder="(555) 123-4567"
                    value={editingContact.phone || ""}
                    onChange={(e) => setEditingContact(prev => prev ? { ...prev, phone: e.target.value } : null)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select 
                    value={editingContact.category} 
                    onValueChange={(value) => setEditingContact(prev => prev ? { ...prev, category: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {contactCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Lead Score</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="75"
                    value={editingContact.leadScore || ""}
                    onChange={(e) => setEditingContact(prev => prev ? { ...prev, leadScore: parseInt(e.target.value) || 0 } : null)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Source</label>
                <Select 
                  value={editingContact.source || ""} 
                  onValueChange={(value) => setEditingContact(prev => prev ? { ...prev, source: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {leadSources.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Address</label>
                <Input
                  placeholder="123 Main Street"
                  value={editingContact.address || ""}
                  onChange={(e) => setEditingContact(prev => prev ? { ...prev, address: e.target.value } : null)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">City</label>
                  <Input
                    placeholder="Miami"
                    value={editingContact.city || ""}
                    onChange={(e) => setEditingContact(prev => prev ? { ...prev, city: e.target.value } : null)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">State</label>
                  <Input
                    placeholder="FL"
                    value={editingContact.state || ""}
                    onChange={(e) => setEditingContact(prev => prev ? { ...prev, state: e.target.value } : null)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">ZIP Code</label>
                  <Input
                    placeholder="33101"
                    value={editingContact.zipCode || ""}
                    onChange={(e) => setEditingContact(prev => prev ? { ...prev, zipCode: e.target.value } : null)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Notes</label>
                <Textarea
                  placeholder="Additional notes about this contact..."
                  value={editingContact.notes || ""}
                  onChange={(e) => setEditingContact(prev => prev ? { ...prev, notes: e.target.value } : null)}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setEditingContact(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    if (!editingContact.firstName.trim() || !editingContact.lastName.trim()) {
                      toast({
                        title: "Validation Error",
                        description: "First name and last name are required.",
                        variant: "destructive",
                      });
                      return;
                    }
                    updateContactMutation.mutate({ 
                      id: editingContact.id, 
                      updates: editingContact 
                    });
                  }}
                  disabled={updateContactMutation.isPending}
                  className="flex-1 gradient-primary text-white"
                >
                  {updateContactMutation.isPending ? "Updating..." : "Update Contact"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Follow-up Dialog */}
      <FollowUpDialog
        contact={followUpContact}
        isOpen={showFollowUpDialog}
        onClose={() => {
          setShowFollowUpDialog(false);
          setFollowUpContact(null);
        }}
      />
    </Layout>
  );
}
