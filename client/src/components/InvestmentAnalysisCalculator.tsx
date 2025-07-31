import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calculator, 
  DollarSign, 
  Home, 
  TrendingUp, 
  Building,
  Percent,
  Target,
  Edit,
  RotateCcw,
  Plus,
  Trash2
} from "lucide-react";

interface UnitData {
  id: number;
  currentRent: number;
  repairCosts: number;
  potentialRent: number;
  marketValue: number;
  bedrooms: number;
  bathrooms: number;
}

interface RenovationItem {
  id: number;
  category: string;
  cost: number;
}

interface CalculationResults {
  totalIncome: number;
  totalExpenses: number;
  netOperatingIncome: number;
  capRate: number;
  cashOnCashReturn: number;
  totalCashInvested: number;
  annualCashFlow: number;
  monthlyUnits: number;
  currentCapRate: number;
  improvedCapRate: number;
  totalRepairCosts: number;
  totalIncomeIncrease: number;
  valueGain: number;
  debtServiceCoverageRatio: number;
  projections: {
    year3: {
      rent: number;
      propertyValue: number;
      cashFlow: number;
      equity: number;
      capRate: number;
      roi: number;
    };
    year5: {
      rent: number;
      propertyValue: number;
      cashFlow: number;
      equity: number;
      capRate: number;
      roi: number;
    };
  };
}

