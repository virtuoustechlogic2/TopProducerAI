import Layout from "@/components/Layout";
import PrequalificationCalculator from "@/components/PrequalificationCalculator";

export default function PrequalificationPage() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Mortgage Prequalification
          </h1>
          <p className="text-lg text-neutral-600">
            Help your clients understand how much house they can afford with our comprehensive prequalification calculator.
          </p>
        </div>
        
        <PrequalificationCalculator />
      </div>
    </Layout>
  );
}