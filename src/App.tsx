import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import { lazy, Suspense, useEffect } from "react";
import { toast } from "sonner";

const Index = lazy(() => import("./pages/Index"));
const Characters = lazy(() => import("./pages/Characters"));
const ChatChamber = lazy(() => import("./pages/ChatChamber"));
const CreationLab = lazy(() => import("./pages/CreationLab"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Auth = lazy(() => import("./pages/Auth"));
const StoryAdventure = lazy(() => import("./pages/StoryAdventure"));
const UniverseFeed = lazy(() => import("./pages/UniverseFeed"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const Loading = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-primary animate-pulse font-display tracking-widest">LOADING...</div>
  </div>
);

const ActivationToast = () => {
  useEffect(() => {
    const shown = sessionStorage.getItem('ke-activated');
    if (!shown) {
      sessionStorage.setItem('ke-activated', '1');
      setTimeout(() => {
        toast.success('KEVEN ELEVEN UNIVERSE intelligent systems activated.', { duration: 5000 });
      }, 2000);
    }
  }, []);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar />
          <ActivationToast />
          <Suspense fallback={<Loading />}>
            <PageTransition>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/characters" element={<Characters />} />
                <Route path="/chat-chamber" element={<ChatChamber />} />
                <Route path="/creation-lab" element={<CreationLab />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/story-adventure" element={<StoryAdventure />} />
                <Route path="/universe-feed" element={<UniverseFeed />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </PageTransition>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
