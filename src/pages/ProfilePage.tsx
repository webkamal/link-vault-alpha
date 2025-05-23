
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Upload } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { toast } from "sonner";

const ProfilePage = () => {
  const { user, username, updateProfile, authState, fetchUserProfile } = useAuth();
  const [newUsername, setNewUsername] = useState(username || "");
  const [uploading, setUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    user?.user_metadata?.avatar_url || null
  );

  // Update local state when user changes
  useEffect(() => {
    if (user) {
      setAvatarUrl(user.user_metadata?.avatar_url || null);
    }
  }, [user]);

  // If not logged in, redirect to login page
  if (authState === 'SIGNED_OUT') {
    return <Navigate to="/auth" replace />;
  }

  // Show loading state while checking authentication
  if (authState === 'LOADING' || !user) {
    return (
      <div className="container max-w-3xl mx-auto py-8">
        <div className="h-32 w-full bg-muted animate-pulse rounded-md"></div>
      </div>
    );
  }

  const userInitial = username ? username.charAt(0).toUpperCase() : "U";

  const handleUsernameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newUsername.trim() === username || !newUsername.trim()) return;

    setIsUpdating(true);
    try {
      const { error } = await updateProfile({ username: newUsername.trim() });
      if (error) {
        throw error;
      }
      toast.success("Username updated successfully");
    } catch (error: any) {
      toast.error("Error updating username", { 
        description: error.message 
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!e.target.files || e.target.files.length === 0) {
        return;
      }

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log("Uploading avatar:", filePath);

      // Upload the file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { 
          upsert: true,
          contentType: file.type 
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log("Avatar uploaded successfully, public URL:", publicUrl);

      // Update user profile with new avatar URL
      const { error } = await updateProfile({ avatar_url: publicUrl });
      
      if (error) {
        console.error("Error updating profile with avatar:", error);
        throw error;
      }
      
      setAvatarUrl(publicUrl);
      
      // Refresh user profile to ensure the avatar is updated
      if (fetchUserProfile && user.id) {
        await fetchUserProfile(user.id);
      }
      
      toast.success("Profile picture updated successfully");

    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error("Error uploading avatar", { 
        description: error.message || "Failed to upload image" 
      });
    } finally {
      setUploading(false);
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

      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

      <Card className="p-6 space-y-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback className="text-2xl">{userInitial}</AvatarFallback>
          </Avatar>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="avatar" className="cursor-pointer bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-md flex items-center gap-2">
              <Upload className="h-4 w-4" />
              {uploading ? "Uploading..." : "Upload Picture"}
            </Label>
            <Input 
              id="avatar" 
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={handleAvatarUpload}
            />
          </div>
        </div>

        <Separator />

        <form onSubmit={handleUsernameUpdate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email"
              value={user.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input 
              id="username" 
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Your username"
              disabled={isUpdating}
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={isUpdating || newUsername.trim() === username || !newUsername.trim()}
          >
            {isUpdating ? "Updating..." : "Update Username"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ProfilePage;
