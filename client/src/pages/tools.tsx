import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import InvestmentAnalysisCalculator from "@/components/InvestmentAnalysisCalculator";
import PrequalificationCalculator from "@/components/PrequalificationCalculator";
import SellerNetSheetCalculator from "@/components/SellerNetSheetCalculator";
import CMACalculator from "@/components/CMACalculator";
import { 
  Calculator, 
  TrendingUp,
  DollarSign,
  Building,
  Home,
  BarChart3,
  PieChart,
  FileText,
  Settings,
  Plus,
  ArrowRight
} from "lucide-react";

export default function Tools() {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const availableTools = [
    {
      id: 'investment',
      title: 'Investment Analysis',
      description: 'Comprehensive rental property analysis with unit-by-unit breakdown, DSCR calculations, and future projections',
      icon: TrendingUp,
      color: 'bg-green-50 border-green-200',
      iconColor: 'text-green-600',
      badge: 'Advanced',
      badgeColor: 'bg-green-100 text-green-700'
    },
    {
      id: 'prequalification',
      title: 'Prequalification Calculator',
      description: 'Help clients understand their buying power and monthly payment options with detailed mortgage calculations',
      icon: Home,
      color: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600',
      badge: 'Essential',
      badgeColor: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'netsheet',
      title: 'Seller\'s Net Sheet',
      description: 'Calculate estimated net proceeds from sale using location-specific closing costs and fees',
      icon: DollarSign,
      color: 'bg-purple-50 border-purple-200',
      iconColor: 'text-purple-600',
      badge: 'Professional',
      badgeColor: 'bg-purple-100 text-purple-700'
    },
    {
      id: 'cma',
      title: 'Quick CMA Tool',
      description: 'Generate comparative market analysis using multiple data sources for rough property valuations',
      icon: BarChart3,
      color: 'bg-orange-50 border-orange-200',
      iconColor: 'text-orange-600',
      badge: 'Market Analysis',
      badgeColor: 'bg-orange-100 text-orange-700'
    }
  ];

  const comingSoonTools = [
    {
      title: 'Portfolio Tracker',
      description: 'Track multiple properties and performance metrics',
      icon: PieChart,
      color: 'bg-orange-50 border-orange-200',
      iconColor: 'text-orange-600'
    },
    {
      title: 'Contract Generator',
      description: 'Generate purchase agreements and contracts',
      icon: FileText,
      color: 'bg-indigo-50 border-indigo-200',
      iconColor: 'text-indigo-600'
    },
    {
      title: 'Cost Estimator',
      description: 'Estimate renovation and maintenance costs',
      icon: Settings,
      color: 'bg-teal-50 border-teal-200',
      iconColor: 'text-teal-600'
    }
  ];

  if (activeTool) {
    const tool = availableTools.find(t => t.id === activeTool);
    if (!tool) return null;
    
    return (
      <Layout>
        <div className="space-y-6">
          {/* Header with Back Button */}
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => setActiveTool(null)}
              className="flex items-center gap-2"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              Back to Tools
            </Button>
            <div className="flex items-center gap-3">
              <tool.icon className={`h-8 w-8 ${tool.iconColor}`} />
              <div>
                <h1 className="text-3xl font-bold">{tool.title}</h1>
                <p className="text-neutral-600">{tool.description}</p>
              </div>
            </div>
          </div>

          {/* Tool Content */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              {activeTool === 'investment' && <InvestmentAnalysisCalculator />}
              {activeTool === 'prequalification' && <PrequalificationCalculator />}
              {activeTool === 'netsheet' && <SellerNetSheetCalculator />}
              {activeTool === 'cma' && <CMACalculator />}
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <Calculator className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Real Estate Tools</h1>
              <p className="text-white/90 text-lg">
                Professional calculators and analysis tools to grow your business
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-white/80">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              <span>Property Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              <span>Market Insights</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              <span>Financial Planning</span>
            </div>
          </div>
        </div>

        {/* Available Tools */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">Available Tools</h2>
            <Badge variant="secondary" className="px-3 py-1">
              {availableTools.length} Tools Ready
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {availableTools.map((tool) => (
              <Card 
                key={tool.id}
                className={`${tool.color} card-hover cursor-pointer transition-all hover:shadow-lg border-2`}
                onClick={() => setActiveTool(tool.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 ${tool.color.replace('50', '100')} rounded-lg flex items-center justify-center`}>
                      <tool.icon className={`h-6 w-6 ${tool.iconColor}`} />
                    </div>
                    <Badge className={tool.badgeColor}>
                      {tool.badge}
                    </Badge>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                    {tool.title}
                  </h3>
                  <p className="text-neutral-600 mb-4 leading-relaxed">
                    {tool.description}
                  </p>
                  
                  <Button 
                    className="w-full justify-between group"
                    variant="ghost"
                  >
                    Open Tool
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Coming Soon Tools */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">Coming Soon</h2>
            <Badge variant="outline" className="px-3 py-1">
              {comingSoonTools.length} More Tools
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {comingSoonTools.map((tool, index) => (
              <Card 
                key={index}
                className={`${tool.color} border-2 opacity-75`}
              >
                <CardContent className="p-4">
                  <div className={`w-10 h-10 ${tool.color.replace('50', '100')} rounded-lg flex items-center justify-center mb-3`}>
                    <tool.icon className={`h-5 w-5 ${tool.iconColor}`} />
                  </div>
                  
                  <h3 className="font-semibold text-neutral-900 mb-1">
                    {tool.title}
                  </h3>
                  <p className="text-sm text-neutral-600 mb-3">
                    {tool.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <Plus className="h-3 w-3" />
                    Coming Soon
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}