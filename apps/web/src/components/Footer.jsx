import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Send, Facebook } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-muted/50 border-t pt-12 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-secondary/10 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-secondary" />
              </div>
              <span className="font-bold text-lg text-foreground">
                G12 Math Hub
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs">
              Built for Myanmar students. Master Grade 12 Mathematics chapter by chapter with comprehensive notes and practice.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-secondary transition-colors">Home</Link></li>
              <li><a href="/#chapters" className="hover:text-secondary transition-colors">Chapters</a></li>
              <li><a href="/#premium" className="hover:text-secondary transition-colors">Premium Access</a></li>
              <li><Link to="/contact" className="hover:text-secondary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Connect With Us</h3>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-background rounded-full border hover:border-secondary hover:text-secondary transition-colors">
                <Send className="h-5 w-5" />
                <span className="sr-only">Telegram</span>
              </a>
              <a href="#" className="p-2 bg-background rounded-full border hover:border-secondary hover:text-secondary transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Grade 12 Mathematics Learning Hub. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground">Privacy Policy</a>
            <a href="#" className="hover:text-foreground">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;