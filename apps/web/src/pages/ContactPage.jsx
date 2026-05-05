import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Send, Facebook, Mail, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Message sent successfully! Admin will review your payment proof shortly.');
      e.target.reset();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background py-20">
      <Helmet>
        <title>Contact Us | G12 Math Hub</title>
      </Helmet>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-4">Contact Admin</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have you made a payment? Send us your details to unlock premium access, or reach out if you have any questions.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-12">
          {/* Contact Info */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-muted/30 rounded-2xl p-8 border border-border/50">
              <h3 className="text-xl font-bold mb-6">Direct Contact</h3>
              
              <div className="space-y-6">
                <a href="#" className="flex items-center gap-4 group">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Send className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Telegram</p>
                    <p className="text-sm text-muted-foreground">@G12MathAdmin</p>
                  </div>
                </a>
                
                <a href="#" className="flex items-center gap-4 group">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Facebook className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Facebook Page</p>
                    <p className="text-sm text-muted-foreground">G12 Math Hub Myanmar</p>
                  </div>
                </a>

                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Email</p>
                    <p className="text-sm text-muted-foreground">support@g12mathhub.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-3">
            <div className="bg-card rounded-2xl p-8 border border-border/50 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="h-6 w-6 text-accent" />
                <h2 className="text-2xl font-bold">Send Payment Proof</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-foreground">Full Name</label>
                    <Input id="name" required placeholder="e.g. Aung Aung" className="bg-muted/50" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium text-foreground">Phone Number (KBZPay)</label>
                    <Input id="phone" required placeholder="09xxxxxxxxx" className="bg-muted/50" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">Email Address</label>
                  <Input id="email" type="email" required placeholder="your@email.com" className="bg-muted/50" />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-foreground">Message / Transaction ID</label>
                  <textarea 
                    id="message" 
                    required 
                    rows={4}
                    className="flex w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Please include your KBZPay transaction ID or any other details..."
                  ></textarea>
                </div>

                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-12 text-base" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Submit Details'}
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-4">
                  Admin will verify your payment and grant access within 24 hours.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;