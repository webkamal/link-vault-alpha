import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Settings, 
  LogOut, 
  Moon, 
  Sun, 
  Trophy, 
  CreditCard,
  UserCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AccountPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AccountPanel = ({ open, onOpenChange }: AccountPanelProps) => {
  const { user, signOut, username, authState } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (!user) {
    return null;
  }

  const userInitial = username ? username.charAt(0).toUpperCase() : "U";
  // Use raw_user_meta_data first, then fallback to user_metadata for avatar_url
  const avatarUrl = user.raw_user_meta_data?.avatar_url || user.user_metadata?.avatar_url;

  const handleSignOut = async () => {
    await signOut();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetContent className="w-80 max-w-md border-l" side="right">
        <div className="flex flex-col h-full pt-4">
          {/* User Profile Section */}
          <div className="flex flex-col items-start pb-4 border-b">
            <div className="flex items-center gap-3 mb-2 w-full">
              <Avatar className="h-12 w-12">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback>{userInitial}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold">{username || "User"}</span>
                <span className="text-sm text-muted-foreground truncate max-w-[180px]">
                  {user.email}
                </span>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              asChild 
              className="w-full justify-start"
              onClick={() => onOpenChange(false)}
            >
              <Link to="/profile">
                <UserCircle className="mr-2 h-4 w-4" />
                View Profile
              </Link>
            </Button>
          </div>

          {/* Menu Items */}
          <div className="flex flex-col gap-1 py-4">
            <Button 
              variant="ghost" 
              asChild 
              className="justify-start"
              onClick={() => onOpenChange(false)}
            >
              <Link to="/profile">
                <User className="mr-2 h-4 w-4" />
                Edit Avatar
              </Link>
            </Button>
            
            <Button 
              variant="ghost" 
              asChild 
              className="justify-start"
              onClick={() => onOpenChange(false)}
            >
              <Link to="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
            
            <Button 
              variant="ghost" 
              className="justify-start"
              onClick={toggleTheme}
            >
              {theme === "dark" ? (
                <>
                  <Sun className="mr-2 h-4 w-4" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="mr-2 h-4 w-4" />
                  Dark Mode
                </>
              )}
            </Button>
          </div>
          
          {/* Extra Features (like Reddit) */}
          <div className="flex flex-col gap-1 py-4 border-t border-b">
            <div className="flex items-center gap-2 px-2 py-3">
              <Trophy className="h-5 w-5 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="font-medium">LinkVault Achievements</span>
                <span className="text-xs text-muted-foreground">
                  Unlock by saving and organizing links
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-2 py-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="font-medium">Contributor Program</span>
                <span className="text-xs text-muted-foreground">
                  0 points earned
                </span>
              </div>
            </div>
          </div>
          
          {/* Logout Button */}
          <div className="mt-auto py-4">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AccountPanel;
