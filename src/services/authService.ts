
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
      
      // First check if the profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('id', user.id)
        .maybeSingle();
      
      if (checkError) {
        console.error("Error checking profile:", checkError);
        throw checkError;
      }
      
      let profileUpdateError = null;
      
      if (existingProfile) {
        // Update existing profile
        console.log("Updating existing profile");
        const { error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', user.id);
        
        profileUpdateError = error;
      } else {
        // Insert new profile
        console.log("Creating new profile");
        
        // Make sure we have a username for the new profile
        if (!updateData.username) {
          // If no username provided in the update data, use one from user metadata or a default
          updateData.username = user.user_metadata?.username || 
                               user.email?.split('@')[0] || 
                               `user_${user.id.substring(0, 8)}`;
        }
        
        const { error } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            ...updateData,
          });
        
        profileUpdateError = error;
      }
      
      if (profileUpdateError) {
        console.error("Profile update error:", profileUpdateError);
        throw profileUpdateError;
      }
      
      console.log("Profile updated successfully");
      return { error: null };
    } catch (error: any) {
      console.error("Profile update failed:", error);
      return { error };
    }
  }
};
