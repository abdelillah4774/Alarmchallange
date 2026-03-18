import { useState, useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/language-context";
import { useAuth } from "@workspace/replit-auth-web";

import { Home } from "@/pages/home";
import { AddEditAlarm } from "@/pages/add-edit";
import { Stats } from "@/pages/stats";
import { Login } from "@/pages/login";
import { LanguageSelect } from "@/pages/language-select";
import NotFound from "@/pages/not-found";
import { BottomNav } from "@/components/BottomNav";
import { useAlarmEngine } from "@/hooks/use-alarm-engine";
import { ChallengeOverlay } from "@/components/ChallengeOverlay";
import { useStats } from "@/hooks/use-stats";

const queryClient = new QueryClient();

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();
  const [langSelected, setLangSelected] = useState<boolean>(() => {
    return !!localStorage.getItem("app_lang");
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!langSelected) {
    return <LanguageSelect onDone={() => setLangSelected(true)} />;
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return <>{children}</>;
}

function AppContent() {
  const { ringingAlarm, dismissAlarm } = useAlarmEngine();
  const { recordChallengeCompletion } = useStats();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <img
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
          alt="background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-background/80" />
      </div>

      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/add" component={AddEditAlarm} />
          <Route path="/edit/:id" component={AddEditAlarm} />
          <Route path="/stats" component={Stats} />
          <Route component={NotFound} />
        </Switch>

        <BottomNav />
      </WouterRouter>

      {ringingAlarm && (
        <ChallengeOverlay
          alarm={ringingAlarm}
          onDismiss={dismissAlarm}
          onChallengeComplete={recordChallengeCompletion}
        />
      )}

      <Toaster />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <AuthGate>
            <AppContent />
          </AuthGate>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
