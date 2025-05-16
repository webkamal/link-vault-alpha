
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { AuthState } from "@/types";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  authState: AuthState;
  signUp: (email: string, password: string, username: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  username: string | null;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  authState: 'LOADING',
  signUp: async () => ({ error: new Error("Not implemented") }),
  signIn: async () => ({ error: new Error("Not implemented") }),
  signOut: async () => {},
  username: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authState, setAuthState] = useState<AuthState>('LOADING');
  const [username, setUsername] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up the auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setAuthState(currentSession ? 'SIGNED_IN' : 'SIGNED_OUT');
        
        // Fetch username if user is logged in
        if (currentSession?.user) {
          setTimeout(() => {
            fetchUserProfile(currentSession.user.id);
          }, 0);
        }
      }
    );
    
    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setAuthState(currentSession ? 'SIGNED_IN' : 'SIGNED_OUT');
      
      // Fetch username if user is logged in
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      setUsername(data.username);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email, 
        password,
        options: {
          data: {
            username
          }
        }
      });
      
      if (error) {
        toast.error("Registration failed", {
          description: error.message,
        });
        return { error };
      }
      
      if (data.user) {
        toast.success("Registration successful", {
          description: "Please check your email for verification.",
        });
        navigate('/');
      }
      
      return { error: null };
    } catch (error: any) {
      toast.error("Registration failed", {
        description: error.message,
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast.error("Login failed", {
          description: error.message,
        });
        return { error };
      }
      
      if (data.user) {
        toast.success("Login successful", {
          description: "Welcome back!",
        });
        navigate('/');
      }
      
      return { error: null };
    } catch (error: any) {
      toast.error("Login failed", {
        description: error.message,
      });
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.info("You have been logged out");
    navigate('/');
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        authState,
        signUp,
        signIn,
        signOut,
        username,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
