import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { 
  Target, 
  Eye, 
  Compass, 
  Heart, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Minus,
  ArrowRight,
  ArrowLeft,
  Globe,
  MapPin,
  Clock,
  Languages
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const onboardingSchema = z.object({
  // User preferences
  region: z.string().min(1, "Please select your region"),
  location: z.string().min(1, "Please enter your location"),
  timeZone: z.string().min(1, "Please select your time zone"),
  language: z.string().min(1, "Please select your language"),
  // Vision and goals
  fiveYearVision: z.string().min(10, "Please provide a detailed 5-year vision"),
  oneYearVision: z.string().min(10, "Please provide a detailed 1-year vision"),
  mission: z.string().min(10, "Please provide your mission statement"),
  values: z.string().min(10, "Please describe your core values"),
  motivation: z.string().min(10, "Please explain what motivates you"),
  desiredAnnualIncome: z.string().min(1, "Annual income target is required"),
  averageCommission: z.string().min(1, "Average commission is required"),
  swotAnalysis: z.object({
    strengths: z.array(z.string()).min(1, "Add at least one strength"),
    weaknesses: z.array(z.string()).min(1, "Add at least one weakness"),
    opportunities: z.array(z.string()).min(1, "Add at least one opportunity"),
    threats: z.array(z.string()).min(1, "Add at least one threat"),
  }),
});

type OnboardingData = z.infer<typeof onboardingSchema>;

const steps = [
  { id: 1, title: "Preferences", icon: Globe },
  { id: 2, title: "Vision Setting", icon: Eye },
  { id: 3, title: "Mission & Values", icon: Compass },
  { id: 4, title: "Motivation", icon: Heart },
  { id: 5, title: "SWOT Analysis", icon: Target },
  { id: 6, title: "Financial Goals", icon: TrendingUp },
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      region: "",
      location: "",
      timeZone: "",
      language: "en",
      fiveYearVision: "",
      oneYearVision: "",
      mission: "",
      values: "",
      motivation: "",
      desiredAnnualIncome: "",
      averageCommission: "",
      swotAnalysis: {
        strengths: [""],
        weaknesses: [""],
        opportunities: [""],
        threats: [""],
      },
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (data: OnboardingData) => {
      return await apiRequest('POST', '/api/onboarding/complete', data);
    },
    onSuccess: () => {
      toast({
        title: "Welcome to Your Success Journey!",
        description: "Your onboarding is complete. Let's start building your real estate empire!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: OnboardingData) => {
    completeMutation.mutate(data);
  };

  const addSWOTItem = (category: keyof OnboardingData['swotAnalysis']) => {
    const currentItems = form.getValues(`swotAnalysis.${category}`);
    form.setValue(`swotAnalysis.${category}`, [...currentItems, ""]);
  };

  const removeSWOTItem = (category: keyof OnboardingData['swotAnalysis'], index: number) => {
    const currentItems = form.getValues(`swotAnalysis.${category}`);
    form.setValue(`swotAnalysis.${category}`, currentItems.filter((_, i) => i !== index));
  };

  const updateSWOTItem = (category: keyof OnboardingData['swotAnalysis'], index: number, value: string) => {
    const currentItems = form.getValues(`swotAnalysis.${category}`);
    const newItems = [...currentItems];
    newItems[index] = value;
    form.setValue(`swotAnalysis.${category}`, newItems);
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof OnboardingData)[] = [];
    
    switch (currentStep) {
      case 1:
        fieldsToValidate = ['region', 'location', 'timeZone', 'language'];
        break;
      case 2:
        fieldsToValidate = ['fiveYearVision', 'oneYearVision'];
        break;
      case 3:
        fieldsToValidate = ['mission', 'values'];
        break;
      case 4:
        fieldsToValidate = ['motivation'];
        break;
      case 5:
        fieldsToValidate = ['swotAnalysis'];
        break;
      case 6:
        fieldsToValidate = ['desiredAnnualIncome', 'averageCommission'];
        break;
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Welcome to Your Success Journey, {user?.firstName}!
          </h1>
          <p className="text-lg text-neutral-600">
            Let's set up your foundation for real estate success
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-2 mb-4" />
          <div className="flex justify-between">
            {steps.map((step) => {
              const StepIcon = step.icon;
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    currentStep >= step.id 
                      ? 'bg-primary text-white' 
                      : 'bg-neutral-200 text-neutral-500'
                  }`}>
                    <StepIcon className="h-5 w-5" />
                  </div>
                  <span className={`text-xs font-medium ${
                    currentStep >= step.id ? 'text-primary' : 'text-neutral-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Step 1: User Preferences */}
          {currentStep === 1 && (
            <Card className="fade-in">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-6 w-6 text-primary" />
                  <span>Personal Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Region Selection */}
                  <div>
                    <Label className="text-base font-medium flex items-center mb-3">
                      <Globe className="h-4 w-4 text-blue-500 mr-2" />
                      Region
                    </Label>
                    <Select 
                      value={form.watch('region')} 
                      onValueChange={(value) => form.setValue('region', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="north_america">North America</SelectItem>
                        <SelectItem value="europe">Europe</SelectItem>
                        <SelectItem value="asia_pacific">Asia Pacific</SelectItem>
                        <SelectItem value="south_america">South America</SelectItem>
                        <SelectItem value="africa">Africa</SelectItem>
                        <SelectItem value="middle_east">Middle East</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.region && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.region.message}
                      </p>
                    )}
                  </div>

                  {/* Location Input */}
                  <div>
                    <Label htmlFor="location" className="text-base font-medium flex items-center mb-3">
                      <MapPin className="h-4 w-4 text-green-500 mr-2" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      placeholder="City, State/Province, Country"
                      {...form.register('location')}
                    />
                    {form.formState.errors.location && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.location.message}
                      </p>
                    )}
                  </div>

                  {/* Time Zone Selection */}
                  <div>
                    <Label className="text-base font-medium flex items-center mb-3">
                      <Clock className="h-4 w-4 text-orange-500 mr-2" />
                      Time Zone
                    </Label>
                    <Select 
                      value={form.watch('timeZone')} 
                      onValueChange={(value) => form.setValue('timeZone', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your time zone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time (EST/EDT)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CST/CDT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MST/MDT)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PST/PDT)</SelectItem>
                        <SelectItem value="Europe/London">London (GMT/BST)</SelectItem>
                        <SelectItem value="Europe/Paris">Paris (CET/CEST)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                        <SelectItem value="Asia/Shanghai">Shanghai (CST)</SelectItem>
                        <SelectItem value="Australia/Sydney">Sydney (AEST/AEDT)</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.timeZone && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.timeZone.message}
                      </p>
                    )}
                  </div>

                  {/* Language Selection */}
                  <div>
                    <Label className="text-base font-medium flex items-center mb-3">
                      <Languages className="h-4 w-4 text-purple-500 mr-2" />
                      Language
                    </Label>
                    <Select 
                      value={form.watch('language')} 
                      onValueChange={(value) => form.setValue('language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español (Spanish)</SelectItem>
                        <SelectItem value="fr">Français (French)</SelectItem>
                        <SelectItem value="de">Deutsch (German)</SelectItem>
                        <SelectItem value="pt">Português (Portuguese)</SelectItem>
                        <SelectItem value="zh">中文 (Chinese)</SelectItem>
                        <SelectItem value="ja">日本語 (Japanese)</SelectItem>
                        <SelectItem value="ko">한국어 (Korean)</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.language && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.language.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    📍 Why We Need This Information
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    These preferences help us customize your experience with local market insights, 
                    schedule notifications in your time zone, and display content in your preferred language.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Vision Setting */}
          {currentStep === 2 && (
            <Card className="fade-in">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-6 w-6 text-primary" />
                  <span>What Is Your Vision?</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="fiveYearVision" className="text-base font-medium">
                    5 Year Vision
                  </Label>
                  <p className="text-sm text-neutral-600 mb-3">
                    Where do you want to be in 5 years? Think about your house, car, investments, family, team, etc.
                  </p>
                  <Textarea
                    id="fiveYearVision"
                    placeholder="I want to own a $2M home, drive a luxury car, have investment properties, be married, take annual vacations, and have a team of 5 agents..."
                    className="min-h-[120px]"
                    {...form.register('fiveYearVision')}
                  />
                  {form.formState.errors.fiveYearVision && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.fiveYearVision.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="oneYearVision" className="text-base font-medium">
                    1 Year Vision
                  </Label>
                  <p className="text-sm text-neutral-600 mb-3">
                    What goals can you set for this year to achieve your 5-year vision?
                  </p>
                  <Textarea
                    id="oneYearVision"
                    placeholder="This year I want to close 30 transactions, build my emergency fund, save for a down payment, and hire my first assistant..."
                    className="min-h-[120px]"
                    {...form.register('oneYearVision')}
                  />
                  {form.formState.errors.oneYearVision && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.oneYearVision.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Mission & Values */}
          {currentStep === 3 && (
            <Card className="fade-in">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Compass className="h-6 w-6 text-primary" />
                  <span>Mission & Values</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="mission" className="text-base font-medium">
                    Your Mission Statement
                  </Label>
                  <p className="text-sm text-neutral-600 mb-3">
                    Define your mission that communicates the purpose, values, and vision of your business.
                  </p>
                  <Textarea
                    id="mission"
                    placeholder="My mission is to provide exceptional real estate services that help families find their dream homes while building lasting relationships based on trust, integrity, and results..."
                    className="min-h-[120px]"
                    {...form.register('mission')}
                  />
                  {form.formState.errors.mission && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.mission.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="values" className="text-base font-medium">
                    Your Core Values
                  </Label>
                  <p className="text-sm text-neutral-600 mb-3">
                    What fundamental values guide your decisions and characterize your business?
                  </p>
                  <Textarea
                    id="values"
                    placeholder="Integrity: I always act honestly and transparently. Excellence: I strive for the highest quality in everything I do. Service: I put my clients' needs first and go above and beyond..."
                    className="min-h-[120px]"
                    {...form.register('values')}
                  />
                  {form.formState.errors.values && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.values.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Motivation */}
          {currentStep === 4 && (
            <Card className="fade-in">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-6 w-6 text-primary" />
                  <span>What Motivates You?</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="motivation" className="text-base font-medium">
                    Your WHY
                  </Label>
                  <p className="text-sm text-neutral-600 mb-3">
                    What drives you? This is not about what motivates you, but the TRUTH about what moves you.
                  </p>
                  <Textarea
                    id="motivation"
                    placeholder="I am motivated by the desire to provide financial security for my family, to help people achieve their homeownership dreams, and to build a legacy that will last generations..."
                    className="min-h-[160px]"
                    {...form.register('motivation')}
                  />
                  {form.formState.errors.motivation && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.motivation.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: SWOT Analysis */}
          {currentStep === 5 && (
            <Card className="fade-in">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-6 w-6 text-primary" />
                  <span>SWOT Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <div>
                    <Label className="text-base font-medium flex items-center mb-3">
                      <TrendingUp className="h-4 w-4 text-secondary mr-2" />
                      Strengths
                    </Label>
                    {form.watch('swotAnalysis.strengths').map((strength, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <Input
                          value={strength}
                          onChange={(e) => updateSWOTItem('strengths', index, e.target.value)}
                          placeholder="Enter a strength..."
                          className="flex-1"
                        />
                        {form.watch('swotAnalysis.strengths').length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeSWOTItem('strengths', index)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addSWOTItem('strengths')}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Strength
                    </Button>
                  </div>

                  {/* Weaknesses */}
                  <div>
                    <Label className="text-base font-medium flex items-center mb-3">
                      <TrendingDown className="h-4 w-4 text-destructive mr-2" />
                      Weaknesses
                    </Label>
                    {form.watch('swotAnalysis.weaknesses').map((weakness, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <Input
                          value={weakness}
                          onChange={(e) => updateSWOTItem('weaknesses', index, e.target.value)}
                          placeholder="Enter a weakness..."
                          className="flex-1"
                        />
                        {form.watch('swotAnalysis.weaknesses').length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeSWOTItem('weaknesses', index)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addSWOTItem('weaknesses')}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Weakness
                    </Button>
                  </div>

                  {/* Opportunities */}
                  <div>
                    <Label className="text-base font-medium flex items-center mb-3">
                      <Plus className="h-4 w-4 text-accent mr-2" />
                      Opportunities
                    </Label>
                    {form.watch('swotAnalysis.opportunities').map((opportunity, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <Input
                          value={opportunity}
                          onChange={(e) => updateSWOTItem('opportunities', index, e.target.value)}
                          placeholder="Enter an opportunity..."
                          className="flex-1"
                        />
                        {form.watch('swotAnalysis.opportunities').length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeSWOTItem('opportunities', index)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addSWOTItem('opportunities')}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Opportunity
                    </Button>
                  </div>

                  {/* Threats */}
                  <div>
                    <Label className="text-base font-medium flex items-center mb-3">
                      <Minus className="h-4 w-4 text-neutral-500 mr-2" />
                      Threats
                    </Label>
                    {form.watch('swotAnalysis.threats').map((threat, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <Input
                          value={threat}
                          onChange={(e) => updateSWOTItem('threats', index, e.target.value)}
                          placeholder="Enter a threat..."
                          className="flex-1"
                        />
                        {form.watch('swotAnalysis.threats').length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeSWOTItem('threats', index)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addSWOTItem('threats')}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Threat
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 6: Financial Goals */}
          {currentStep === 6 && (
            <Card className="fade-in">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <span>Financial Goals</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="desiredAnnualIncome" className="text-base font-medium">
                    Desired Annual Income
                  </Label>
                  <p className="text-sm text-neutral-600 mb-3">
                    What is your target gross commission income for this year?
                  </p>
                  <Input
                    id="desiredAnnualIncome"
                    type="number"
                    placeholder="125000"
                    {...form.register('desiredAnnualIncome')}
                  />
                  {form.formState.errors.desiredAnnualIncome && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.desiredAnnualIncome.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="averageCommission" className="text-base font-medium">
                    Average Commission Per Transaction
                  </Label>
                  <p className="text-sm text-neutral-600 mb-3">
                    What is your average commission amount per closed transaction?
                  </p>
                  <Input
                    id="averageCommission"
                    type="number"
                    placeholder="3500"
                    {...form.register('averageCommission')}
                  />
                  {form.formState.errors.averageCommission && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.averageCommission.message}
                    </p>
                  )}
                </div>

                {form.watch('desiredAnnualIncome') && form.watch('averageCommission') && (
                  <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                    <h4 className="font-medium text-primary mb-2">Your Success Formula</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Annual Goal:</span>
                        <span className="font-medium">
                          ${parseInt(form.watch('desiredAnnualIncome') || '0').toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Quarterly Goal:</span>
                        <span className="font-medium">
                          ${Math.round(parseInt(form.watch('desiredAnnualIncome') || '0') / 4).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Transactions Needed:</span>
                        <span className="font-medium">
                          {Math.ceil(parseInt(form.watch('desiredAnnualIncome') || '0') / parseInt(form.watch('averageCommission') || '1'))} per year
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Transactions Per Quarter:</span>
                        <span className="font-medium">
                          {Math.ceil(parseInt(form.watch('desiredAnnualIncome') || '0') / parseInt(form.watch('averageCommission') || '1') / 4)} transactions
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>

            {currentStep < steps.length ? (
              <Button
                type="button"
                onClick={nextStep}
                className="flex items-center space-x-2 gradient-primary text-white"
              >
                <span>Next</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={completeMutation.isPending}
                className="flex items-center space-x-2 gradient-success text-white"
              >
                {completeMutation.isPending ? "Setting up..." : "Complete Setup"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
