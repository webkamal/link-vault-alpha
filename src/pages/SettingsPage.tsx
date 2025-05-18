
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SettingsPage = () => {
  const { user, authState, resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  
  // If not logged in, redirect to login page
  if (authState === 'SIGNED_OUT') {
    return <Navigate to="/auth" replace />;
  }

  // Show loading state while checking authentication
  if (authState === 'LOADING') {
    return (
      <div className="container max-w-3xl mx-auto py-8">
        <div className="h-32 w-full bg-muted animate-pulse rounded-md"></div>
      </div>
    );
  }
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsResetting(true);
    try {
      await resetPassword(email);
      setEmail(""); // Clear the form after submission
    } finally {
      setIsResetting(false);
    }
  };
  
  return (
    <div className="container max-w-3xl mx-auto py-8">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to all links
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
      
      <Tabs defaultValue="account">
        <TabsList className="mb-6">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <Card className="p-6">
            <div className="space-y-2">
              <h2 className="text-xl font-medium">Account Information</h2>
              <p className="text-sm text-muted-foreground">
                Manage your account information
              </p>
            </div>
            
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-email">Current Email</Label>
                <Input 
                  id="current-email" 
                  value={user?.email || ""}
                  disabled
                  className="bg-muted"
                />
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium">Account Created</p>
                <p className="text-sm text-muted-foreground">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Account Management</p>
                <Link to="/profile">
                  <Button variant="outline">Edit Profile</Button>
                </Link>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card className="p-6">
            <div className="space-y-2">
              <h2 className="text-xl font-medium">Security Settings</h2>
              <p className="text-sm text-muted-foreground">
                Manage your account security
              </p>
            </div>
            
            <div className="mt-6 space-y-6">
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-md font-medium">Change Password</h3>
                  <p className="text-sm text-muted-foreground">
                    We'll send you an email with a link to reset your password
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email Address</Label>
                  <Input 
                    id="reset-email" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled={isResetting}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isResetting || !email}
                >
                  {isResetting ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
