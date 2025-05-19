
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { AuthState } from "@/types";

/**
 * Hook to handle the authentication state and session management
 */
export function useAuthState() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authState, setAuthState] = useState<AuthState>('LOADING');
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    // Set up the auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.id);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setAuthState(currentSession ? 'SIGNED_IN' : 'SIGNED_OUT');
        
        // Fetch username if user is logged in
        if (currentSession?.user) {
          setTimeout(() => {
            fetchUserProfile(currentSession.user.id);
          }, 0);
        } else {
          setUsername(null);
        }
      }
    );
    
    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Got existing session:", currentSession?.user?.id);
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
      console.log("Fetching profile for user:", userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      console.log("Profile data:", data);
      
      // Check if data exists and has username property
      if (data && data.username) {
        setUsername(data.username);
      }
      
      // Update user state with avatar_url in metadata if it exists in profiles
      if (data && data.avatar_url && user) {
        // Create a deep copy of the user object to modify it
        const updatedUser = { 
          ...user,
          user_metadata: { 
            ...(user.user_metadata || {}), 
            avatar_url: data.avatar_url 
          },
          raw_user_meta_data: { 
            ...(user.raw_user_meta_data || {}), 
            avatar_url: data.avatar_url 
          }
        };
        
        // Update the local user state
        setUser(updatedUser);
        
        // Update user metadata if avatar_url exists in profiles but not in user metadata or is different
        if (!user.user_metadata?.avatar_url || user.user_metadata.avatar_url !== data.avatar_url) {
          console.log("Updating user metadata with avatar_url:", data.avatar_url);
          await supabase.auth.updateUser({
            data: {
              avatar_url: data.avatar_url
            }
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  return {
    session,
    user,
    authState,
    username,
    setUsername,
    fetchUserProfile
  };
}
