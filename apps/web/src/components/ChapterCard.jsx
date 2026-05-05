import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Unlock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ChapterCard = ({ chapter }) => {
  const { id, title, description, isPremium, chapterNumber } = chapter;

  return (
    <Card className="flex flex-col h-full overflow-hidden group hover:shadow-lg transition-all duration-300 border-border/50">
      <CardHeader className="pb-4 relative">
        <div className="flex justify-between items-start mb-2">
          <span className="text-sm font-bold text-muted-foreground">Chapter {chapterNumber}</span>
          {isPremium ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20">
              <Lock className="h-3 w-3" /> Premium
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary/10 text-secondary border border-secondary/20">
              <Unlock className="h-3 w-3" /> Free Access
            </span>
          )}
        </div>
        <h3 className="text-xl font-bold text-foreground leading-tight">{title}</h3>
      </CardHeader>
      
      <CardContent className="flex-grow relative">
        <p className={`text-sm text-muted-foreground ${isPremium ? 'blur-[2px] select-none' : ''}`}>
          {description}
        </p>
        {isPremium && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[1px]">
            <Lock className="h-8 w-8 text-accent/50" />
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-4 border-t bg-muted/10">
        {isPremium ? (
          <Button asChild variant="outline" className="w-full border-accent/50 text-accent hover:bg-accent hover:text-accent-foreground group-hover:border-accent transition-colors">
            <a href="/#premium">Unlock Now</a>
          </Button>
        ) : (
          <Button asChild className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground group-hover:gap-3 transition-all">
            <Link to={`/chapter/${id}`}>
              Start Learning <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ChapterCard;