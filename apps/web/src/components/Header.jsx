import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Chapters', path: '/#chapters' },
    { name: 'Premium', path: '/#premium' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground">
              G12 Math Hub
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.path.startsWith('/#') ? link.path : undefined}
                onClick={(e) => {
                  if (!link.path.startsWith('/#')) return;
                  if (location.pathname !== '/') {
                    window.location.href = link.path;
                  }
                }}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {link.path.startsWith('/#') ? (
                  link.name
                ) : (
                  <Link to={link.path}>{link.name}</Link>
                )}
              </a>
            ))}
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <a href="/#premium">Unlock Premium</a>
            </Button>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.path.startsWith('/#') ? link.path : undefined}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-base font-medium text-foreground px-2 py-1 rounded-md hover:bg-muted"
                >
                  {link.path.startsWith('/#') ? (
                    link.name
                  ) : (
                    <Link to={link.path} className="block w-full">{link.name}</Link>
                  )}
                </a>
              ))}
              <div className="pt-2">
                <Button asChild className="w-full bg-primary">
                  <a href="/#premium" onClick={() => setIsMobileMenuOpen(false)}>Unlock Premium</a>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;