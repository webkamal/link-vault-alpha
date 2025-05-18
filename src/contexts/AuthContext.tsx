
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User, Provider } from "@supabase/supabase-js";
import { AuthState } from "@/types";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  authState: AuthState;
  signUp: (email: string, password: string, username: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithSocial: (provider: Provider) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updateProfile: (data: { username?: string, avatar_url?: string }) => Promise<{ error: any }>;
  username: string | null;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  authState: 'LOADING',
  signUp: async () => ({ error: new Error("Not implemented") }),
  signIn: async () => ({ error: new Error("Not implemented") }),
  signInWithSocial: async () => {},
  signOut: async () => {},
  resetPassword: async () => ({ error: new Error("Not implemented") }),
  updateProfile: async () => ({ error: new Error("Not implemented") }),
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
        .select('username, avatar_url')
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

  const signInWithSocial = async (provider: Provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        toast.error("Login failed", {
          description: error.message,
        });
      }
    } catch (error: any) {
      toast.error("Social login failed", {
        description: error.message,
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        toast.error("Password reset failed", {
          description: error.message,
        });
        return { error };
      }
      
      toast.success("Password reset email sent", {
        description: "Please check your inbox for further instructions.",
      });
      
      return { error: null };
    } catch (error: any) {
      toast.error("Password reset failed", {
        description: error.message,
      });
      return { error };
    }
  };

  const updateProfile = async (data: { username?: string, avatar_url?: string }) => {
    try {
      if (!user) {
        throw new Error("No user logged in");
      }
      
      // Update user metadata if username is provided
      if (data.username) {
        const { error: metadataError } = await supabase.auth.updateUser({
          data: {
            username: data.username,
          }
        });
        
        if (metadataError) {
          throw metadataError;
        }
      }
      
      // Update profile in the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          ...(data.username && { username: data.username }),
          ...(data.avatar_url && { avatar_url: data.avatar_url })
        })
        .eq('id', user.id);
      
      if (profileError) {
        throw profileError;
      }
      
      // Update local state if username is changed
      if (data.username) {
        setUsername(data.username);
      }
      
      toast.success("Profile updated successfully");
      return { error: null };
    } catch (error: any) {
      toast.error("Profile update failed", {
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
        signInWithSocial,
        signOut,
        resetPassword,
        updateProfile,
        username,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
