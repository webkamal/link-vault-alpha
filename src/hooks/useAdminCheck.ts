import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useAdminCheck() {
  const { user, authState } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Function to check if user is admin
    const checkAdmin = async () => {
      try {
        console.log("Checking admin status for user:", user?.id);
        
        if (!user) {
          console.log("No user found, redirecting to auth");
          setIsLoading(false);
          navigate('/auth');
          return;
        }
        
        // Check if user has admin role in profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .maybeSingle();
        
        console.log("Admin check result:", { data, error });
        
        if (error) {
          console.error("Error checking admin status:", error);
          toast.error("Error checking permissions");
          setIsLoading(false);
          navigate('/');
          return;
        }
        
        // Check if is_admin is true
        if (!data || data.is_admin !== true) {
          console.log("User is not an admin:", data);
          toast.error("You don't have permission to access this page");
          setIsLoading(false);
          navigate('/');
          return;
        }
        
        console.log("User confirmed as admin");
        setIsAdmin(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Unexpected error in admin check:", error);
        toast.error("An error occurred");
        setIsLoading(false);
        navigate('/');
      }
    };
    
    // Clear admin state when not signed in
    if (authState === 'SIGNED_OUT') {
      console.log("User is signed out, redirecting to auth");
      setIsAdmin(false);
      setIsLoading(false);
      navigate('/auth');
      return;
    }
    
    // Only check admin status when signed in
    if (authState === 'SIGNED_IN' && user) {
      console.log("User is signed in, checking admin status");
      checkAdmin();
    } else if (authState === 'LOADING') {
      console.log("Auth state is loading");
      // Keep isLoading true while auth state is loading
    }
  }, [user, authState, navigate]);

  return { isAdmin, isLoading, authState };
}
