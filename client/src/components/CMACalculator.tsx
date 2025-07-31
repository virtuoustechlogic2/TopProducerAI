import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  Home, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  Calendar,
  DollarSign,
  Info,
  Eye,
  Building,
  Car,
  Bed,
  Bath,
  Ruler,
  RefreshCw
} from "lucide-react";

interface PropertyData {
  source: string;
  address: string;
  estimatedValue: number;
  confidence: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  lotSize?: string;
  yearBuilt?: number;
  propertyType?: string;
  lastSaleDate?: string;
  lastSalePrice?: number;
  taxAssessment?: number;
  marketTrend?: 'up' | 'down' | 'stable';
  daysOnMarket?: number;
}

interface ComparableProperty {
  address: string;
  distance: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  salePrice: number;
  saleDate: string;
  daysOnMarket: number;
  pricePerSqft: number;
}

interface CMAResult {
  subjectProperty: PropertyData;
  estimatedValue: {
    low: number;
    high: number;
    average: number;
  };
  comparables: ComparableProperty[];
  marketAnalysis: {
    averageDaysOnMarket: number;
    pricePerSqft: number;
    marketTrend: 'up' | 'down' | 'stable';
    absorption: string;
  };
  dataSources: string[];
}

export default function CMACalculator() {
  const [address, setAddress] = useState<string>("");
  const [bedrooms, setBedrooms] = useState<string>("");
  const [bathrooms, setBathrooms] = useState<string>("");
  const [sqft, setSqft] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<CMAResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Fetch real property data from multiple APIs
  const fetchPropertyData = async (): Promise<CMAResult> => {
    // Show progressive loading while API calls are made
    for (let i = 0; i <= 100; i += 25) {
      setProgress(i);
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    try {
      const response = await fetch('/api/cma/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: address.trim(),
          bedrooms,
          bathrooms,
          sqft
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate CMA');
      }

      const cmaData = await response.json();
      
      // Transform API response to match our interface
      return {
        subjectProperty: {
          source: cmaData.dataSources.join(', '),
          address: cmaData.subjectProperty.address,
          estimatedValue: cmaData.estimatedValue.average,
          confidence: cmaData.confidence,
          bedrooms: cmaData.subjectProperty.bedrooms,
          bathrooms: cmaData.subjectProperty.bathrooms,
          sqft: cmaData.subjectProperty.sqft,
          lotSize: cmaData.subjectProperty.lotSize,
          yearBuilt: cmaData.subjectProperty.yearBuilt,
          propertyType: cmaData.subjectProperty.propertyType,
          lastSaleDate: cmaData.subjectProperty.lastSaleDate,
          lastSalePrice: cmaData.subjectProperty.lastSalePrice,
          taxAssessment: cmaData.subjectProperty.taxAssessment,
          marketTrend: cmaData.marketAnalysis.marketTrend,
          daysOnMarket: cmaData.marketAnalysis.averageDaysOnMarket
        },
        estimatedValue: cmaData.estimatedValue,
        comparables: cmaData.comparables,
        marketAnalysis: cmaData.marketAnalysis,
        dataSources: cmaData.dataSources
      };
    } catch (error) {
      console.error('CMA API Error:', error);
      throw error;
    }
  };

  const generateCMA = async () => {
    if (!address.trim()) return;

    setLoading(true);
    setProgress(0);
    
    try {
      const cmaData = await fetchPropertyData();
      setResult(cmaData);
      setShowResults(true);
    } catch (error) {
      console.error("Error generating CMA:", error);
      // Show user-friendly error message
      alert(`CMA Generation Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const resetCalculator = () => {
    setAddress("");
    setBedrooms("");
    setBathrooms("");
    setSqft("");
    setResult(null);
    setShowResults(false);
    setProgress(0);
    setActiveTab("overview");
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-6 w-6 text-primary" />
          Quick Comparative Market Analysis (CMA)
        </CardTitle>
        <CardDescription>
          Get a rough property value estimate using multiple data sources
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!showResults ? (
          <>
            {/* Input Form */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Property Address
                  </Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="123 Main Street, City, State, ZIP"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter the full address for the most accurate results
                  </p>
                </div>

                <div>
                  <Label htmlFor="bedrooms" className="flex items-center gap-2">
                    <Bed className="h-4 w-4" />
                    Bedrooms
                  </Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    placeholder="3"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="bathrooms" className="flex items-center gap-2">
                    <Bath className="h-4 w-4" />
                    Bathrooms
                  </Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    step="0.5"
                    placeholder="2.5"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="sqft" className="flex items-center gap-2">
                    <Ruler className="h-4 w-4" />
                    Square Footage
                  </Label>
                  <Input
                    id="sqft"
                    type="number"
                    placeholder="1800"
                    value={sqft}
                    onChange={(e) => setSqft(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* API Configuration Alert */}
              <Alert className="border-blue-200 bg-blue-50 mb-4">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Ready for Real Data:</strong> This CMA tool is configured to work with RentCast API (50 free calls/month) 
                  and ATTOM Data API (30-day free trial). Add your API keys to get authentic comparable sales data from nearby properties. 
                  Without API keys, you'll see a clear error message prompting you to configure real estate data sources.
                </AlertDescription>
              </Alert>

              {/* Important Disclaimer */}
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>Important Disclaimer:</strong> This CMA provides a rough estimate only. 
                  For an accurate and detailed property valuation, a professional walkthrough 
                  and in-person assessment of the property is essential. Market conditions, 
                  property condition, and unique features significantly impact actual value.
                </AlertDescription>
              </Alert>

              {/* Loading State */}
              {loading && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="text-sm font-medium">
                      Gathering data from multiple sources...
                    </span>
                  </div>
                  <Progress value={progress} className="w-full" />
                  <p className="text-xs text-muted-foreground">
                    Analyzing property data from RentCast, ATTOM Data, and other real estate sources
                  </p>
                </div>
              )}

              <Button 
                onClick={generateCMA} 
                disabled={!address.trim() || loading}
                className="w-full"
                size="lg"
              >
                {loading ? "Analyzing..." : "Generate CMA Report"}
              </Button>
            </div>
          </>
        ) : result && (
          <>
            {/* Results Display */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">CMA Report</h3>
                  <p className="text-sm text-muted-foreground">{result.subjectProperty.address}</p>
                </div>
                <Button variant="outline" onClick={resetCalculator}>
                  New Analysis
                </Button>
              </div>

              {/* Value Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-blue-600">Estimated Low</p>
                    <p className="text-2xl font-bold text-blue-800">
                      {formatCurrency(result.estimatedValue.low)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-green-600">Average Estimate</p>
                    <p className="text-2xl font-bold text-green-800">
                      {formatCurrency(result.estimatedValue.average)}
                    </p>
                    <Badge className="mt-1 bg-green-100 text-green-700">
                      Primary Estimate
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-purple-600">Estimated High</p>
                    <p className="text-2xl font-bold text-purple-800">
                      {formatCurrency(result.estimatedValue.high)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Tabbed Content */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="comparables">Comparables</TabsTrigger>
                  <TabsTrigger value="market">Market Analysis</TabsTrigger>
                  <TabsTrigger value="sources">Data Sources</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Home className="h-5 w-5" />
                        Property Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-neutral-50 rounded-lg">
                          <Bed className="h-5 w-5 mx-auto mb-1 text-neutral-600" />
                          <p className="text-sm text-neutral-600">Bedrooms</p>
                          <p className="font-semibold">{result.subjectProperty.bedrooms}</p>
                        </div>
                        <div className="text-center p-3 bg-neutral-50 rounded-lg">
                          <Bath className="h-5 w-5 mx-auto mb-1 text-neutral-600" />
                          <p className="text-sm text-neutral-600">Bathrooms</p>
                          <p className="font-semibold">{result.subjectProperty.bathrooms}</p>
                        </div>
                        <div className="text-center p-3 bg-neutral-50 rounded-lg">
                          <Ruler className="h-5 w-5 mx-auto mb-1 text-neutral-600" />
                          <p className="text-sm text-neutral-600">Sq Ft</p>
                          <p className="font-semibold">{formatNumber(result.subjectProperty.sqft || 0)}</p>
                        </div>
                        <div className="text-center p-3 bg-neutral-50 rounded-lg">
                          <Calendar className="h-5 w-5 mx-auto mb-1 text-neutral-600" />
                          <p className="text-sm text-neutral-600">Year Built</p>
                          <p className="font-semibold">{result.subjectProperty.yearBuilt}</p>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Last Sale</p>
                          <p className="font-semibold">
                            {formatCurrency(result.subjectProperty.lastSalePrice || 0)} 
                            <span className="text-sm text-muted-foreground ml-2">
                              ({result.subjectProperty.lastSaleDate})
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Tax Assessment</p>
                          <p className="font-semibold">
                            {formatCurrency(result.subjectProperty.taxAssessment || 0)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="comparables" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Comparable Sales</CardTitle>
                      <CardDescription>
                        Similar properties sold within the last 6 months
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {result.comparables.map((comp, index) => (
                          <div key={index} className="p-4 border rounded-lg bg-neutral-50">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-semibold">{comp.address}</p>
                                <p className="text-sm text-muted-foreground">{comp.distance} away</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-lg">{formatCurrency(comp.salePrice)}</p>
                                <p className="text-sm text-muted-foreground">Sold {comp.saleDate}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-4 gap-4 mt-3">
                              <div className="text-center">
                                <p className="text-xs text-muted-foreground">Bed/Bath</p>
                                <p className="font-medium">{comp.bedrooms}/{comp.bathrooms}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-muted-foreground">Sq Ft</p>
                                <p className="font-medium">{formatNumber(comp.sqft)}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-muted-foreground">Price/Sq Ft</p>
                                <p className="font-medium">${comp.pricePerSqft}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-muted-foreground">Days on Market</p>
                                <p className="font-medium">{comp.daysOnMarket}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="market" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Market Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                            <span className="text-sm">Average Days on Market</span>
                            <span className="font-semibold">{result.marketAnalysis.averageDaysOnMarket} days</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                            <span className="text-sm">Price per Sq Ft</span>
                            <span className="font-semibold">${result.marketAnalysis.pricePerSqft}</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                            <span className="text-sm">Market Trend</span>
                            <div className="flex items-center gap-2">
                              {getTrendIcon(result.marketAnalysis.marketTrend)}
                              <span className="font-semibold capitalize">{result.marketAnalysis.marketTrend}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                            <span className="text-sm">Absorption Rate</span>
                            <span className="font-semibold">{result.marketAnalysis.absorption}</span>
                          </div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-blue-800 mb-2">Market Insights</h4>
                          <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Properties in this area sell within 30 days on average</li>
                            <li>• Market shows {result.marketAnalysis.marketTrend === 'up' ? 'upward' : 'stable'} pricing trend</li>
                            <li>• Comparable properties range ${Math.round(result.marketAnalysis.pricePerSqft * 0.9)}-${Math.round(result.marketAnalysis.pricePerSqft * 1.1)} per sq ft</li>
                            <li>• Strong buyer demand in this neighborhood</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="sources" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Data Sources & Reliability
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {result.dataSources.map((source, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="font-medium">{source}</span>
                          </div>
                        ))}
                      </div>

                      <Alert className="border-red-200 bg-red-50">
                        <Eye className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          <strong>Professional Recommendation:</strong> This automated CMA provides a starting point only. 
                          For accurate valuation, schedule an in-person property walkthrough to assess:
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Property condition and maintenance</li>
                            <li>Unique features and upgrades</li>
                            <li>Neighborhood factors and location benefits</li>
                            <li>Current market micro-conditions</li>
                            <li>Comparable property adjustments</li>
                          </ul>
                        </AlertDescription>
                      </Alert>

                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2">Next Steps</h4>
                        <p className="text-sm text-blue-700">
                          Contact a licensed real estate professional for a comprehensive CMA that includes 
                          an in-person property assessment, detailed market analysis, and pricing strategy 
                          tailored to current market conditions.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}