import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle2, Smartphone, Clock, Layout, Shield, ArrowRight, Send, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChapterCard from '@/components/ChapterCard.jsx';
import FeatureCard from '@/components/FeatureCard.jsx';
import { chapters } from '@/data/chapters.js';

const HomePage = () => {
  const features = [
    { icon: BookOpen, title: 'Chapter-by-Chapter', description: 'Structured learning path following the official Grade 12 curriculum.' },
    { icon: CheckCircle2, title: 'Exam-Focused', description: 'Clear explanations and examples tailored for exam success.' },
    { icon: Layout, title: 'Practice Questions', description: 'Test your knowledge with curated practice problems and solutions.' },
    { icon: Smartphone, title: 'Mobile-Friendly', description: 'Learn anywhere, anytime on your smartphone or tablet.' },
    { icon: Shield, title: 'Clean Interface', description: 'Distraction-free learning environment designed for focus.' },
    { icon: Clock, title: '24/7 Access', description: 'Unlimited access to your unlocked chapters whenever you need them.' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Grade 12 Mathematics Learning Hub</title>
        <meta name="description" content="Master Grade 12 Mathematics chapter by chapter with notes, examples, and practice questions." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Updated for 2026 Curriculum
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight mb-6 text-balance" style={{ letterSpacing: '-0.02em' }}>
                Grade 12 Mathematics <span className="text-primary">Learning Hub</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
                Master Grade 12 Mathematics chapter by chapter with comprehensive notes, step-by-step examples, and exam-focused practice questions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12 px-8 text-base">
                  <a href="#chapters">Start Free Learning</a>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base border-primary/20 hover:bg-primary/5">
                  <a href="#premium">Unlock Premium Chapters</a>
                </Button>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative lg:ml-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-3xl transform rotate-3 scale-105 -z-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1683879025805-a268b690613e" 
                alt="Student studying mathematics" 
                className="rounded-3xl shadow-2xl object-cover w-full h-[400px] lg:h-[500px]"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Chapters Section */}
      <section id="chapters" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Course Curriculum</h2>
            <p className="text-lg text-muted-foreground">
              Start with our free chapters to build your foundation, then unlock premium content to master the complete syllabus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {chapters.map((chapter) => (
              <ChapterCard key={chapter.id} chapter={chapter} />
            ))}
          </div>
        </div>
      </section>

      {/* Premium Unlock Section */}
      <section id="premium" className="py-24 bg-foreground text-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto bg-background/5 border border-background/10 rounded-3xl p-8 md:p-12 backdrop-blur-sm text-center">
            <div className="inline-flex items-center justify-center p-4 bg-accent/20 rounded-full mb-6">
              <Shield className="h-8 w-8 text-accent" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance">Unlock All Premium Chapters</h2>
            <p className="text-lg text-background/80 mb-8 max-w-2xl mx-auto">
              Get instant access to Chapters 4-11, including advanced topics, complete solutions, and exam preparation materials.
            </p>
            
            <div className="bg-background/10 rounded-2xl p-6 md:p-8 max-w-md mx-auto mb-8 border border-accent/30">
              <p className="text-sm text-accent uppercase tracking-wider font-bold mb-2">Payment Method</p>
              <div className="flex items-center justify-center gap-3 mb-4">
                <CreditCard className="h-6 w-6 text-background" />
                <span className="text-2xl font-bold">KBZPay</span>
              </div>
              <p className="text-3xl font-mono font-bold text-accent mb-2">09940902523</p>
              <p className="text-sm text-background/60">Account Name: Admin</p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground h-14 px-8 text-lg font-semibold">
                <Link to="/contact">I Have Paid - Send Proof</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg border-background/20 text-background hover:bg-background/10">
                <Link to="/contact">Contact Admin</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How to Get Access</h2>
            <p className="text-lg text-muted-foreground">Simple 3-step process to unlock your premium learning materials.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: '01', title: 'Make Payment', desc: 'Transfer the fee via KBZPay to the provided account number.' },
              { step: '02', title: 'Send Screenshot', desc: 'Use the contact form to send us your payment screenshot.' },
              { step: '03', title: 'Get Access', desc: 'Admin will verify and grant you full access within 24 hours.' }
            ].map((item, i) => (
              <div key={i} className="relative p-8 rounded-2xl bg-muted/30 border border-border/50 text-center group hover:-translate-y-1 transition-transform duration-300">
                <div className="text-5xl font-black text-primary/10 mb-4 group-hover:text-primary/20 transition-colors">{item.step}</div>
                <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Choose Our Hub?</h2>
            <p className="text-lg text-muted-foreground">Everything you need to excel in your Grade 12 Mathematics exam.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, i) => (
              <FeatureCard key={i} {...feature} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;