
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Moon, Sun, Plus } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useState } from "react";

interface HeaderProps {
  onSearch: (term: string) => void;
}

const Header = ({ onSearch }: HeaderProps) => {
  const { theme, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };
  
  return (
    <header className="sticky top-0 z-50 glassmorphism py-3 px-4 md:px-6">
      <div className="container max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center">
              <h1 className="font-bold text-xl md:text-2xl bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                LinkVault
              </h1>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/newest" className="text-sm font-medium hover:text-primary transition-colors">
                Newest
              </Link>
              <Link to="/tags" className="text-sm font-medium hover:text-primary transition-colors">
                Tags
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-[240px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search links..."
                className="w-full bg-secondary/50 pl-8"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
            
            <Button asChild className="hidden md:flex">
              <Link to="/submit">
                <Plus className="mr-2 h-4 w-4" />
                Submit Link
              </Link>
            </Button>
            
            <Button asChild size="icon" className="md:hidden">
              <Link to="/submit">
                <Plus className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
