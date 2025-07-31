import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, DollarSign, Home, AlertCircle, CheckCircle, MapPin } from "lucide-react";

// Geographic cost data based on research
const GEOGRAPHIC_COSTS: Record<string, {
  transferTax: number;
  titleInsurance: number;
  attorneyFees: number;
  recordingFees: number;
  escrowFees: number;
  propertyTaxRate: number;
  stateName: string;
}> = {
  // High-cost states/metros
  "CA": { // California
    transferTax: 0.55, // $0.55 per $1000 (varies by county)
    titleInsurance: 0.8,
    attorneyFees: 0,
    recordingFees: 150,
    escrowFees: 0.2,
    propertyTaxRate: 0.75,
    stateName: "California"
  },
  "NY": { // New York
    transferTax: 4.0, // $2 per $1000 + mansion tax for $1M+
    titleInsurance: 0.6,
    attorneyFees: 1500,
    recordingFees: 200,
    escrowFees: 0.1,
    propertyTaxRate: 1.68,
    stateName: "New York"
  },
  "NJ": { // New Jersey
    transferTax: 1.0, // ~1% varies by location
    titleInsurance: 0.7,
    attorneyFees: 1200,
    recordingFees: 100,
    escrowFees: 0.15,
    propertyTaxRate: 1.79,
    stateName: "New Jersey"
  },
  "FL": { // Florida
    transferTax: 0.7, // $0.70 per $1000
    titleInsurance: 0.5,
    attorneyFees: 800,
    recordingFees: 75,
    escrowFees: 0.25,
    propertyTaxRate: 0.83,
    stateName: "Florida"
  },
  "TX": { // Texas
    transferTax: 0, // No state transfer tax
    titleInsurance: 0.9,
    attorneyFees: 0,
    recordingFees: 50,
    escrowFees: 0.2,
    propertyTaxRate: 1.60,
    stateName: "Texas"
  },
  "WA": { // Washington
    transferTax: 1.28, // Varies by county
    titleInsurance: 0.8,
    attorneyFees: 0,
    recordingFees: 100,
    escrowFees: 0.3,
    propertyTaxRate: 0.94,
    stateName: "Washington"
  },
  "IL": { // Illinois
    transferTax: 1.5, // $1.50 per $1000
    titleInsurance: 0.7,
    attorneyFees: 1000,
    recordingFees: 150,
    escrowFees: 0.2,
    propertyTaxRate: 2.16,
    stateName: "Illinois"
  },
  "PA": { // Pennsylvania
    transferTax: 1.0, // 1% usually split with buyer
    titleInsurance: 0.5,
    attorneyFees: 1200,
    recordingFees: 100,
    escrowFees: 0.1,
    propertyTaxRate: 1.58,
    stateName: "Pennsylvania"
  },
  "OH": { // Ohio
    transferTax: 0.4, // $4 per $1000
    titleInsurance: 0.6,
    attorneyFees: 800,
    recordingFees: 75,
    escrowFees: 0.15,
    propertyTaxRate: 1.52,
    stateName: "Ohio"
  },
  "GA": { // Georgia
    transferTax: 0.1, // $1 per $1000
    titleInsurance: 0.7,
    attorneyFees: 800,
    recordingFees: 50,
    escrowFees: 0.2,
    propertyTaxRate: 0.83,
    stateName: "Georgia"
  },
  "NC": { // North Carolina
    transferTax: 0.2, // $2 per $1000
    titleInsurance: 0.6,
    attorneyFees: 1000,
    recordingFees: 75,
    escrowFees: 0.15,
    propertyTaxRate: 0.84,
    stateName: "North Carolina"
  },
  "DEFAULT": { // National average for other locations
    transferTax: 0.5,
    titleInsurance: 0.7,
    attorneyFees: 800,
    recordingFees: 100,
    escrowFees: 0.2,
    propertyTaxRate: 1.07,
    stateName: "Other Location"
  }
};

interface NetSheetResult {
  grossSalePrice: number;
  totalDeductions: number;
  netProceeds: number;
  breakdownItems: BreakdownItem[];
}

interface BreakdownItem {
  category: string;
  description: string;
  amount: number;
  percentage: number;
}

