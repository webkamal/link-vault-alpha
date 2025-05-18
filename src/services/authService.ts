
import { supabase } from "@/integrations/supabase/client";
import { Provider } from "@supabase/supabase-js";
import { toast } from "sonner";

/**
 * Service to handle authentication operations
 */
export const authService = {
  /**
   * Signs up a new user
   */
  signUp: async (email: string, password: string, username: string) => {
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
      }
      
      return { error: null };
    } catch (error: any) {
      toast.error("Registration failed", {
        description: error.message,
      });
      return { error };
    }
  },
  
  /**
   * Signs in an existing user with email and password
   */
  signIn: async (email: string, password: string) => {
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
      }
      
      return { error: null };
    } catch (error: any) {
      toast.error("Login failed", {
        description: error.message,
      });
      return { error };
    }
  },

  /**
   * Signs in a user with a third-party provider
   */
  signInWithSocial: async (provider: Provider) => {
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
      
      return { error };
    } catch (error: any) {
      toast.error("Social login failed", {
        description: error.message,
      });
      return { error };
    }
  },

  /**
   * Signs out the current user
   */
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.info("You have been logged out");
      return { error: null };
    } catch (error: any) {
      console.error("Error signing out:", error);
      return { error };
    }
  },

  /**
   * Sends a password reset email
   */
  resetPassword: async (email: string) => {
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
  },

  /**
   * Updates user profile
   */
  updateProfile: async (user: any, data: { username?: string, avatar_url?: string }) => {
    try {
      if (!user) {
        throw new Error("No user logged in");
      }
      
      console.log("Updating profile with:", data);
      
      // Update user metadata if avatar_url is provided
      if (data.avatar_url) {
        console.log("Updating user metadata with avatar_url:", data.avatar_url);
        const { error: metadataError } = await supabase.auth.updateUser({
          data: {
            avatar_url: data.avatar_url,
          }
        });
        
        if (metadataError) {
          console.error("Error updating user metadata:", metadataError);
          throw metadataError;
        }
      }
      
      // Update profile in the profiles table
      const updateData: Record<string, any> = {};
      if (data.username) updateData.username = data.username;
      if (data.avatar_url) updateData.avatar_url = data.avatar_url;
      
      console.log("Updating profile table with:", updateData);
      
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', user.id);
        
        if (profileError) {
          console.error("Error updating profile:", profileError);
          
          // If error mentions avatar_url doesn't exist, try updating just the username
          if (profileError.message?.includes('avatar_url') && data.username) {
            const { error: usernameError } = await supabase
              .from('profiles')
              .update({ username: data.username })
              .eq('id', user.id);
              
            if (usernameError) {
              throw usernameError;
            }
          } else {
            throw profileError;
          }
        }
      } catch (error) {
        console.error("Profile update error:", error);
        throw error;
      }
      
      console.log("Profile updated successfully");
      return { error: null };
    } catch (error: any) {
      console.error("Profile update failed:", error);
      return { error };
    }
  }
};
