
import { createContext, useContext } from "react";
import { Session, User, Provider } from "@supabase/supabase-js";
import { AuthState } from "@/types";
import { useAuthState } from "@/hooks/useAuthState";
import { authService } from "@/services/authService";
import { useNavigate } from "react-router-dom";

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
  fetchUserProfile?: (userId: string) => Promise<void>;
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
  fetchUserProfile: undefined,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { session, user, authState, username, setUsername, fetchUserProfile } = useAuthState();

  const signUp = async (email: string, password: string, username: string) => {
    const result = await authService.signUp(email, password, username);
    if (!result.error) {
      navigate('/');
    }
    return result;
  };

  const signIn = async (email: string, password: string) => {
    const result = await authService.signIn(email, password);
    if (!result.error) {
      navigate('/');
    }
    return result;
  };

  const signInWithSocial = async (provider: Provider) => {
    await authService.signInWithSocial(provider);
  };

  const signOut = async () => {
    await authService.signOut();
    navigate('/');
  };

  const resetPassword = async (email: string) => {
    return await authService.resetPassword(email);
  };

  const updateProfile = async (data: { username?: string, avatar_url?: string }) => {
    if (!user) {
      return { error: new Error("No user logged in") };
    }
    
    const result = await authService.updateProfile(user, data);
    
    // Update local username state if username is changed
    if (!result.error && data.username) {
      setUsername(data.username);
    }
    
    // Refresh profile data to update avatar
    if (!result.error && user.id) {
      setTimeout(() => {
        fetchUserProfile(user.id);
      }, 300); // Small delay to ensure Supabase has updated
    }
    
    return result;
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
        fetchUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
