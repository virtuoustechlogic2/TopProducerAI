import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Users, DollarSign, Target, CheckCircle, TrendingUp, Calendar, Phone } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-sm">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-neutral-900">My Virtual Boss</h1>
                <p className="text-xs text-neutral-500">Real Estate Edition</p>
              </div>
            </div>
            <Button onClick={handleLogin} className="gradient-primary text-white font-medium">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 gradient-primary text-white border-0" variant="secondary">
            Proven Real Estate Success System
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
            Your Personal
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"> Real Estate</span>
            <br />Productivity Coach
          </h1>
          <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Transform your real estate career with daily schedules, CRM management, and goal tracking based on successful industry professionals' proven strategies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleLogin} size="lg" className="gradient-primary text-white px-8 py-3 text-lg font-medium">
              Start Your Success Journey
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-3 text-lg border-2 border-primary text-primary hover:bg-primary hover:text-white">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">Everything You Need to Succeed</h2>
            <p className="text-xl text-neutral-600">Built on proven strategies from top-performing real estate professionals</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="card-hover border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Daily Task Scheduler</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600 mb-4">Predetermined daily activities with push notifications:</p>
                <ul className="space-y-2 text-sm text-neutral-600">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-secondary mr-2" />50 FSBO cold calls daily</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-secondary mr-2" />50 expired listing calls daily</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-secondary mr-2" />Social media engagement</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-secondary mr-2" />Networking events</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle className="text-xl">Advanced CRM System</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600 mb-4">Complete contact management with categorization:</p>
                <ul className="space-y-2 text-sm text-neutral-600">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-secondary mr-2" />Agent, Buyer, Seller tracking</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-secondary mr-2" />FSBO, FRBO, Expired leads</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-secondary mr-2" />Automated follow-up reminders</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-secondary mr-2" />Lead scoring & nurturing</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="text-xl">Income Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600 mb-4">Comprehensive financial management:</p>
                <ul className="space-y-2 text-sm text-neutral-600">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-secondary mr-2" />Sales commissions tracking</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-secondary mr-2" />Rental fees management</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-secondary mr-2" />Referral fee tracking</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-secondary mr-2" />Quarterly goal monitoring</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Goal Setting & SWOT</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600 mb-4">Strategic planning and analysis:</p>
                <ul className="space-y-2 text-sm text-neutral-600">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-secondary mr-2" />5-year & 1-year vision setting</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-secondary mr-2" />SWOT analysis framework</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-secondary mr-2" />Mission & values definition</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-secondary mr-2" />Quarterly performance reviews</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle className="text-xl">Progress Visualization</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600 mb-4">Data-driven insights and motivation:</p>
                <ul className="space-y-2 text-sm text-neutral-600">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-secondary mr-2" />Real-time progress charts</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-secondary mr-2" />Performance analytics</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-secondary mr-2" />Goal achievement tracking</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-secondary mr-2" />Success milestone alerts</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Phone className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="text-xl">Built-in Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600 mb-4">Essential real estate utilities:</p>
                <ul className="space-y-2 text-sm text-neutral-600">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-secondary mr-2" />Mortgage calculator</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-secondary mr-2" />Daily motivational quotes</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-secondary mr-2" />Push notifications</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-secondary mr-2" />Mobile-first design</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Success Rules Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8">Proven Success Rules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="text-4xl font-bold text-primary mb-2">1:10</div>
                <p className="text-lg font-semibold mb-2">Past Customer Referrals</p>
                <p className="text-neutral-600">1 out of every 10 past customers will give you a referral with proper follow-up</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="text-4xl font-bold text-secondary mb-2">1:200</div>
                <p className="text-lg font-semibold mb-2">Lead Conversion Rate</p>
                <p className="text-neutral-600">For every 200 people you contact, 1 becomes a customer within 3-6 months</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="text-4xl font-bold text-accent mb-2">1:25</div>
                <p className="text-lg font-semibold mb-2">Rental Conversions</p>
                <p className="text-neutral-600">1 out of 25 renters can buy now, 2 out of 25 can buy next year</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="text-4xl font-bold text-primary mb-2">5:100</div>
                <p className="text-lg font-semibold mb-2">CRM Contact Value</p>
                <p className="text-neutral-600">5 out of 100 CRM contacts will become customers or refer customers</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">Ready to Transform Your Real Estate Career?</h2>
          <p className="text-xl text-neutral-600 mb-8">Join successful agents who use proven daily strategies to build their business</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleLogin} size="lg" className="gradient-primary text-white px-8 py-4 text-lg font-medium">
              Start Your Success Journey Today
            </Button>
          </div>
          <p className="text-sm text-neutral-500 mt-4">No credit card required • Start building your success immediately</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-neutral-900 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">My Virtual Boss</span>
          </div>
          <p className="text-neutral-400 mb-4">Your Personal Real Estate Productivity Coach</p>
          <p className="text-sm text-neutral-500">
            Built for real estate professionals who are serious about success
          </p>
        </div>
      </footer>
    </div>
  );
}
