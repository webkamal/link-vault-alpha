
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
import AccountPanel from "@/components/AccountPanel";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminEditLink from "@/pages/AdminEditLink";

// Create a new QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Main App component that wraps everything with providers
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-right" closeButton />
          <AppRouting />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

// Separate the content from the QueryClientProvider to avoid React hook issues
const AppRouting = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [accountPanelOpen, setAccountPanelOpen] = useState(false);
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };
  
  const toggleAccountPanel = () => {
    setAccountPanelOpen(!accountPanelOpen);
  };
  
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Header 
            onSearch={handleSearch} 
            onAccountClick={toggleAccountPanel} 
          />
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
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/edit-link/:id" element={<AdminEditLink />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </SidebarProvider>
          </div>
          <AccountPanel open={accountPanelOpen} onOpenChange={setAccountPanelOpen} />
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

export default App;
