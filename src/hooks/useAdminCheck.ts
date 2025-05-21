
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
    const checkAdmin = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }
      
      try {
        // Check if user has admin role in profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error("Error checking admin status:", error);
          navigate('/');
          return;
        }
        
        if (!data?.is_admin) {
          toast.error("You don't have permission to access this page");
          navigate('/');
          return;
        }
        
        setIsAdmin(true);
      } catch (error) {
        console.error("Error:", error);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (authState !== 'LOADING') {
      checkAdmin();
    }
  }, [user, authState, navigate]);

  return { isAdmin, isLoading, authState };
}
