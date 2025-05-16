
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import HomePage from "@/pages/HomePage";
import LinkDetailPage from "@/pages/LinkDetailPage";
import SubmitPage from "@/pages/SubmitPage";
import AuthPage from "@/pages/AuthPage";
import TagsPage from "@/pages/TagsPage";
import NotFound from "@/pages/NotFound";
import { useState } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const AppContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header onSearch={handleSearch} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/newest" element={<HomePage />} />
          <Route path="/link/:id" element={<LinkDetailPage />} />
          <Route path="/submit" element={<SubmitPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/tags" element={<TagsPage />} />
          <Route path="/tag/:tag" element={<HomePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="py-6 border-t">
        <div className="container max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} LinkVault - Save and organize your links
        </div>
      </footer>
    </div>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-right" closeButton />
          <BrowserRouter>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
