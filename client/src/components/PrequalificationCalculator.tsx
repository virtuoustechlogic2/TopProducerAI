import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Calculator, DollarSign, Home, CreditCard, AlertCircle, CheckCircle, TrendingUp, Shield, Users, FileText, Building } from "lucide-react";

interface LoanProgram {
  name: string;
  housingRatio: number;
  totalRatio: number;
  description: string;
}

interface CalculationResult {
  monthlyHousingPayment: number;
  maxLoanAmount: number;
  qualifies: boolean;
  loanProgram: LoanProgram;
  housingRatioUsed: number;
  totalRatioUsed: number;
  cashToClose: CashToCloseAnalysis;
  paymentBreakdown: PaymentBreakdown;
}

interface PaymentBreakdown {
  principalAndInterest: number;
  propertyTaxes: number;
  homeownersInsurance: number;
  mortgageInsurance: number;
  hoaFees: number;
  totalMonthlyPayment: number;
}

interface CashToCloseAnalysis {
  downPaymentRequired: number;
  downPaymentPercentage: number;
  closingCosts: number;
  totalCashNeeded: number;
  hasEnoughCash: boolean;
  cashShortfall: number;
  suggestedClosingCostReduction: number;
  remainingDeficiency: number;
}

const LOAN_PROGRAMS: LoanProgram[] = [
  {
    name: "Conventional",
    housingRatio: 28,
    totalRatio: 36,
    description: "Standard conventional loan with competitive rates"
  },
  {
    name: "FHA",
    housingRatio: 31,
    totalRatio: 43,
    description: "Government-backed loan with more flexible requirements"
  }
];

// PMI rate for loans with < 20% down
const PMI_RATE = 0.005 / 12; // 0.5% annually for loans with < 20% down

