import PrequalificationCalculator from "@/components/PrequalificationCalculator";

export default function CalculatorTest() {
  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Mortgage Prequalification Calculator - Test
          </h1>
          <p className="text-lg text-neutral-600">
            Test the prequalification calculator functionality
          </p>
        </div>
        
        <PrequalificationCalculator />
      </div>
    </div>
  );
}