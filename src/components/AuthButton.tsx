
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { LogIn, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AuthButtonProps {
  onAccountClick?: () => void;
}

export function AuthButton({ onAccountClick }: AuthButtonProps) {
  const { user, authState, username } = useAuth();

  if (authState === 'LOADING') {
    return (
      <div className="h-9 w-24 bg-muted animate-pulse rounded"></div>
    );
  }

  if (!user) {
    return (
      <Button size="sm" variant="outline" asChild>
        <Link to="/auth" className="flex items-center gap-2">
          <LogIn className="h-4 w-4" />
          <span>Login</span>
        </Link>
      </Button>
    );
  }

  const userInitial = username ? username.charAt(0).toUpperCase() : "U";
  // Use raw_user_meta_data first, then fallback to user_metadata for avatar_url
  const avatarUrl = user.raw_user_meta_data?.avatar_url || user.user_metadata?.avatar_url;

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="flex items-center gap-2 px-2"
      onClick={onAccountClick}
    >
      <Avatar className="h-6 w-6">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback>{userInitial}</AvatarFallback>
      </Avatar>
      <span className="hidden sm:inline">{username || "User"}</span>
    </Button>
  );
}
