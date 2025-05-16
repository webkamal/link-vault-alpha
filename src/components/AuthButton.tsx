
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { LogIn, LogOut, User } from "lucide-react";

export function AuthButton() {
  const { user, signOut, username, authState } = useAuth();

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>{username || "User"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Link to="/submit" className="flex items-center w-full">Submit Link</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={() => signOut()}>
          <LogOut className="h-4 w-4 mr-2" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