export default function PrequalificationCalculator() {
  const [monthlyIncome, setMonthlyIncome] = useState<string>("");
  const [monthlyDebts, setMonthlyDebts] = useState<string>("");
  const [downPaymentAmount, setDownPaymentAmount] = useState<string>("");
  const [interestRate, setInterestRate] = useState<string>("7.0");

  const [propertyTaxRate, setPropertyTaxRate] = useState<string>("1.25");
  const [insuranceRate, setInsuranceRate] = useState<string>("0.35");
  const [hoaFees, setHoaFees] = useState<string>("");
  const [closingCostPercentage, setClosingCostPercentage] = useState<string>("3.0");
  const [results, setResults] = useState<CalculationResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoadingRates, setIsLoadingRates] = useState(false);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (ratio: number): string => {
    return `${ratio.toFixed(1)}%`;
  };

  // Removed ZIP code rate fetching - users can manually enter local tax and insurance rates

  const calculateMonthlyPayment = (principal: number, rate: number, years: number): number => {
    const monthlyRate = rate / 100 / 12;
    const numPayments = years * 12;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
           (Math.pow(1 + monthlyRate, numPayments) - 1);
  };

  const calculateCashToClose = (loanAmount: number, loanProgram: LoanProgram): CashToCloseAnalysis => {
    const totalLoanAmount = loanAmount;
    const purchasePrice = totalLoanAmount + parseFloat(downPaymentAmount);
    const fundsAvailable = parseFloat(downPaymentAmount);
    
    // Determine minimum down payment percentage based on loan program
    let minDownPaymentPercentage: number;
    if (loanProgram.name === "FHA") {
      minDownPaymentPercentage = 3.5; // FHA minimum 3.5%
    } else {
      minDownPaymentPercentage = 5.0; // Conventional minimum (can be 3% for first-time buyers)
    }
    
    const minDownPaymentRequired = purchasePrice * (minDownPaymentPercentage / 100);
    const downPaymentPercentage = (fundsAvailable / purchasePrice) * 100;
    
    // Calculate closing costs based on purchase price
    const closingCosts = purchasePrice * (parseFloat(closingCostPercentage) / 100);
    
    // Total cash needed
    const totalCashNeeded = minDownPaymentRequired + closingCosts;
    
    // Check if borrower has enough funds
    const hasEnoughCash = fundsAvailable >= totalCashNeeded;
    const cashShortfall = hasEnoughCash ? 0 : totalCashNeeded - fundsAvailable;
    
    // Calculate seller concession suggestions
    let suggestedClosingCostReduction = 0;
    let remainingDeficiency = 0;
    
    if (cashShortfall > 0) {
      // First, try to reduce closing costs (seller concessions)
      suggestedClosingCostReduction = Math.min(cashShortfall, closingCosts);
      remainingDeficiency = Math.max(0, cashShortfall - closingCosts);
    }
    
    return {
      downPaymentRequired: minDownPaymentRequired,
      downPaymentPercentage: downPaymentPercentage,
      closingCosts: closingCosts,
      totalCashNeeded: totalCashNeeded,
      hasEnoughCash: hasEnoughCash,
      cashShortfall: cashShortfall,
      suggestedClosingCostReduction: suggestedClosingCostReduction,
      remainingDeficiency: remainingDeficiency
    };
  };

  const calculatePrequalification = () => {
    const income = parseFloat(monthlyIncome);
    const debts = parseFloat(monthlyDebts || "0");
    const downPayment = parseFloat(downPaymentAmount);
    const rate = parseFloat(interestRate);
    const propTaxRate = parseFloat(propertyTaxRate) / 100 / 12; // Annual % to monthly decimal
    const insRate = parseFloat(insuranceRate) / 100 / 12; // Annual % to monthly decimal
    const monthlyHoaFees = parseFloat(hoaFees || "0");

    if (!income || income <= 0 || !downPayment || downPayment <= 0) return;

    const calculationResults: CalculationResult[] = [];

    LOAN_PROGRAMS.forEach(program => {
      // Calculate maximum housing payment based on housing ratio
      const maxHousingPayment = income * (program.housingRatio / 100);
      
      // Calculate maximum total payment based on total debt ratio
      const maxTotalPayment = income * (program.totalRatio / 100);
      const maxHousingFromTotal = maxTotalPayment - debts;
      
      // Use the more restrictive of the two
      const actualMaxHousingPayment = Math.min(maxHousingPayment, maxHousingFromTotal);
      
      if (actualMaxHousingPayment <= 0) {
        const emptyCashToClose: CashToCloseAnalysis = {
          downPaymentRequired: 0,
          downPaymentPercentage: 0,
          closingCosts: 0,
          totalCashNeeded: 0,
          hasEnoughCash: false,
          cashShortfall: 0,
          suggestedClosingCostReduction: 0,
          remainingDeficiency: 0
        };
        
        calculationResults.push({
          monthlyHousingPayment: 0,
          maxLoanAmount: 0,
          qualifies: false,
          loanProgram: program,
          housingRatioUsed: (maxHousingPayment / income) * 100,
          totalRatioUsed: ((maxHousingPayment + debts) / income) * 100,
          cashToClose: emptyCashToClose,
          paymentBreakdown: {
            principalAndInterest: 0,
            propertyTaxes: 0,
            homeownersInsurance: 0,
            mortgageInsurance: 0,
            hoaFees: 0,
            totalMonthlyPayment: 0
          }
        });
        return;
      }

      // Calculate maximum home price and loan amount
      let bestHomePrice = 0;
      let bestLoanAmount = 0;
      let bestMonthlyPayment = 0;

      // Start with a reasonable estimate and iterate to find maximum affordable home
      for (let testHomePrice = 100000; testHomePrice <= 3000000; testHomePrice += 5000) {
        const loanAmount = testHomePrice - downPayment;
        
        // Skip if loan amount is negative or too small
        if (loanAmount <= 0) continue;
        
        const downPaymentPercent = downPayment / testHomePrice;
        const principalAndInterest = calculateMonthlyPayment(loanAmount, rate, 30);
        const propertyTax = testHomePrice * propTaxRate;
        const insurance = testHomePrice * insRate;
        const pmi = downPaymentPercent < 0.2 ? loanAmount * PMI_RATE : 0;
        
        const totalMonthlyPayment = principalAndInterest + propertyTax + insurance + pmi + monthlyHoaFees;
        
        if (totalMonthlyPayment <= actualMaxHousingPayment) {
          bestHomePrice = testHomePrice;
          bestLoanAmount = loanAmount;
          bestMonthlyPayment = totalMonthlyPayment;
        } else {
          break;
        }
      }

      const housingRatio = (bestMonthlyPayment / income) * 100;
      const totalRatio = ((bestMonthlyPayment + debts) / income) * 100;
      
      // Calculate cash to close analysis
      const cashToClose = calculateCashToClose(bestLoanAmount, program);

      // Calculate detailed payment breakdown for best case
      const finalHomePrice = bestLoanAmount + downPayment;
      const finalDownPaymentPercent = downPayment / finalHomePrice;
      const finalPrincipalAndInterest = calculateMonthlyPayment(bestLoanAmount, rate, 30);
      const finalPropertyTax = finalHomePrice * propTaxRate;
      const finalInsurance = finalHomePrice * insRate;
      const finalPmi = finalDownPaymentPercent < 0.2 ? bestLoanAmount * PMI_RATE : 0;

      const paymentBreakdown: PaymentBreakdown = {
        principalAndInterest: finalPrincipalAndInterest,
        propertyTaxes: finalPropertyTax,
        homeownersInsurance: finalInsurance,
        mortgageInsurance: finalPmi,
        hoaFees: monthlyHoaFees,
        totalMonthlyPayment: bestMonthlyPayment
      };

      calculationResults.push({
        monthlyHousingPayment: bestMonthlyPayment,
        maxLoanAmount: bestLoanAmount,
        qualifies: housingRatio <= program.housingRatio && totalRatio <= program.totalRatio && bestLoanAmount > 0,
        loanProgram: program,
        housingRatioUsed: housingRatio,
        totalRatioUsed: totalRatio,
        cashToClose: cashToClose,
        paymentBreakdown: paymentBreakdown
      });
    });

    setResults(calculationResults);
    setShowResults(true);
  };

  const resetCalculator = () => {
    setMonthlyIncome("");
    setMonthlyDebts("");
    setDownPaymentAmount("");
    setInterestRate("7.0");
    setPropertyTaxRate("1.25");
    setInsuranceRate("0.35");
    setHoaFees("");
    setClosingCostPercentage("3.0");
    setResults([]);
    setShowResults(false);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-6 w-6 text-primary" />
          Mortgage Prequalification Calculator
        </CardTitle>
        <CardDescription>
          Calculate how much house your client can afford based on their income and debts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!showResults ? (
          <>
            {/* Input Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="income" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Monthly Gross Income
                  </Label>
                  <Input
                    id="income"
                    type="number"
                    placeholder="5,000"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter your client's total monthly income before taxes
                  </p>
                </div>

                <div>
                  <Label htmlFor="debts" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Monthly Long-Term Obligations (LTO)
                  </Label>
                  <Input
                    id="debts"
                    type="number"
                    placeholder="800"
                    value={monthlyDebts}
                    onChange={(e) => setMonthlyDebts(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Car payments, credit cards, student loans, etc.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="downPayment" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Funds Available
                  </Label>
                  <Input
                    id="downPayment"
                    type="number"
                    placeholder="50000"
                    value={downPaymentAmount}
                    onChange={(e) => setDownPaymentAmount(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Total cash available for down payment and closing costs
                  </p>
                </div>

                <div>
                  <Label htmlFor="interestRate" className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Interest Rate (%)
                  </Label>
                  <Input
                    id="interestRate"
                    type="number"
                    step="0.1"
                    placeholder="7.0"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Current market rate for 30-year fixed
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="propertyTax" className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Property Tax Rate (% annually)
                    </Label>
                    <Input
                      id="propertyTax"
                      type="number"
                      step="0.1"
                      placeholder="1.25"
                      value={propertyTaxRate}
                      onChange={(e) => setPropertyTaxRate(e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Varies by location (typical: 0.5% - 2.5%)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="insurance" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Homeowners Insurance (% annually)
                    </Label>
                    <Input
                      id="insurance"
                      type="number"
                      step="0.1"
                      placeholder="0.35"
                      value={insuranceRate}
                      onChange={(e) => setInsuranceRate(e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Typical: 0.25% - 0.75% (varies by location)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hoaFees" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Monthly HOA Fees (optional)
                    </Label>
                    <Input
                      id="hoaFees"
                      type="number"
                      placeholder="150"
                      value={hoaFees}
                      onChange={(e) => setHoaFees(e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Leave blank if no HOA fees apply
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="closingCosts" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Closing Costs (%)
                    </Label>
                    <Input
                      id="closingCosts"
                      type="number"
                      step="0.1"
                      placeholder="3.0"
                      value={closingCostPercentage}
                      onChange={(e) => setClosingCostPercentage(e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Typical: 2-4% (adjust if seller pays part)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex gap-3">
              <Button onClick={calculatePrequalification} className="flex-1">
                Calculate Prequalification
              </Button>
            </div>

            {/* Info Section */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Loan Requirements:</strong><br />
                <strong>Conventional:</strong> Housing ≤ 28%, Total Debt ≤ 36%<br />
                <strong>FHA:</strong> Housing ≤ 31%, Total Debt ≤ 43%<br />
                <strong>Housing Payment includes:</strong> Principal + Interest + Property Tax + Insurance + PMI + HOA Fees
              </AlertDescription>
            </Alert>
          </>
        ) : (
          <>
            {/* Results Display */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Prequalification Results</h3>
                <Button variant="outline" onClick={resetCalculator}>
                  New Calculation
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.map((result, index) => (
                  <Card key={index} className={`border-2 ${result.qualifies ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{result.loanProgram.name} Loan</span>
                        {result.qualifies ? (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Qualifies
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Does Not Qualify
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{result.loanProgram.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {result.qualifies && result.maxLoanAmount > 0 ? (
                        <>
                          <div>
                            <p className="text-sm text-muted-foreground">Maximum Loan Amount</p>
                            <p className="text-2xl font-bold text-primary">
                              {formatCurrency(result.maxLoanAmount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Maximum Home Price</p>
                            <p className="text-xl font-semibold">
                              {formatCurrency(result.maxLoanAmount + parseFloat(downPaymentAmount))}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Monthly Housing Payment</p>
                            <p className="text-lg font-medium">
                              {formatCurrency(result.monthlyHousingPayment)}
                            </p>
                          </div>

                          {/* Payment Breakdown */}
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <h5 className="text-sm font-semibold text-blue-800 mb-2">Payment Breakdown</h5>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span>Principal & Interest:</span>
                                <span className="font-medium">{formatCurrency(result.paymentBreakdown.principalAndInterest)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Property Taxes:</span>
                                <span className="font-medium">{formatCurrency(result.paymentBreakdown.propertyTaxes)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Homeowners Insurance:</span>
                                <span className="font-medium">{formatCurrency(result.paymentBreakdown.homeownersInsurance)}</span>
                              </div>
                              {result.paymentBreakdown.mortgageInsurance > 0 && (
                                <div className="flex justify-between">
                                  <span>Mortgage Insurance (PMI):</span>
                                  <span className="font-medium">{formatCurrency(result.paymentBreakdown.mortgageInsurance)}</span>
                                </div>
                              )}
                              {result.paymentBreakdown.hoaFees > 0 && (
                                <div className="flex justify-between">
                                  <span>HOA Fees:</span>
                                  <span className="font-medium">{formatCurrency(result.paymentBreakdown.hoaFees)}</span>
                                </div>
                              )}
                              <Separator className="my-1" />
                              <div className="flex justify-between font-semibold text-blue-900">
                                <span>Total Monthly Payment:</span>
                                <span>{formatCurrency(result.paymentBreakdown.totalMonthlyPayment)}</span>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                          <p className="text-red-600 font-medium">
                            Client does not qualify for this loan type
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Debt-to-income ratios exceed requirements
                          </p>
                        </div>
                      )}
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Housing Ratio:</span>
                          <span className={result.housingRatioUsed <= result.loanProgram.housingRatio ? 'text-green-600' : 'text-red-600'}>
                            {formatPercentage(result.housingRatioUsed)} / {result.loanProgram.housingRatio}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Total Debt Ratio:</span>
                          <span className={result.totalRatioUsed <= result.loanProgram.totalRatio ? 'text-green-600' : 'text-red-600'}>
                            {formatPercentage(result.totalRatioUsed)} / {result.loanProgram.totalRatio}%
                          </span>
                        </div>
                      </div>

                      {/* Cash to Close Analysis */}
                      {result.qualifies && result.maxLoanAmount > 0 && (
                        <>
                          <Separator />
                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              Cash to Close Analysis
                              {!result.cashToClose.hasEnoughCash && (
                                <Badge variant="destructive" className="text-xs">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Insufficient Cash
                                </Badge>
                              )}
                            </h4>
                            
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Funds Available:</span>
                                <span className="font-medium">{formatCurrency(parseFloat(downPaymentAmount))}</span>
                              </div>
                              
                              <div className="flex justify-between">
                                <span>Minimum Down Payment ({result.loanProgram.name === "FHA" ? "3.5" : "5.0"}%):</span>
                                <span className="font-medium">{formatCurrency(result.cashToClose.downPaymentRequired)}</span>
                              </div>
                              
                              <div className="flex justify-between">
                                <span>Estimated Closing Costs ({closingCostPercentage}%):</span>
                                <span className="font-medium">{formatCurrency(result.cashToClose.closingCosts)}</span>
                              </div>
                              
                              <Separator />
                              
                              <div className="flex justify-between font-semibold">
                                <span>Total Cash Needed:</span>
                                <span className="text-lg">{formatCurrency(result.cashToClose.totalCashNeeded)}</span>
                              </div>
                              
                              {result.cashToClose.cashShortfall > 0 && (
                                <div className="mt-3 space-y-2">
                                  <Alert className="border-red-200 bg-red-50">
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                    <AlertDescription className="text-xs text-red-800">
                                      <div className="space-y-1">
                                        <div><strong>Cash Shortfall:</strong> {formatCurrency(result.cashToClose.cashShortfall)}</div>
                                        
                                        {result.cashToClose.suggestedClosingCostReduction > 0 && (
                                          <div>
                                            <strong>Suggested Seller Concessions:</strong> {formatCurrency(result.cashToClose.suggestedClosingCostReduction)} 
                                            <span className="text-muted-foreground"> (reduce closing costs)</span>
                                          </div>
                                        )}
                                        
                                        {result.cashToClose.remainingDeficiency > 0 && (
                                          <div className="text-red-700">
                                            <strong>Additional Funds Still Needed:</strong> {formatCurrency(result.cashToClose.remainingDeficiency)}
                                          </div>
                                        )}
                                      </div>
                                    </AlertDescription>
                                  </Alert>
                                </div>
                              )}
                              
                              {result.cashToClose.hasEnoughCash && (
                                <div className="bg-green-50 p-2 rounded text-xs text-green-800">
                                  <strong>✓ Sufficient Funds:</strong> Client has enough cash to close with {formatCurrency(parseFloat(downPaymentAmount) - result.cashToClose.totalCashNeeded)} remaining.
                                </div>
                              )}
                              
                              <div className="bg-blue-50 p-2 rounded text-xs text-blue-800">
                                <strong>Note:</strong> Seller can contribute to buyer's closing costs. 
                                {result.loanProgram.name === "FHA" ? " FHA allows up to 6% of purchase price." : " Conventional loans typically allow 3-6% of purchase price."}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Editable Input Parameters */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-800">Adjust Parameters</CardTitle>
                  <CardDescription className="text-blue-700">
                    Modify any value below and results will update automatically
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="edit-income" className="text-sm font-medium">Monthly Gross Income</Label>
                        <Input
                          id="edit-income"
                          type="number"
                          value={monthlyIncome}
                          onChange={(e) => {
                            setMonthlyIncome(e.target.value);
                            // Auto-recalculate after a short delay
                            setTimeout(() => calculatePrequalification(), 1000);
                          }}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-debts" className="text-sm font-medium">Monthly Long-Term Obligations</Label>
                        <Input
                          id="edit-debts"
                          type="number"
                          value={monthlyDebts}
                          onChange={(e) => {
                            setMonthlyDebts(e.target.value);
                            // Auto-recalculate after a short delay
                            setTimeout(() => calculatePrequalification(), 1000);
                          }}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="edit-funds" className="text-sm font-medium">Funds Available</Label>
                        <Input
                          id="edit-funds"
                          type="number"
                          value={downPaymentAmount}
                          onChange={(e) => {
                            setDownPaymentAmount(e.target.value);
                            // Auto-recalculate after a short delay
                            setTimeout(() => calculatePrequalification(), 1000);
                          }}
                          className="mt-1"
                        />
                      </div>

                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="edit-rate" className="text-sm font-medium">Interest Rate (%)</Label>
                        <Input
                          id="edit-rate"
                          type="number"
                          step="0.1"
                          value={interestRate}
                          onChange={(e) => {
                            setInterestRate(e.target.value);
                            // Auto-recalculate after a short delay
                            setTimeout(() => calculatePrequalification(), 1000);
                          }}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="edit-tax" className="text-sm font-medium">Property Tax Rate (% annually)</Label>
                        <Input
                          id="edit-tax"
                          type="number"
                          step="0.1"
                          value={propertyTaxRate}
                          onChange={(e) => {
                            setPropertyTaxRate(e.target.value);
                            // Auto-recalculate after a short delay
                            setTimeout(() => calculatePrequalification(), 1000);
                          }}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-insurance" className="text-sm font-medium">Insurance Rate (% annually)</Label>
                        <Input
                          id="edit-insurance"
                          type="number"
                          step="0.1"
                          value={insuranceRate}
                          onChange={(e) => {
                            setInsuranceRate(e.target.value);
                            // Auto-recalculate after a short delay
                            setTimeout(() => calculatePrequalification(), 1000);
                          }}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="edit-hoa" className="text-sm font-medium">HOA/Condo Fees (monthly)</Label>
                        <Input
                          id="edit-hoa"
                          type="number"
                          value={hoaFees}
                          onChange={(e) => setHoaFees(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-closing" className="text-sm font-medium">Closing Costs (% of purchase)</Label>
                        <Input
                          id="edit-closing"
                          type="number"
                          step="0.1"
                          value={closingCostPercentage}
                          onChange={(e) => setClosingCostPercentage(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-4">
                    <Button onClick={calculatePrequalification} className="flex-1">
                      Recalculate
                    </Button>
                    <Button variant="outline" onClick={resetCalculator}>
                      Start Over
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Note:</strong> This is an estimate based on debt-to-income ratios only. 
                  Final loan approval depends on credit score, employment history, assets, and other factors. 
                  Recommend clients get pre-approved with a qualified lender.
                </AlertDescription>
              </Alert>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}