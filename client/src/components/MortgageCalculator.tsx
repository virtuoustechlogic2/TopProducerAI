import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Calculator, X, DollarSign, Percent, Calendar } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface MortgageResult {
  monthlyPayment: number;
  totalInterest: number;
  totalAmount: number;
  principal: number;
}

export default function MortgageCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [loanAmount, setLoanAmount] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanTerm, setLoanTerm] = useState("");
  const [result, setResult] = useState<MortgageResult | null>(null);

  const calculateMutation = useMutation({
    mutationFn: async (data: {
      loanAmount: number;
      downPayment: number;
      interestRate: number;
      loanTerm: number;
    }) => {
      const response = await apiRequest('POST', '/api/mortgage/calculate', data);
      return await response.json();
    },
    onSuccess: (data: MortgageResult) => {
      setResult(data);
    },
  });

  // Listen for custom event to open calculator
  useEffect(() => {
    const handleOpenCalculator = () => setIsOpen(true);
    document.addEventListener('openMortgageCalculator', handleOpenCalculator);
    return () => document.removeEventListener('openMortgageCalculator', handleOpenCalculator);
  }, []);

  const handleCalculate = () => {
    if (!loanAmount || !downPayment || !interestRate || !loanTerm) return;

    calculateMutation.mutate({
      loanAmount: parseFloat(loanAmount),
      downPayment: parseFloat(downPayment),
      interestRate: parseFloat(interestRate),
      loanTerm: parseInt(loanTerm),
    });
  };

  const resetForm = () => {
    setLoanAmount("");
    setDownPayment("");
    setInterestRate("");
    setLoanTerm("");
    setResult(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto slide-up">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
              <Calculator className="h-4 w-4 text-accent" />
            </div>
            <CardTitle>Mortgage Calculator</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Input Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="loanAmount" className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>Home Price</span>
              </Label>
              <Input
                id="loanAmount"
                type="number"
                placeholder="450000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="downPayment" className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>Down Payment</span>
              </Label>
              <Input
                id="downPayment"
                type="number"
                placeholder="90000"
                value={downPayment}
                onChange={(e) => setDownPayment(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interestRate" className="flex items-center space-x-2">
                <Percent className="h-4 w-4" />
                <span>Interest Rate (%)</span>
              </Label>
              <Input
                id="interestRate"
                type="number"
                step="0.01"
                placeholder="6.5"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="loanTerm" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Loan Term (years)</span>
              </Label>
              <Input
                id="loanTerm"
                type="number"
                placeholder="30"
                value={loanTerm}
                onChange={(e) => setLoanTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex space-x-3">
            <Button 
              onClick={handleCalculate}
              disabled={calculateMutation.isPending || !loanAmount || !downPayment || !interestRate || !loanTerm}
              className="flex-1 gradient-accent text-white"
            >
              {calculateMutation.isPending ? "Calculating..." : "Calculate Payment"}
            </Button>
            <Button variant="outline" onClick={resetForm}>
              Reset
            </Button>
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-4">
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-sm font-medium text-primary mb-1">Monthly Payment</p>
                      <p className="text-2xl font-bold text-primary">
                        ${result.monthlyPayment.toLocaleString(undefined, { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-secondary/5 border-secondary/20">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-sm font-medium text-secondary mb-1">Loan Principal</p>
                      <p className="text-2xl font-bold text-secondary">
                        ${result.principal.toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-accent/5 border-accent/20">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-sm font-medium text-accent mb-1">Total Interest</p>
                      <p className="text-2xl font-bold text-accent">
                        ${result.totalInterest.toLocaleString(undefined, { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-neutral-100">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-sm font-medium text-neutral-600 mb-1">Total Amount</p>
                      <p className="text-2xl font-bold text-neutral-900">
                        ${result.totalAmount.toLocaleString(undefined, { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-neutral-50 rounded-lg p-4">
                <h4 className="font-medium text-neutral-900 mb-2">Payment Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Principal & Interest:</span>
                    <span className="font-medium">
                      ${result.monthlyPayment.toLocaleString(undefined, { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-500">
                    <span>+ Property Tax (est.):</span>
                    <span>$350/month</span>
                  </div>
                  <div className="flex justify-between text-neutral-500">
                    <span>+ Home Insurance (est.):</span>
                    <span>$150/month</span>
                  </div>
                  <div className="flex justify-between text-neutral-500">
                    <span>+ PMI (if applicable):</span>
                    <span>$200/month</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total Monthly (est.):</span>
                    <span>
                      ${(result.monthlyPayment + 350 + 150 + 200).toLocaleString(undefined, { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
