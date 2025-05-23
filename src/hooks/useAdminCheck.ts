
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
        setIsLoading(false);
        navigate('/auth');
        return;
      }
      
      try {
        // Check if user has admin role in profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error("Error checking admin status:", error);
          setIsLoading(false);
          navigate('/');
          return;
        }
        
        if (!data?.is_admin) {
          toast.error("You don't have permission to access this page");
          setIsLoading(false);
          navigate('/');
          return;
        }
        
        setIsAdmin(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setIsLoading(false);
        navigate('/');
      }
    };
    
    if (authState === 'SIGNED_IN') {
      checkAdmin();
    } else if (authState === 'SIGNED_OUT') {
      setIsLoading(false);
      navigate('/auth');
    }
  }, [user, authState, navigate]);

  return { isAdmin, isLoading, authState };
}
