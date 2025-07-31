import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Onboarding from "@/pages/onboarding";
import Tasks from "@/pages/tasks";
import CRM from "@/pages/crm";
import Goals from "@/pages/goals";
import Income from "@/pages/income";
import Training from "@/pages/training";
import Tools from "@/pages/tools";
import Prequalification from "@/pages/prequalification";
import CalculatorTest from "@/pages/calculator-test";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/calculator-test" component={CalculatorTest} />
        </>
      ) : user && !(user as any).hasCompletedOnboarding ? (
        <Route path="/" component={Onboarding} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/tasks" component={Tasks} />
          <Route path="/crm" component={CRM} />
          <Route path="/goals" component={Goals} />
          <Route path="/income" component={Income} />
          <Route path="/training" component={Training} />
          <Route path="/tools" component={Tools} />
          <Route path="/prequalification" component={Prequalification} />
          <Route path="/onboarding" component={Onboarding} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
