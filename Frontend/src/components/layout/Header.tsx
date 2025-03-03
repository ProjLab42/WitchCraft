import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileText, User, History, Plus, LogIn } from "lucide-react";
import { useEffect, useState } from "react";

export function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check for authentication cookie
    const checkAuth = () => {
      const authToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('authToken='));
      
      setIsAuthenticated(!!authToken);
    };
    
    checkAuth();
    
    // Listen for changes to cookies
    const handleStorageChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold tracking-tight">WitchCraft</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
            Dashboard
          </Link>
          <Link to="/templates" className="text-sm font-medium hover:text-primary transition-colors">
            Templates
          </Link>
          <Link to="/history" className="text-sm font-medium hover:text-primary transition-colors">
            History
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm" className="hidden md:flex gap-2">
            <Link to="/create">
              <Plus className="h-4 w-4" />
              <span>New Resume</span>
            </Link>
          </Button>
          
          {isAuthenticated ? (
            // Show profile button when authenticated
            <Button variant="ghost" size="icon" className="rounded-full" asChild>
              <Link to="/profile">
                <User className="h-5 w-5" />
                <span className="sr-only">Profile</span>
              </Link>
            </Button>
          ) : (
            // Show sign in/sign up buttons when not authenticated
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/signin">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