export default function SellerNetSheetCalculator() {
  const [salePrice, setSalePrice] = useState<string>("");
  const [zipCode, setZipCode] = useState<string>("");
  const [mortgageBalance, setMortgageBalance] = useState<string>("");
  const [commissionRate, setCommissionRate] = useState<string>("6.0");
  const [repairs, setRepairs] = useState<string>("");
  const [homeWarranty, setHomeWarranty] = useState<string>("500");
  const [result, setResult] = useState<NetSheetResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [detectedState, setDetectedState] = useState<string>("");

  // Detect state from zip code (simplified mapping)
  const detectStateFromZip = (zip: string): string => {
    if (!zip || zip.length < 5) return "DEFAULT";
    
    const zipNum = parseInt(zip.substring(0, 5));
    
    // California: 90000-96699
    if (zipNum >= 90000 && zipNum <= 96699) return "CA";
    // New York: 10000-14999
    if (zipNum >= 10000 && zipNum <= 14999) return "NY";
    // New Jersey: 07000-08999
    if (zipNum >= 7000 && zipNum <= 8999) return "NJ";
    // Florida: 32000-34999
    if (zipNum >= 32000 && zipNum <= 34999) return "FL";
    // Texas: 75000-79999, 77000-77999
    if ((zipNum >= 75000 && zipNum <= 79999) || (zipNum >= 77000 && zipNum <= 77999)) return "TX";
    // Washington: 98000-99499
    if (zipNum >= 98000 && zipNum <= 99499) return "WA";
    // Illinois: 60000-62999
    if (zipNum >= 60000 && zipNum <= 62999) return "IL";
    // Pennsylvania: 15000-19699
    if (zipNum >= 15000 && zipNum <= 19699) return "PA";
    // Ohio: 43000-45999
    if (zipNum >= 43000 && zipNum <= 45999) return "OH";
    // Georgia: 30000-31999
    if (zipNum >= 30000 && zipNum <= 31999) return "GA";
    // North Carolina: 27000-28999
    if (zipNum >= 27000 && zipNum <= 28999) return "NC";
    
    return "DEFAULT";
  };

  useEffect(() => {
    const state = detectStateFromZip(zipCode);
    setDetectedState(state);
  }, [zipCode]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (percentage: number): string => {
    return `${percentage.toFixed(2)}%`;
  };

  const calculateNetSheet = () => {
    const grossPrice = parseFloat(salePrice);
    const mortgage = parseFloat(mortgageBalance || "0");
    const commission = parseFloat(commissionRate);
    const repairCosts = parseFloat(repairs || "0");
    const warranty = parseFloat(homeWarranty || "0");

    if (!grossPrice || grossPrice <= 0) return;

    const state = detectStateFromZip(zipCode);
    const costs = GEOGRAPHIC_COSTS[state] || GEOGRAPHIC_COSTS.DEFAULT;

    const breakdownItems: BreakdownItem[] = [];
    let totalDeductions = 0;

    // Mortgage payoff
    if (mortgage > 0) {
      breakdownItems.push({
        category: "Loan Payoff",
        description: "Existing mortgage balance",
        amount: mortgage,
        percentage: (mortgage / grossPrice) * 100
      });
      totalDeductions += mortgage;
    }

    // Real estate commission
    const commissionAmount = grossPrice * (commission / 100);
    breakdownItems.push({
      category: "Real Estate Commission",
      description: `${commission}% total commission`,
      amount: commissionAmount,
      percentage: commission
    });
    totalDeductions += commissionAmount;

    // Transfer tax
    const transferTaxAmount = grossPrice * (costs.transferTax / 100);
    if (transferTaxAmount > 0) {
      breakdownItems.push({
        category: "Transfer Tax",
        description: `${costs.stateName} transfer tax`,
        amount: transferTaxAmount,
        percentage: costs.transferTax
      });
      totalDeductions += transferTaxAmount;
    }

    // Title insurance
    const titleAmount = grossPrice * (costs.titleInsurance / 100);
    breakdownItems.push({
      category: "Title Insurance",
      description: "Owner's title insurance policy",
      amount: titleAmount,
      percentage: costs.titleInsurance
    });
    totalDeductions += titleAmount;

    // Attorney fees (if applicable)
    if (costs.attorneyFees > 0) {
      breakdownItems.push({
        category: "Attorney Fees",
        description: "Legal representation at closing",
        amount: costs.attorneyFees,
        percentage: (costs.attorneyFees / grossPrice) * 100
      });
      totalDeductions += costs.attorneyFees;
    }

    // Recording fees
    breakdownItems.push({
      category: "Recording Fees",
      description: "Document recording with county",
      amount: costs.recordingFees,
      percentage: (costs.recordingFees / grossPrice) * 100
    });
    totalDeductions += costs.recordingFees;

    // Escrow/settlement fees
    const escrowAmount = grossPrice * (costs.escrowFees / 100);
    breakdownItems.push({
      category: "Escrow/Settlement Fees",
      description: "Third-party transaction management",
      amount: escrowAmount,
      percentage: costs.escrowFees
    });
    totalDeductions += escrowAmount;

    // Property taxes (prorated - assume 6 months average)
    const propertyTaxAmount = (grossPrice * (costs.propertyTaxRate / 100)) / 2;
    breakdownItems.push({
      category: "Prorated Property Taxes",
      description: "Property taxes through closing date",
      amount: propertyTaxAmount,
      percentage: (propertyTaxAmount / grossPrice) * 100
    });
    totalDeductions += propertyTaxAmount;

    // Repairs/concessions
    if (repairCosts > 0) {
      breakdownItems.push({
        category: "Repairs/Concessions",
        description: "Negotiated repairs or buyer concessions",
        amount: repairCosts,
        percentage: (repairCosts / grossPrice) * 100
      });
      totalDeductions += repairCosts;
    }

    // Home warranty
    if (warranty > 0) {
      breakdownItems.push({
        category: "Home Warranty",
        description: "One-year home warranty for buyer",
        amount: warranty,
        percentage: (warranty / grossPrice) * 100
      });
      totalDeductions += warranty;
    }

    const netProceeds = grossPrice - totalDeductions;

    setResult({
      grossSalePrice: grossPrice,
      totalDeductions: totalDeductions,
      netProceeds: netProceeds,
      breakdownItems: breakdownItems.sort((a, b) => b.amount - a.amount)
    });
    setShowResults(true);
  };

  const resetCalculator = () => {
    setSalePrice("");
    setZipCode("");
    setMortgageBalance("");
    setCommissionRate("6.0");
    setRepairs("");
    setHomeWarranty("500");
    setResult(null);
    setShowResults(false);
    setDetectedState("");
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-6 w-6 text-primary" />
          Seller's Net Sheet Calculator
        </CardTitle>
        <CardDescription>
          Calculate your estimated net proceeds from the sale using location-specific costs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!showResults ? (
          <>
            {/* Input Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="salePrice" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Sale Price
                  </Label>
                  <Input
                    id="salePrice"
                    type="number"
                    placeholder="500000"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Expected or agreed sale price
                  </p>
                </div>

                <div>
                  <Label htmlFor="zipCode" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Property Zip Code
                  </Label>
                  <Input
                    id="zipCode"
                    type="text"
                    placeholder="12345"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="mt-1"
                    maxLength={5}
                  />
                  {detectedState && detectedState !== "DEFAULT" && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Detected: {GEOGRAPHIC_COSTS[detectedState].stateName}
                    </p>
                  )}
                  {detectedState === "DEFAULT" && zipCode.length >= 5 && (
                    <p className="text-xs text-orange-600 mt-1">
                      Using national averages for this location
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="mortgage">Current Mortgage Balance</Label>
                  <Input
                    id="mortgage"
                    type="number"
                    placeholder="250000"
                    value={mortgageBalance}
                    onChange={(e) => setMortgageBalance(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Outstanding loan balance (optional)
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="commission">Real Estate Commission (%)</Label>
                  <Input
                    id="commission"
                    type="number"
                    step="0.1"
                    placeholder="6.0"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Total commission for both agents (typical: 5-6%)
                  </p>
                </div>

                <div>
                  <Label htmlFor="repairs">Repairs/Concessions</Label>
                  <Input
                    id="repairs"
                    type="number"
                    placeholder="2000"
                    value={repairs}
                    onChange={(e) => setRepairs(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Negotiated repairs or buyer concessions (optional)
                  </p>
                </div>

                <div>
                  <Label htmlFor="warranty">Home Warranty</Label>
                  <Input
                    id="warranty"
                    type="number"
                    placeholder="500"
                    value={homeWarranty}
                    onChange={(e) => setHomeWarranty(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    One-year home warranty for buyer (optional)
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex gap-3">
              <Button onClick={calculateNetSheet} className="flex-1">
                Calculate Net Proceeds
              </Button>
            </div>

            {/* Info Section */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Location-Based Costs:</strong> This calculator uses average costs for your zip code area.
                Actual costs may vary based on specific title companies, attorneys, and local regulations.
                Always consult with your real estate professional for precise estimates.
              </AlertDescription>
            </Alert>
          </>
        ) : result && (
          <>
            {/* Results Display */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Seller's Net Sheet</h3>
                <Button variant="outline" onClick={resetCalculator}>
                  New Calculation
                </Button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-blue-600">Gross Sale Price</p>
                    <p className="text-2xl font-bold text-blue-800">
                      {formatCurrency(result.grossSalePrice)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-red-50 border-red-200">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-red-600">Total Deductions</p>
                    <p className="text-2xl font-bold text-red-800">
                      {formatCurrency(result.totalDeductions)}
                    </p>
                    <p className="text-xs text-red-600">
                      {formatPercentage((result.totalDeductions / result.grossSalePrice) * 100)} of sale price
                    </p>
                  </CardContent>
                </Card>

                <Card className={`${result.netProceeds > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <CardContent className="p-4 text-center">
                    <p className={`text-sm ${result.netProceeds > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      Net Proceeds
                    </p>
                    <p className={`text-2xl font-bold ${result.netProceeds > 0 ? 'text-green-800' : 'text-red-800'}`}>
                      {formatCurrency(result.netProceeds)}
                    </p>
                    {result.netProceeds <= 0 && (
                      <p className="text-xs text-red-600 mt-1">
                        ⚠️ Costs exceed sale price
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Cost Breakdown</CardTitle>
                  <CardDescription>
                    Based on {GEOGRAPHIC_COSTS[detectedState]?.stateName || "national average"} closing costs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {result.breakdownItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{item.category}</p>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(item.amount)}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatPercentage(item.percentage)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Editable Parameters */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-800">Adjust Parameters</CardTitle>
                  <CardDescription className="text-blue-700">
                    Modify any value below and recalculate to see updated results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="edit-price" className="text-sm font-medium">Sale Price</Label>
                      <Input
                        id="edit-price"
                        type="number"
                        value={salePrice}
                        onChange={(e) => setSalePrice(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-zip" className="text-sm font-medium">Zip Code</Label>
                      <Input
                        id="edit-zip"
                        type="text"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        className="mt-1"
                        maxLength={5}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-mortgage" className="text-sm font-medium">Mortgage Balance</Label>
                      <Input
                        id="edit-mortgage"
                        type="number"
                        value={mortgageBalance}
                        onChange={(e) => setMortgageBalance(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-commission" className="text-sm font-medium">Commission (%)</Label>
                      <Input
                        id="edit-commission"
                        type="number"
                        step="0.1"
                        value={commissionRate}
                        onChange={(e) => setCommissionRate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-repairs" className="text-sm font-medium">Repairs/Concessions</Label>
                      <Input
                        id="edit-repairs"
                        type="number"
                        value={repairs}
                        onChange={(e) => setRepairs(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-warranty" className="text-sm font-medium">Home Warranty</Label>
                      <Input
                        id="edit-warranty"
                        type="number"
                        value={homeWarranty}
                        onChange={(e) => setHomeWarranty(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-4">
                    <Button onClick={calculateNetSheet} className="flex-1">
                      Recalculate
                    </Button>
                    <Button variant="outline" onClick={resetCalculator}>
                      Start Over
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}