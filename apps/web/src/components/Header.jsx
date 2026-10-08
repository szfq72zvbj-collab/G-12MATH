import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, BookOpen, ShieldCheck, LogIn, UserPlus, LayoutDashboard, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext.jsx';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, isAdmin, logout } = useAuth();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Chapters', path: '/#chapters' },
    { name: 'Premium', path: '/#premium' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const AuthActions = () => (
    <div className="flex flex-wrap items-center gap-2">
      {isAuthenticated ? (
        <>
          <Button asChild variant="ghost" size="sm">
            <Link to="/dashboard"><LayoutDashboard className="h-4 w-4 mr-1.5" />Dashboard</Link>
          </Button>
          {isAdmin && (
            <Button asChild variant="outline" size="sm">
              <Link to="/admin"><ShieldCheck className="h-4 w-4 mr-1.5" />Admin</Link>
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-1.5" />Sign out
          </Button>
        </>
      ) : (
        <>
          <Button asChild variant="ghost" size="sm">
            <Link to="/login"><LogIn className="h-4 w-4 mr-1.5" />Login</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/signup"><UserPlus className="h-4 w-4 mr-1.5" />Create account</Link>
          </Button>
        </>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 items-center justify-between gap-4 py-2">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="bg-primary/10 p-2 rounded-lg"><BookOpen className="h-6 w-6 text-primary" /></div>
            <span className="font-bold text-lg tracking-tight text-foreground">G12 Math Hub</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => link.path.startsWith('/#') ? (
              <a key={link.name} href={link.path} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">{link.name}</a>
            ) : (
              <Link key={link.name} to={link.path} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">{link.name}</Link>
            ))}
          </nav>

          <div className="hidden md:block"><AuthActions /></div>

          <button className="md:hidden p-2 text-foreground" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle navigation">
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col gap-2 mb-4">
              {navLinks.map((link) => link.path.startsWith('/#') ? (
                <a key={link.name} href={link.path} onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium text-foreground px-2 py-2 rounded-md hover:bg-muted">{link.name}</a>
              ) : (
                <Link key={link.name} to={link.path} onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium text-foreground px-2 py-2 rounded-md hover:bg-muted">{link.name}</Link>
              ))}
            </nav>
            <AuthActions />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