export default function InvestmentAnalysisCalculator() {
  // Property details
  const [propertyValue, setPropertyValue] = useState<string>("500000");
  const [downPayment, setDownPayment] = useState<string>("100000");
  const [closingCosts, setClosingCosts] = useState<string>("15000");
  const [renovationCosts, setRenovationCosts] = useState<string>("0");
  
  // Renovation items
  const [renovationItems, setRenovationItems] = useState<RenovationItem[]>([]);
  const [nextRenovationId, setNextRenovationId] = useState<number>(1);
  
  const renovationCategories = [
    "Landscaping",
    "Roof",
    "Painting/Pressure Washing", 
    "Doors and Windows",
    "Lighting and Security",
    "Kitchen",
    "Bathroom",
    "Flooring",
    "HVAC",
    "Plumbing",
    "Electrical",
    "Other"
  ];
  
  // Unit configuration
  const [numberOfUnits, setNumberOfUnits] = useState<string>("1");
  const [units, setUnits] = useState<UnitData[]>([
    { id: 1, currentRent: 0, repairCosts: 0, potentialRent: 0, marketValue: 0, bedrooms: 0, bathrooms: 0 }
  ]);
  
  // Income
  const [otherIncome, setOtherIncome] = useState<string>("0");
  
  // Current Expenses (monthly)
  const [currentInsurance, setCurrentInsurance] = useState<string>("200");
  const [currentPropertyTaxes, setCurrentPropertyTaxes] = useState<string>("400");
  const [currentMaintenance, setCurrentMaintenance] = useState<string>("300");
  const [currentManagementPercent, setCurrentManagementPercent] = useState<string>("8");
  const [currentVacancy, setCurrentVacancy] = useState<string>("5");
  const [currentOtherExpenses, setCurrentOtherExpenses] = useState<string>("100");
  
  // Projected Expenses (monthly)
  const [projectedInsurance, setProjectedInsurance] = useState<string>("250");
  const [projectedPropertyTaxes, setProjectedPropertyTaxes] = useState<string>("500");
  const [projectedMaintenance, setProjectedMaintenance] = useState<string>("400");
  const [projectedManagementPercent, setProjectedManagementPercent] = useState<string>("8");
  const [projectedVacancy, setProjectedVacancy] = useState<string>("3");
  const [projectedOtherExpenses, setProjectedOtherExpenses] = useState<string>("150");
  
  // Mortgage details
  const [loanAmount, setLoanAmount] = useState<string>("400000");
  const [interestRate, setInterestRate] = useState<string>("7.5");
  const [loanTerm, setLoanTerm] = useState<string>("30");
  
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [showResults, setShowResults] = useState(false);
  
  // Target analysis
  const [showTargetAnalysis, setShowTargetAnalysis] = useState(false);
  const [targetCapRate, setTargetCapRate] = useState<string>("8");
  const [targetCashOnCash, setTargetCashOnCash] = useState<string>("12");
  const [targetResults, setTargetResults] = useState<{
    recommendedPurchasePrice: number;
    maxOfferPrice: number;
    capRateBasedPrice: number;
    cashOnCashBasedPrice: number;
  } | null>(null);

  // Auto-calculate total renovation costs when components change
  useEffect(() => {
    const repairTotal = getTotalRepairCosts();
    const itemizedTotal = getTotalRenovationCost();
    const total = repairTotal + itemizedTotal;
    setRenovationCosts(total.toString());
  }, [renovationItems, units]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (ratio: number): string => {
    return `${ratio.toFixed(2)}%`;
  };

  const calculateMonthlyMortgagePayment = (principal: number, rate: number, years: number): number => {
    const monthlyRate = rate / 100 / 12;
    const numPayments = years * 12;
    if (monthlyRate === 0) return principal / numPayments;
    
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
           (Math.pow(1 + monthlyRate, numPayments) - 1);
  };

  // Update units when number changes
  const updateUnitsCount = (newCount: string) => {
    const count = parseInt(newCount) || 1;
    setNumberOfUnits(newCount);
    
    const newUnits = [...units];
    
    if (count > units.length) {
      // Add new units
      for (let i = units.length; i < count; i++) {
        newUnits.push({
          id: i + 1,
          currentRent: 0,
          repairCosts: 0,
          potentialRent: 0,
          marketValue: 0,
          bedrooms: 0,
          bathrooms: 0
        });
      }
    } else if (count < units.length) {
      // Remove excess units
      newUnits.splice(count);
    }
    
    setUnits(newUnits);
    
    // Update renovation costs after unit count changes
    const newRepairTotal = newUnits.reduce((total, unit) => total + unit.repairCosts, 0);
    const itemizedTotal = getTotalRenovationCost();
    setRenovationCosts((newRepairTotal + itemizedTotal).toString());
  };

  const updateUnit = (unitId: number, field: keyof Omit<UnitData, 'id'>, value: number | string) => {
    setUnits(prevUnits => {
      const updatedUnits = prevUnits.map(unit =>
        unit.id === unitId ? { 
          ...unit, 
          [field]: value === '' ? 0 : Number(value) || 0 
        } : unit
      );
      
      // Auto-update general renovation costs when repair costs change
      if (field === 'repairCosts') {
        const newRepairTotal = updatedUnits.reduce((total, unit) => total + unit.repairCosts, 0);
        const itemizedTotal = getTotalRenovationCost();
        setRenovationCosts((newRepairTotal + itemizedTotal).toString());
      }
      
      return updatedUnits;
    });
  };

  const clearUnit = (unitId: number) => {
    setUnits(prevUnits => {
      const updatedUnits = prevUnits.map(unit =>
        unit.id === unitId ? {
          ...unit,
          currentRent: 0,
          repairCosts: 0,
          potentialRent: 0,
          marketValue: 0,
          bedrooms: 0,
          bathrooms: 0
        } : unit
      );
      
      // Auto-update general renovation costs when repair costs are cleared
      const newRepairTotal = updatedUnits.reduce((total, unit) => total + unit.repairCosts, 0);
      const itemizedTotal = getTotalRenovationCost();
      setRenovationCosts((newRepairTotal + itemizedTotal).toString());
      
      return updatedUnits;
    });
  };

  const addRenovationItem = () => {
    const newItem: RenovationItem = {
      id: nextRenovationId,
      category: "",
      cost: 0
    };
    setRenovationItems(prev => [...prev, newItem]);
    setNextRenovationId(prev => prev + 1);
  };

  const updateRenovationItem = (id: number, field: keyof Omit<RenovationItem, 'id'>, value: string | number) => {
    setRenovationItems(prev => {
      const updatedItems = prev.map(item =>
        item.id === id ? { ...item, [field]: field === 'cost' ? Number(value) || 0 : value } : item
      );
      
      // Auto-update general renovation costs when itemized costs change
      if (field === 'cost') {
        const newTotal = updatedItems.reduce((total, item) => total + item.cost, 0) + getTotalRepairCosts();
        setRenovationCosts(newTotal.toString());
      }
      
      return updatedItems;
    });
  };

  const removeRenovationItem = (id: number) => {
    setRenovationItems(prev => {
      const updatedItems = prev.filter(item => item.id !== id);
      
      // Auto-update general renovation costs when items are removed
      const newTotal = updatedItems.reduce((total, item) => total + item.cost, 0) + getTotalRepairCosts();
      setRenovationCosts(newTotal.toString());
      
      return updatedItems;
    });
  };

  const getTotalRenovationCost = () => {
    return renovationItems.reduce((total, item) => total + item.cost, 0);
  };

  const getTotalRepairCosts = () => {
    return units.reduce((total, unit) => total + unit.repairCosts, 0);
  };

  const getCalculatedRenovationTotal = () => {
    return getTotalRenovationCost() + getTotalRepairCosts();
  };

  const calculateInvestmentAnalysis = () => {
    setShowResults(false); // Reset to show fresh results
    const monthlyOtherIncome = parseFloat(otherIncome) || 0;
    
    // Calculate current and potential income from units
    const currentAnnualRentalIncome = units.reduce((total, unit) => total + (unit.currentRent * 12), 0);
    const potentialAnnualRentalIncome = units.reduce((total, unit) => total + (unit.potentialRent * 12), 0);
    const totalRepairCosts = units.reduce((total, unit) => total + unit.repairCosts, 0);
    
    const annualOtherIncome = monthlyOtherIncome * 12;
    const currentGrossIncome = currentAnnualRentalIncome + annualOtherIncome;
    const potentialGrossIncome = potentialAnnualRentalIncome + annualOtherIncome;
    
    // Vacancy adjustment
    const currentVacancyRate = parseFloat(currentVacancy) / 100 || 0;
    const projectedVacancyRate = parseFloat(projectedVacancy) / 100 || 0;
    const currentEffectiveIncome = currentGrossIncome * (1 - currentVacancyRate);
    const potentialEffectiveIncome = potentialGrossIncome * (1 - projectedVacancyRate);
    
    // Annual expenses - Current
    const currentAnnualInsurance = (parseFloat(currentInsurance) || 0) * 12;
    const currentAnnualPropertyTaxes = (parseFloat(currentPropertyTaxes) || 0) * 12;
    const currentAnnualMaintenance = (parseFloat(currentMaintenance) || 0) * 12;
    const currentAnnualOtherExpenses = (parseFloat(currentOtherExpenses) || 0) * 12;
    
    // Annual expenses - Projected
    const projectedAnnualInsurance = (parseFloat(projectedInsurance) || 0) * 12;
    const projectedAnnualPropertyTaxes = (parseFloat(projectedPropertyTaxes) || 0) * 12;
    const projectedAnnualMaintenance = (parseFloat(projectedMaintenance) || 0) * 12;
    const projectedAnnualOtherExpenses = (parseFloat(projectedOtherExpenses) || 0) * 12;
    
    // Management fees
    const currentManagementRate = parseFloat(currentManagementPercent) / 100 || 0;
    const projectedManagementRate = parseFloat(projectedManagementPercent) / 100 || 0;
    const currentManagementFees = currentEffectiveIncome * currentManagementRate;
    const projectedManagementFees = potentialEffectiveIncome * projectedManagementRate;
    
    const currentOperatingExpenses = currentAnnualInsurance + currentAnnualPropertyTaxes + 
                                   currentAnnualMaintenance + currentManagementFees + currentAnnualOtherExpenses;
    const projectedOperatingExpenses = projectedAnnualInsurance + projectedAnnualPropertyTaxes + 
                                     projectedAnnualMaintenance + projectedManagementFees + projectedAnnualOtherExpenses;
    
    // Net Operating Income
    const currentNOI = currentEffectiveIncome - currentOperatingExpenses;
    const projectedNOI = potentialEffectiveIncome - projectedOperatingExpenses;
    
    // Mortgage payment
    const loanPrincipal = parseFloat(loanAmount) || 0;
    const rate = parseFloat(interestRate) || 0;
    const years = parseInt(loanTerm) || 30;
    const monthlyMortgagePayment = loanPrincipal > 0 ? 
      calculateMonthlyMortgagePayment(loanPrincipal, rate, years) : 0;
    const annualDebtService = monthlyMortgagePayment * 12;
    
    // Cash flow
    const currentCashFlow = currentNOI - annualDebtService;
    const projectedCashFlow = projectedNOI - annualDebtService;
    
    // Cap rates
    const propValue = parseFloat(propertyValue) || 1;
    const currentCapRate = (currentNOI / propValue) * 100;
    const improvedPropertyValue = propValue + totalRepairCosts;
    const projectedCapRate = (projectedNOI / improvedPropertyValue) * 100;
    
    // Value gain calculation
    const valueGain = (projectedNOI - currentNOI) / (currentCapRate / 100);
    
    // Cash-on-cash return
    const downPmt = parseFloat(downPayment) || 0;
    const closing = parseFloat(closingCosts) || 0;
    const renovation = parseFloat(renovationCosts) || 0;
    const totalCashInvested = downPmt + closing + renovation;
    
    const cashOnCashReturn = totalCashInvested > 0 ? 
      (projectedCashFlow / totalCashInvested) * 100 : 0;

    // Debt Service Coverage Ratio (DSCR)
    const debtServiceCoverageRatio = annualDebtService > 0 ? 
      projectedNOI / annualDebtService : 0;

    // 3-year and 5-year projections
    const calculateProjections = (years: number) => {
      const rentGrowthRate = 0.05; // 5% annual rent increase
      const appreciationRate = 0.03; // 3% annual property appreciation
      
      const futureRent = potentialAnnualRentalIncome * Math.pow(1 + rentGrowthRate, years);
      const futureGrossIncome = futureRent + annualOtherIncome;
      const futureEffectiveIncome = futureGrossIncome * (1 - projectedVacancyRate);
      const futureNOI = futureEffectiveIncome - projectedOperatingExpenses;
      const futureCashFlow = futureNOI - annualDebtService;
      
      const futurePropertyValue = propValue * Math.pow(1 + appreciationRate, years);
      
      // Calculate equity (property value - remaining loan balance)
      // Start with the current loan balance as entered by user
      const currentLoanBalance = parseFloat(loanAmount) || 0;
      const monthlyPayments = years * 12;
      const monthlyRate = rate / 100 / 12;
      let remainingBalance = currentLoanBalance;
      
      if (monthlyRate > 0 && currentLoanBalance > 0) {
        // Calculate remaining balance after years of payments
        const loanTermYears = parseInt(loanTerm) || 30;
        const totalPayments = loanTermYears * 12;
        const monthlyPayment = monthlyMortgagePayment; // Use the already calculated payment
        
        // Calculate remaining balance after years of payments using standard amortization
        const paymentsRemaining = totalPayments - monthlyPayments;
        if (paymentsRemaining > 0) {
          remainingBalance = monthlyPayment * ((Math.pow(1 + monthlyRate, paymentsRemaining) - 1) / 
                            (monthlyRate * Math.pow(1 + monthlyRate, paymentsRemaining)));
        } else {
          remainingBalance = 0; // Loan paid off
        }
      } else if (currentLoanBalance > 0) {
        // Simple calculation if no interest
        remainingBalance = Math.max(0, currentLoanBalance - (monthlyMortgagePayment * monthlyPayments));
      }
      
      const equity = futurePropertyValue - Math.max(0, remainingBalance);
      
      // Calculate future cap rate and ROI
      const futureCapRate = futurePropertyValue > 0 ? (futureNOI / futurePropertyValue) * 100 : 0;
      const totalCashInvested = downPmt + closing + renovation;
      const futureROI = totalCashInvested > 0 ? (futureCashFlow / totalCashInvested) * 100 : 0;
      
      return {
        rent: futureRent,
        propertyValue: futurePropertyValue,
        cashFlow: futureCashFlow,
        equity: equity,
        capRate: futureCapRate,
        roi: futureROI
      };
    };

    const projections = {
      year3: calculateProjections(3),
      year5: calculateProjections(5)
    };

    const calculationResults: CalculationResults = {
      totalIncome: potentialEffectiveIncome,
      totalExpenses: projectedOperatingExpenses,
      netOperatingIncome: projectedNOI,
      capRate: projectedCapRate,
      cashOnCashReturn,
      totalCashInvested,
      annualCashFlow: projectedCashFlow,
      monthlyUnits: units.length,
      currentCapRate,
      improvedCapRate: projectedCapRate,
      totalRepairCosts,
      totalIncomeIncrease: potentialAnnualRentalIncome - currentAnnualRentalIncome,
      valueGain,
      debtServiceCoverageRatio,
      projections
    };

    setResults(calculationResults);
    setShowResults(true);
  };

  const resetCalculator = () => {
    setPropertyValue("500000");
    setDownPayment("100000");
    setClosingCosts("15000");
    setRenovationCosts("0");
    setRenovationItems([]);
    setNextRenovationId(1);
    setNumberOfUnits("1");
    setUnits([
      { id: 1, currentRent: 0, repairCosts: 0, potentialRent: 0, marketValue: 0, bedrooms: 0, bathrooms: 0 }
    ]);
    setOtherIncome("0");
    // Reset current expenses
    setCurrentInsurance("200");
    setCurrentPropertyTaxes("400");
    setCurrentMaintenance("300");
    setCurrentManagementPercent("8");
    setCurrentVacancy("5");
    setCurrentOtherExpenses("100");
    // Reset projected expenses
    setProjectedInsurance("250");
    setProjectedPropertyTaxes("500");
    setProjectedMaintenance("400");
    setProjectedManagementPercent("8");
    setProjectedVacancy("3");
    setProjectedOtherExpenses("150");
    setLoanAmount("400000");
    setInterestRate("7.5");
    setLoanTerm("30");
    setResults(null);
    setShowResults(false);
    setShowTargetAnalysis(false);
    setTargetResults(null);
  };

  const calculateTargetAnalysis = () => {
    if (!results) return;

    const targetCapRateDecimal = parseFloat(targetCapRate) / 100 || 0.08;
    const targetCashOnCashDecimal = parseFloat(targetCashOnCash) / 100 || 0.12;
    
    // Calculate price based on desired cap rate
    // Cap Rate = NOI / Property Value, so Property Value = NOI / Cap Rate
    const capRateBasedPrice = results.netOperatingIncome / targetCapRateDecimal;
    
    // Calculate price based on desired cash-on-cash return
    // Cash-on-Cash = Cash Flow / Cash Invested
    // We need to work backwards: if we want X% return on our cash invested
    // And we know our cash flow after debt service
    const totalCashInvested = results.totalCashInvested;
    const desiredCashFlow = totalCashInvested * targetCashOnCashDecimal;
    
    // Current cash flow calculation: NOI - Debt Service
    // We need to find a price where: NOI - Debt Service = Desired Cash Flow
    // But NOI will change with property value (due to property taxes, etc.)
    // For simplicity, we'll use the current NOI and adjust for debt service
    const currentDebtService = results.netOperatingIncome - results.annualCashFlow;
    const requiredNOI = desiredCashFlow + currentDebtService;
    const cashOnCashBasedPrice = requiredNOI / targetCapRateDecimal;
    
    // Recommended price is the lower of the two (more conservative)
    const recommendedPrice = Math.min(capRateBasedPrice, cashOnCashBasedPrice);
    
    // Max offer price (assuming 90% of recommended for negotiation room)
    const maxOfferPrice = recommendedPrice * 0.90;
    
    setTargetResults({
      recommendedPurchasePrice: recommendedPrice,
      maxOfferPrice: maxOfferPrice,
      capRateBasedPrice: capRateBasedPrice,
      cashOnCashBasedPrice: cashOnCashBasedPrice
    });
    
    setShowTargetAnalysis(true);
  };

  // Auto-calculate loan amount and closing costs when property value or down payment changes
  const handlePropertyValueChange = (value: string) => {
    setPropertyValue(value);
    const propVal = parseFloat(value) || 0;
    const downPmt = parseFloat(downPayment) || 0;
    
    // Auto-calculate closing costs at 3% of property value
    const calculatedClosingCosts = Math.round(propVal * 0.03);
    setClosingCosts(calculatedClosingCosts.toString());
    
    if (propVal > downPmt) {
      setLoanAmount((propVal - downPmt).toString());
    }
  };

  const handleDownPaymentChange = (value: string) => {
    setDownPayment(value);
    const propVal = parseFloat(propertyValue) || 0;
    const downPmt = parseFloat(value) || 0;
    if (propVal > downPmt) {
      setLoanAmount((propVal - downPmt).toString());
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-6 w-6 text-primary" />
          Investment Analysis Calculator
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Calculate cap rates and cash-on-cash returns for rental properties (1-100 units)
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {!showResults ? (
          <>
            {/* Property Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Home className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Property Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="propertyValue">Asking Price</Label>
                  <Input
                    id="propertyValue"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="500000"
                    value={propertyValue}
                    onChange={(e) => handlePropertyValueChange(e.target.value.replace(/[^0-9]/g, ''))}
                  />
                </div>
                <div>
                  <Label htmlFor="downPayment">Down Payment</Label>
                  <Input
                    id="downPayment"
                    type="number"
                    placeholder="100000"
                    value={downPayment}
                    onChange={(e) => handleDownPaymentChange(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="closingCosts">Closing Costs</Label>
                  <Input
                    id="closingCosts"
                    type="number"
                    placeholder="15000"
                    value={closingCosts}
                    onChange={(e) => setClosingCosts(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Auto-calculated at 3% of asking price (editable)
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="renovationCosts">Total Renovation Costs</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                    <Input
                      id="renovationCosts"
                      type="number"
                      placeholder="0"
                      value={renovationCosts}
                      onChange={(e) => setRenovationCosts(e.target.value)}
                      className="pl-7 bg-gray-50 dark:bg-gray-900"
                      readOnly
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Auto-calculated from unit repair costs + itemized renovation costs
                  </p>
                </div>
                <div>
                  <Label htmlFor="numberOfUnits">Number of Units (1-100)</Label>
                  <Input
                    id="numberOfUnits"
                    type="number"
                    min="1"
                    max="100"
                    placeholder="1"
                    value={numberOfUnits}
                    onChange={(e) => updateUnitsCount(e.target.value)}
                  />
                </div>
              </div>

              {/* Itemized Renovation Costs */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-green-600" />
                    <h4 className="text-base font-semibold">Itemized Renovation Costs</h4>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addRenovationItem}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Button>
                </div>

                {renovationItems.length > 0 && (
                  <div className="space-y-3">
                    {renovationItems.map((item) => (
                      <div key={item.id} className="flex gap-3 items-end">
                        <div className="flex-1">
                          <Label htmlFor={`category-${item.id}`}>Category</Label>
                          <Select
                            value={item.category}
                            onValueChange={(value) => updateRenovationItem(item.id, 'category', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {renovationCategories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1">
                          <Label htmlFor={`cost-${item.id}`}>Cost</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                            <Input
                              id={`cost-${item.id}`}
                              type="number"
                              value={item.cost || ''}
                              onChange={(e) => updateRenovationItem(item.id, 'cost', e.target.value)}
                              className="pl-7 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              placeholder="0"
                              min="0"
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeRenovationItem(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    <div className="flex justify-end pt-2">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Itemized Costs:</p>
                        <p className="text-lg font-semibold text-green-600">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            maximumFractionDigits: 0,
                          }).format(getTotalRenovationCost())}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {renovationItems.length === 0 && (
                  <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                    <Home className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No renovation items added yet</p>
                    <p className="text-sm text-gray-400">Click "Add Item" to start itemizing your renovation costs</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Unit Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Building className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Unit Details</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-3 py-2 text-left">Unit #</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">Bed/Bath</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">Current Rent</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">Repair Costs</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">Potential/Market Value</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {units.map((unit) => (
                      <tr key={unit.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-3 py-2 font-medium">
                          Unit {unit.id}
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          <div className="flex gap-1">
                            <Input
                              type="number"
                              value={unit.bedrooms || ''}
                              onChange={(e) => updateUnit(unit.id, 'bedrooms', e.target.value)}
                              className="w-16"
                              placeholder="0"
                              min="0"
                              max="10"
                            />
                            <span className="self-center text-xs text-gray-500">bed</span>
                            <Input
                              type="number"
                              value={unit.bathrooms || ''}
                              onChange={(e) => updateUnit(unit.id, 'bathrooms', e.target.value)}
                              className="w-16"
                              placeholder="0"
                              min="0"
                              max="10"
                              step="0.5"
                            />
                            <span className="self-center text-xs text-gray-500">bath</span>
                          </div>
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                            <Input
                              type="number"
                              value={unit.currentRent || ''}
                              onChange={(e) => updateUnit(unit.id, 'currentRent', e.target.value)}
                              className="w-full pl-7 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              placeholder="0"
                            />
                          </div>
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                            <Input
                              type="number"
                              value={unit.repairCosts || ''}
                              onChange={(e) => updateUnit(unit.id, 'repairCosts', e.target.value)}
                              className="w-full pl-7 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              placeholder="0"
                              min="0"
                            />
                          </div>
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                            <Input
                              type="number"
                              value={unit.potentialRent || ''}
                              onChange={(e) => updateUnit(unit.id, 'potentialRent', e.target.value)}
                              className="w-full pl-7 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              placeholder="0"
                            />
                          </div>
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => clearUnit(unit.id)}
                            className="text-xs"
                          >
                            Clear Unit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4">
                <div>
                  <Label htmlFor="otherIncome">Other Monthly Income</Label>
                  <Input
                    id="otherIncome"
                    type="number"
                    placeholder="0"
                    value={otherIncome}
                    onChange={(e) => setOtherIncome(e.target.value)}
                    className="max-w-xs"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Laundry, parking, storage, etc.
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Expenses */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Building className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-semibold">Monthly Expenses</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Current Expenses */}
                <div className="space-y-4">
                  <h4 className="font-medium text-orange-700 bg-orange-50 px-3 py-2 rounded">Current Expenses</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="currentInsurance">Insurance</Label>
                      <Input
                        id="currentInsurance"
                        type="number"
                        placeholder="200"
                        value={currentInsurance}
                        onChange={(e) => setCurrentInsurance(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="currentPropertyTaxes">Property Taxes</Label>
                      <Input
                        id="currentPropertyTaxes"
                        type="number"
                        placeholder="400"
                        value={currentPropertyTaxes}
                        onChange={(e) => setCurrentPropertyTaxes(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="currentMaintenance">Maintenance & Repairs</Label>
                      <Input
                        id="currentMaintenance"
                        type="number"
                        placeholder="300"
                        value={currentMaintenance}
                        onChange={(e) => setCurrentMaintenance(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="currentManagementPercent">Management (% of income)</Label>
                      <Input
                        id="currentManagementPercent"
                        type="number"
                        step="0.1"
                        placeholder="8"
                        value={currentManagementPercent}
                        onChange={(e) => setCurrentManagementPercent(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Typical range: 6-12%
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="currentVacancy">Vacancy Rate (%)</Label>
                      <Input
                        id="currentVacancy"
                        type="number"
                        step="0.1"
                        placeholder="5"
                        value={currentVacancy}
                        onChange={(e) => setCurrentVacancy(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Typical range: 3-8%
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="currentOtherExpenses">Other Expenses</Label>
                      <Input
                        id="currentOtherExpenses"
                        type="number"
                        placeholder="100"
                        value={currentOtherExpenses}
                        onChange={(e) => setCurrentOtherExpenses(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Legal, accounting, etc.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Projected Expenses */}
                <div className="space-y-4">
                  <h4 className="font-medium text-green-700 bg-green-50 px-3 py-2 rounded">Projected Expenses</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="projectedInsurance">Insurance</Label>
                      <Input
                        id="projectedInsurance"
                        type="number"
                        placeholder="250"
                        value={projectedInsurance}
                        onChange={(e) => setProjectedInsurance(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="projectedPropertyTaxes">Property Taxes</Label>
                      <Input
                        id="projectedPropertyTaxes"
                        type="number"
                        placeholder="500"
                        value={projectedPropertyTaxes}
                        onChange={(e) => setProjectedPropertyTaxes(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="projectedMaintenance">Maintenance & Repairs</Label>
                      <Input
                        id="projectedMaintenance"
                        type="number"
                        placeholder="400"
                        value={projectedMaintenance}
                        onChange={(e) => setProjectedMaintenance(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="projectedManagementPercent">Management (% of income)</Label>
                      <Input
                        id="projectedManagementPercent"
                        type="number"
                        step="0.1"
                        placeholder="8"
                        value={projectedManagementPercent}
                        onChange={(e) => setProjectedManagementPercent(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Typical range: 6-12%
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="projectedVacancy">Vacancy Rate (%)</Label>
                      <Input
                        id="projectedVacancy"
                        type="number"
                        step="0.1"
                        placeholder="3"
                        value={projectedVacancy}
                        onChange={(e) => setProjectedVacancy(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Typical range: 3-8%
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="projectedOtherExpenses">Other Expenses</Label>
                      <Input
                        id="projectedOtherExpenses"
                        type="number"
                        placeholder="150"
                        value={projectedOtherExpenses}
                        onChange={(e) => setProjectedOtherExpenses(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Legal, accounting, etc.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Financing */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Percent className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Financing</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="loanAmount">Loan Amount</Label>
                  <Input
                    id="loanAmount"
                    type="number"
                    placeholder="400000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Auto-calculated from property value - down payment
                  </p>
                </div>
                <div>
                  <Label htmlFor="interestRate">Interest Rate (%)</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    step="0.1"
                    placeholder="7.5"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="loanTerm">Loan Term (years)</Label>
                  <Input
                    id="loanTerm"
                    type="number"
                    placeholder="30"
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={calculateInvestmentAnalysis} className="flex-1">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Investment Analysis
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Results Display */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Investment Analysis Results</h3>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowResults(false)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Inputs
                  </Button>
                  <Button variant="outline" onClick={resetCalculator}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    New Analysis
                  </Button>
                </div>
              </div>

              {/* Key Metrics */}
              {results && (
                <div className="space-y-6">
                  {/* Current vs Improved Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-orange-50 border-orange-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-orange-800">Current Performance</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Cap Rate:</span>
                          <span className="text-lg font-bold text-orange-700">
                            {formatPercentage(results.currentCapRate)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Annual Income:</span>
                          <span className="font-medium">
                            {formatCurrency(units.reduce((total, unit) => total + (unit.currentRent * 12), 0))}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Property Value:</span>
                          <span className="font-medium">
                            {formatCurrency(parseFloat(propertyValue))}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-green-50 border-green-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-green-800">After Improvements</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Cap Rate:</span>
                          <span className="text-lg font-bold text-green-700">
                            {formatPercentage(results.improvedCapRate)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Annual Income:</span>
                          <span className="font-medium">
                            {formatCurrency(units.reduce((total, unit) => total + (unit.potentialRent * 12), 0))}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Property Value:</span>
                          <span className="font-medium">
                            {formatCurrency(parseFloat(propertyValue) + results.totalRepairCosts)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Value Gain Analysis */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-blue-800">Investment Analysis Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                          <p className="text-sm font-medium text-blue-700 mb-2">Total Repair Investment</p>
                          <p className="text-2xl font-bold text-blue-800">
                            {formatCurrency(results.totalRepairCosts)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-blue-700 mb-2">Annual Income Increase</p>
                          <p className="text-2xl font-bold text-blue-800">
                            {formatCurrency(results.totalIncomeIncrease)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-blue-700 mb-2">Estimated Value Gain</p>
                          <p className="text-2xl font-bold text-blue-800">
                            {formatCurrency(results.valueGain)}
                          </p>
                          <p className="text-xs text-blue-600 mt-2 px-2">
                            Property value increase based on improved income divided by current cap rate
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-5 w-5 text-blue-600" />
                          <p className="text-sm font-medium text-blue-800">Cash-on-Cash Return</p>
                        </div>
                        <p className="text-2xl font-bold text-blue-700">
                          {formatPercentage(results.cashOnCashReturn)}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          Annual return on cash invested
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-purple-50 border-purple-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="h-5 w-5 text-purple-600" />
                          <p className="text-sm font-medium text-purple-800">Annual Cash Flow</p>
                        </div>
                        <p className="text-2xl font-bold text-purple-700">
                          {formatCurrency(results.annualCashFlow)}
                        </p>
                        <p className="text-xs text-purple-600 mt-1">
                          {formatCurrency(results.annualCashFlow / 12)}/month
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="h-5 w-5 text-green-600" />
                          <p className="text-sm font-medium text-green-800">Improved NOI</p>
                        </div>
                        <p className="text-2xl font-bold text-green-700">
                          {formatCurrency(results.netOperatingIncome)}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Net Operating Income
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-orange-50 border-orange-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Building className="h-5 w-5 text-orange-600" />
                          <p className="text-sm font-medium text-orange-800">Debt Service Coverage</p>
                        </div>
                        <p className="text-2xl font-bold text-orange-700">
                          {results.debtServiceCoverageRatio.toFixed(2)}x
                        </p>
                        <p className="text-xs text-orange-600 mt-1">
                          {results.debtServiceCoverageRatio >= 1.25 ? "Strong Coverage" : 
                           results.debtServiceCoverageRatio >= 1.0 ? "Adequate Coverage" : "Insufficient Coverage"}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Future Projections */}
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="text-lg text-indigo-800">Future Projections</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Based on 5% annual rent growth and 3% property appreciation
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 3-Year Projection */}
                        <div className="bg-indigo-50 p-4 rounded-lg border-2 border-indigo-200">
                          <h4 className="text-lg font-semibold text-indigo-800 mb-3">3-Year Projection</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-sm text-indigo-700">Annual Rental Income:</span>
                              <span className="font-semibold text-indigo-800">
                                {formatCurrency(results.projections.year3.rent)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-indigo-700">Property Value:</span>
                              <span className="font-semibold text-indigo-800">
                                {formatCurrency(results.projections.year3.propertyValue)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-indigo-700">Annual Cash Flow:</span>
                              <span className="font-semibold text-indigo-800">
                                {formatCurrency(results.projections.year3.cashFlow)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-indigo-700">Cap Rate:</span>
                              <span className="font-semibold text-indigo-800">
                                {results.projections.year3.capRate.toFixed(2)}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-indigo-700">Cash-on-Cash ROI:</span>
                              <span className="font-semibold text-indigo-800">
                                {results.projections.year3.roi.toFixed(2)}%
                              </span>
                            </div>
                            <div className="mt-3 pt-2 border-t border-indigo-200">
                              <p className="text-xs text-indigo-600 mb-1">
                                <strong>Cap Rate:</strong> Net Operating Income ÷ Property Value (measures property's income efficiency)
                              </p>
                              <p className="text-xs text-indigo-600">
                                <strong>Cash-on-Cash ROI:</strong> Annual Cash Flow ÷ Total Cash Invested (measures return on your cash)
                              </p>
                            </div>
                            <div className="border-t border-indigo-200 pt-2 mt-2">
                              <div className="text-xs text-indigo-600 mb-2 font-medium">Equity Breakdown:</div>
                              <div className="flex justify-between text-xs">
                                <span className="text-indigo-600">Property Value:</span>
                                <span className="text-indigo-700">
                                  {formatCurrency(results.projections.year3.propertyValue)}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-indigo-600">- Remaining Loan:</span>
                                <span className="text-indigo-700">
                                  -{formatCurrency(results.projections.year3.propertyValue - results.projections.year3.equity)}
                                </span>
                              </div>
                              <div className="flex justify-between border-t border-indigo-200 pt-1 mt-1">
                                <span className="text-sm font-medium text-indigo-700">= Net Equity:</span>
                                <span className="font-semibold text-indigo-800">
                                  {formatCurrency(results.projections.year3.equity)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 5-Year Projection */}
                        <div className="bg-emerald-50 p-4 rounded-lg border-2 border-emerald-200">
                          <h4 className="text-lg font-semibold text-emerald-800 mb-3">5-Year Projection</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-sm text-emerald-700">Annual Rental Income:</span>
                              <span className="font-semibold text-emerald-800">
                                {formatCurrency(results.projections.year5.rent)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-emerald-700">Property Value:</span>
                              <span className="font-semibold text-emerald-800">
                                {formatCurrency(results.projections.year5.propertyValue)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-emerald-700">Annual Cash Flow:</span>
                              <span className="font-semibold text-emerald-800">
                                {formatCurrency(results.projections.year5.cashFlow)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-emerald-700">Cap Rate:</span>
                              <span className="font-semibold text-emerald-800">
                                {results.projections.year5.capRate.toFixed(2)}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-emerald-700">Cash-on-Cash ROI:</span>
                              <span className="font-semibold text-emerald-800">
                                {results.projections.year5.roi.toFixed(2)}%
                              </span>
                            </div>
                            <div className="mt-3 pt-2 border-t border-emerald-200">
                              <p className="text-xs text-emerald-600 mb-1">
                                <strong>Cap Rate:</strong> Net Operating Income ÷ Property Value (measures property's income efficiency)
                              </p>
                              <p className="text-xs text-emerald-600">
                                <strong>Cash-on-Cash ROI:</strong> Annual Cash Flow ÷ Total Cash Invested (measures return on your cash)
                              </p>
                            </div>
                            <div className="border-t border-emerald-200 pt-2 mt-2">
                              <div className="text-xs text-emerald-600 mb-2 font-medium">Equity Breakdown:</div>
                              <div className="flex justify-between text-xs">
                                <span className="text-emerald-600">Property Value:</span>
                                <span className="text-emerald-700">
                                  {formatCurrency(results.projections.year5.propertyValue)}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-emerald-600">- Remaining Loan:</span>
                                <span className="text-emerald-700">
                                  -{formatCurrency(results.projections.year5.propertyValue - results.projections.year5.equity)}
                                </span>
                              </div>
                              <div className="flex justify-between border-t border-emerald-200 pt-1 mt-1">
                                <span className="text-sm font-medium text-emerald-700">= Net Equity:</span>
                                <span className="font-semibold text-emerald-800">
                                  {formatCurrency(results.projections.year5.equity)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Unit-by-Unit Analysis */}
              {results && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Unit-by-Unit Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-300 px-3 py-2 text-left">Unit</th>
                            <th className="border border-gray-300 px-3 py-2 text-left">Bed/Bath</th>
                            <th className="border border-gray-300 px-3 py-2 text-left">Current Rent</th>
                            <th className="border border-gray-300 px-3 py-2 text-left">Potential Rent</th>
                            <th className="border border-gray-300 px-3 py-2 text-left">Repair Cost</th>
                            <th className="border border-gray-300 px-3 py-2 text-left">Monthly Gain</th>
                            <th className="border border-gray-300 px-3 py-2 text-left">Annual Gain</th>
                            <th className="border border-gray-300 px-3 py-2 text-left">ROI on Repairs</th>
                          </tr>
                        </thead>
                        <tbody>
                          {units.map((unit) => {
                            const monthlyGain = unit.potentialRent - unit.currentRent;
                            const annualGain = monthlyGain * 12;
                            const repairROI = unit.repairCosts > 0 ? (annualGain / unit.repairCosts) * 100 : 0;
                            
                            return (
                              <tr key={unit.id} className="hover:bg-gray-50">
                                <td className="border border-gray-300 px-3 py-2 font-medium">
                                  Unit {unit.id}
                                </td>
                                <td className="border border-gray-300 px-3 py-2 text-sm">
                                  {unit.bedrooms}bed/{unit.bathrooms}bath
                                </td>
                                <td className="border border-gray-300 px-3 py-2">
                                  {formatCurrency(unit.currentRent)}
                                </td>
                                <td className="border border-gray-300 px-3 py-2">
                                  {formatCurrency(unit.potentialRent)}
                                </td>
                                <td className="border border-gray-300 px-3 py-2">
                                  {formatCurrency(unit.repairCosts)}
                                </td>
                                <td className="border border-gray-300 px-3 py-2">
                                  <span className={monthlyGain >= 0 ? "text-green-600" : "text-red-600"}>
                                    {formatCurrency(monthlyGain)}
                                  </span>
                                </td>
                                <td className="border border-gray-300 px-3 py-2">
                                  <span className={annualGain >= 0 ? "text-green-600" : "text-red-600"}>
                                    {formatCurrency(annualGain)}
                                  </span>
                                </td>
                                <td className="border border-gray-300 px-3 py-2">
                                  <span className={repairROI >= 20 ? "text-green-600" : repairROI >= 10 ? "text-orange-600" : "text-red-600"}>
                                    {formatPercentage(repairROI)}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Detailed Breakdown */}
              {results && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Income Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Gross Rental Income ({results.monthlyUnits} units)
                      </span>
                      <span className="font-medium">
                        {formatCurrency(units.reduce((total, unit) => total + (unit.potentialRent * 12), 0))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Other Income</span>
                      <span className="font-medium">
                        {formatCurrency(parseFloat(otherIncome) * 12)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Vacancy Loss (-{currentVacancy}%)
                      </span>
                      <span className="font-medium text-red-600">
                        -{formatCurrency((units.reduce((total, unit) => total + (unit.potentialRent * 12), 0) + parseFloat(otherIncome) * 12) * parseFloat(projectedVacancy) / 100)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Effective Gross Income</span>
                      <span className="text-green-600">
                        {formatCurrency(results.totalIncome)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Expense Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Insurance</span>
                      <span className="font-medium">
                        {formatCurrency(parseFloat(projectedInsurance) * 12)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Property Taxes</span>
                      <span className="font-medium">
                        {formatCurrency(parseFloat(projectedPropertyTaxes) * 12)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Maintenance & Repairs</span>
                      <span className="font-medium">
                        {formatCurrency(parseFloat(projectedMaintenance) * 12)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Management ({projectedManagementPercent}%)
                      </span>
                      <span className="font-medium">
                        {formatCurrency(results.totalIncome * parseFloat(projectedManagementPercent) / 100)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Other Expenses</span>
                      <span className="font-medium">
                        {formatCurrency(parseFloat(projectedOtherExpenses) * 12)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total Operating Expenses</span>
                      <span className="text-red-600">
                        {formatCurrency(results.totalExpenses)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                </div>
              )}

              {/* Investment Summary */}
              {results && (
                <Card>
                <CardHeader>
                  <CardTitle className="text-base">Investment Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Total Cash Invested</p>
                      <p className="text-lg font-bold">{formatCurrency(results.totalCashInvested)}</p>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>Down Payment: {formatCurrency(parseFloat(downPayment))}</div>
                        <div>Closing Costs: {formatCurrency(parseFloat(closingCosts))}</div>
                        <div>Renovation: {formatCurrency(parseFloat(renovationCosts))}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Financing Details</p>
                      <p className="text-lg font-bold">{formatCurrency(parseFloat(loanAmount))}</p>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>Interest Rate: {interestRate}%</div>
                        <div>Loan Term: {loanTerm} years</div>
                        <div>Monthly Payment: {formatCurrency(parseFloat(loanAmount) > 0 ? calculateMonthlyMortgagePayment(parseFloat(loanAmount), parseFloat(interestRate), parseInt(loanTerm)) : 0)}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Performance Metrics</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Cap Rate:</span>
                          <Badge variant={results.capRate >= 8 ? "default" : results.capRate >= 6 ? "secondary" : "destructive"}>
                            {formatPercentage(results.capRate)}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Cash-on-Cash:</span>
                          <Badge variant={results.cashOnCashReturn >= 10 ? "default" : results.cashOnCashReturn >= 8 ? "secondary" : "destructive"}>
                            {formatPercentage(results.cashOnCashReturn)}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Monthly Cash Flow:</span>
                          <Badge variant={results.annualCashFlow >= 0 ? "default" : "destructive"}>
                            {formatCurrency(results.annualCashFlow / 12)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              )}

              {/* Target Analysis Section */}
              {results && (
                <Card className="bg-purple-50 border-purple-200">
                  <CardHeader>
                    <CardTitle className="text-purple-800 flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Target Analysis Tool
                    </CardTitle>
                    <p className="text-sm text-purple-600">
                      Enter your desired returns to get a recommended purchase price
                    </p>
                  </CardHeader>
                  <CardContent>
                    {!showTargetAnalysis ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="targetCapRate">Desired Cap Rate (%)</Label>
                            <Input
                              id="targetCapRate"
                              type="number"
                              step="0.1"
                              placeholder="8.0"
                              value={targetCapRate}
                              onChange={(e) => setTargetCapRate(e.target.value)}
                            />
                            <p className="text-xs text-purple-600 mt-1">
                              Typical range: 6-12%
                            </p>
                          </div>
                          <div>
                            <Label htmlFor="targetCashOnCash">Desired Cash-on-Cash ROI (%)</Label>
                            <Input
                              id="targetCashOnCash"
                              type="number"
                              step="0.1"
                              placeholder="12.0"
                              value={targetCashOnCash}
                              onChange={(e) => setTargetCashOnCash(e.target.value)}
                            />
                            <p className="text-xs text-purple-600 mt-1">
                              Typical range: 8-20%
                            </p>
                          </div>
                        </div>
                        
                        <Button 
                          onClick={calculateTargetAnalysis}
                          className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                          <Target className="h-4 w-4 mr-2" />
                          Calculate Recommended Purchase Price
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-purple-800">Purchase Price Recommendations</h4>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setShowTargetAnalysis(false)}
                            className="border-purple-300 text-purple-700"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Targets
                          </Button>
                        </div>

                        {targetResults && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-purple-100 p-4 rounded-lg border border-purple-300">
                              <h5 className="font-semibold text-purple-800 mb-2">Recommended Purchase Price</h5>
                              <p className="text-2xl font-bold text-purple-900">
                                {formatCurrency(targetResults.recommendedPurchasePrice)}
                              </p>
                              <p className="text-xs text-purple-700 mt-2">
                                Conservative price to meet both targets
                              </p>
                            </div>

                            <div className="bg-purple-100 p-4 rounded-lg border border-purple-300">
                              <h5 className="font-semibold text-purple-800 mb-2">Maximum Offer Price</h5>
                              <p className="text-2xl font-bold text-purple-900">
                                {formatCurrency(targetResults.maxOfferPrice)}
                              </p>
                              <p className="text-xs text-purple-700 mt-2">
                                90% of recommended (negotiation buffer)
                              </p>
                            </div>
                          </div>
                        )}

                        {targetResults && (
                          <div className="space-y-3 pt-4 border-t border-purple-200">
                            <h5 className="font-medium text-purple-800">Analysis Breakdown:</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div className="flex justify-between">
                                <span className="text-purple-700">Target Cap Rate:</span>
                                <span className="font-medium">{targetCapRate}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-purple-700">Target Cash-on-Cash:</span>
                                <span className="font-medium">{targetCashOnCash}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-purple-700">Cap Rate Based Price:</span>
                                <span className="font-medium">{formatCurrency(targetResults.capRateBasedPrice)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-purple-700">Cash-on-Cash Based Price:</span>
                                <span className="font-medium">{formatCurrency(targetResults.cashOnCashBasedPrice)}</span>
                              </div>
                            </div>
                            
                            <div className="bg-purple-200 p-3 rounded-lg mt-4">
                              <p className="text-xs text-purple-800">
                                <strong>How it works:</strong> We calculate the maximum price you can pay to achieve your target returns. 
                                The recommended price is the lower of the two calculations to ensure you meet both targets.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}