import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { lazy, Suspense } from "react";

const Index = lazy(() => import("./pages/Index"));
const Characters = lazy(() => import("./pages/Characters"));
const ChatChamber = lazy(() => import("./pages/ChatChamber"));
const CreationLab = lazy(() => import("./pages/CreationLab"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const Loading = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-primary animate-pulse font-display tracking-widest">LOADING...</div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar />
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/characters" element={<Characters />} />
              <Route path="/chat-chamber" element={<ChatChamber />} />
              <Route path="/creation-lab" element={<CreationLab />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
