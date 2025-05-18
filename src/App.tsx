
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
import ProfilePage from "@/pages/ProfilePage";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/NotFound";
import { useState } from "react";
import { TopicSidebar } from "@/components/TopicSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

// Create a new QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Separate the content from the QueryClientProvider to avoid React hook issues
const AppRouting = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };
  
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Header onSearch={handleSearch} />
          <div className="flex-1 flex">
            <SidebarProvider>
              <div className="flex min-h-[calc(100vh-4rem)] w-full">
                <TopicSidebar />
                
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/newest" element={<HomePage />} />
                    <Route path="/link/:id" element={<LinkDetailPage />} />
                    <Route path="/submit" element={<SubmitPage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/tags" element={<TagsPage />} />
                    <Route path="/tag/:tag" element={<HomePage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </SidebarProvider>
          </div>
          <footer className="py-6 border-t">
            <div className="container max-w-7xl mx-auto text-center text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} LinkVault - Save and organize your links
            </div>
          </footer>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

// Main App component that wraps everything with providers
const App = () => {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" closeButton />
        <QueryClientProvider client={queryClient}>
          <AppRouting />
        </QueryClientProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
};

export default App;
