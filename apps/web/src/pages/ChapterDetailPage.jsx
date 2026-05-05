import React from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import { Lock, ArrowLeft, BookOpen, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { chapters } from '@/data/chapters.js';

const ChapterDetailPage = () => {
  const { id } = useParams();
  const chapter = chapters.find(c => c.id === id);

  if (!chapter) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl font-bold text-foreground mb-4">Chapter Not Found</h1>
        <p className="text-muted-foreground mb-8">The chapter you are looking for does not exist.</p>
        <Button asChild>
          <Link to="/">Return Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Helmet>
        <title>{`Chapter ${chapter.chapterNumber}: ${chapter.title} | G12 Math Hub`}</title>
      </Helmet>

      {/* Header Area */}
      <div className="bg-muted/30 border-b pt-12 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <Link to="/#chapters" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Chapters
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm font-bold tracking-wider text-primary uppercase">Chapter {chapter.chapterNumber}</span>
            {chapter.isPremium ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20">
                <Lock className="h-3 w-3" /> Premium
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary/10 text-secondary border border-secondary/20">
                Free Access
              </span>
            )}
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
            {chapter.title}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {chapter.description}
          </p>
        </div>
      </div>

      {/* Content Area */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl mt-12">
        {chapter.isPremium ? (
          <div className="relative rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
            <div className="p-8 md:p-12 blur-[4px] select-none opacity-40 pointer-events-none">
              <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
              <p className="mb-6 text-muted-foreground">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
              <div className="h-32 bg-muted rounded-lg mb-6"></div>
              <h2 className="text-2xl font-bold mb-4">2. Key Formulas</h2>
              <p className="mb-6 text-muted-foreground">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
            </div>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm p-6 text-center">
              <div className="h-16 w-16 bg-accent/20 rounded-full flex items-center justify-center mb-6">
                <Lock className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Premium Content Locked</h3>
              <p className="text-muted-foreground max-w-md mb-8">
                Unlock this chapter and all other premium content to access full notes, examples, and practice questions.
              </p>
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground px-8">
                <Link to="/#premium">Unlock Now</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="rounded-2xl border border-border/50 bg-card p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b">
                <BookOpen className="h-6 w-6 text-secondary" />
                <h2 className="text-2xl font-bold">Chapter Materials</h2>
              </div>
              
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50 flex items-start gap-4">
                  <PlayCircle className="h-6 w-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Video Lesson</h3>
                    <p className="text-sm text-muted-foreground mb-3">Watch the comprehensive explanation of the core concepts.</p>
                    <Button variant="secondary" size="sm" className="bg-primary/10 text-primary hover:bg-primary/20">Watch Now</Button>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50 flex items-start gap-4">
                  <BookOpen className="h-6 w-6 text-secondary shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Study Notes</h3>
                    <p className="text-sm text-muted-foreground mb-3">Read through the detailed notes and step-by-step examples.</p>
                    <Button variant="secondary" size="sm" className="bg-secondary/10 text-secondary hover:bg-secondary/20">Read Notes</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChapterDetailPage;