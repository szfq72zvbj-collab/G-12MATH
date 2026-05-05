import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { BookOpen, CheckCircle2, PlayCircle, FileText, Lock } from 'lucide-react';

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const { currentUser } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const courseRecord = await pb.collection('courses').getOne(courseId, { $autoCancel: false });
        setCourse(courseRecord);

        const purchaseRecords = await pb.collection('purchases').getList(1, 1, {
          filter: `studentId="${currentUser.id}" && courseId="${courseId}"`,
          $autoCancel: false,
        });
        const purchased = purchaseRecords.items.length > 0;
        setHasPurchased(purchased);

        if (purchased) {
          const lessonRecords = await pb.collection('lessons').getFullList({
            filter: `courseId="${courseId}"`,
            sort: 'order',
            $autoCancel: false,
          });
          setLessons(lessonRecords);

          const progressRecords = await pb.collection('progress').getFullList({
            filter: `studentId="${currentUser.id}" && courseId="${courseId}"`,
            $autoCancel: false,
          });

          const progressMap = {};
          progressRecords.forEach(p => {
            progressMap[p.lessonId] = p;
          });
          setProgress(progressMap);
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
        toast.error('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, currentUser.id]);

  const handleToggleCompletion = async (lessonId, currentlyCompleted) => {
    try {
      const existingProgress = progress[lessonId];

      if (existingProgress) {
        await pb.collection('progress').update(existingProgress.id, {
          completed: !currentlyCompleted,
          completedAt: !currentlyCompleted ? new Date().toISOString() : null,
        }, { $autoCancel: false });
      } else {
        await pb.collection('progress').create({
          studentId: currentUser.id,
          courseId: courseId,
          lessonId: lessonId,
          completed: true,
          completedAt: new Date().toISOString(),
        }, { $autoCancel: false });
      }

      const progressRecords = await pb.collection('progress').getFullList({
        filter: `studentId="${currentUser.id}" && courseId="${courseId}"`,
        $autoCancel: false,
      });

      const progressMap = {};
      progressRecords.forEach(p => {
        progressMap[p.lessonId] = p;
      });
      setProgress(progressMap);

      toast.success(!currentlyCompleted ? 'Lesson marked as complete' : 'Lesson marked as incomplete');
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  };

  if (loading) {
    return (
      <>
        <Helmet><title>Loading... - Grade 12 Math Academy</title></Helmet>
        <div className="min-h-screen flex flex-col bg-background">
          <Header />
          <main className="flex-grow py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto max-w-4xl space-y-4">
              <Skeleton className="h-8 sm:h-12 w-3/4 mb-2 sm:mb-4" />
              <Skeleton className="h-4 sm:h-6 w-1/2 mb-6 sm:mb-8" />
              <Skeleton className="h-48 sm:h-64 w-full rounded-xl" />
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  if (!course) {
    return (
      <>
        <Helmet><title>Course Not Found - Grade 12 Math Academy</title></Helmet>
        <div className="min-h-screen flex flex-col bg-background">
          <Header />
          <main className="flex-grow flex items-center justify-center py-12 px-4 text-center">
            <div>
              <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-3 sm:mb-4 opacity-50" />
              <h1 className="text-xl sm:text-2xl font-bold mb-1.5 sm:mb-2">Course not found</h1>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">The course you're looking for doesn't exist</p>
              <Link to="/dashboard">
                <Button size="sm" className="text-sm sm:text-base py-2 h-auto">Back to dashboard</Button>
              </Link>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  const completedLessons = Object.values(progress).filter(p => p.completed).length;
  const progressPercentage = lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0;

  return (
    <>
      <Helmet>
        <title>{`${course.title} - Grade 12 Math Academy`}</title>
        <meta name="description" content={course.description} />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-grow py-6 sm:py-10 md:py-12 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-4xl">
            {/* Course Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 sm:mb-10 md:mb-12"
            >
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4 text-balance leading-tight">{course.title}</h1>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-2 sm:mb-3">Instructor: {course.instructor}</p>
              
              {hasPurchased && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm bg-muted/50 p-3 rounded-lg w-fit">
                  <span className="text-muted-foreground">
                    Progress: <span className="font-medium text-foreground font-variant-tabular">{progressPercentage}%</span>
                  </span>
                  <span className="hidden sm:inline text-muted-foreground/30">•</span>
                  <span className="text-muted-foreground">
                    {completedLessons} of {lessons.length} lessons completed
                  </span>
                </div>
              )}
            </motion.div>

            {/* Course Preview (Not Purchased) */}
            {!hasPurchased && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="shadow-md sm:shadow-lg mb-6 sm:mb-8 border-border/50">
                  <CardHeader className="p-4 sm:p-5 md:p-6 pb-2 sm:pb-4">
                    <CardTitle className="text-lg sm:text-xl">Course overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-5 md:p-6 pt-0">
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{course.description}</p>

                    <div className="bg-muted/50 rounded-xl p-4 sm:p-5 md:p-6 border">
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <span className="text-sm sm:text-base font-semibold text-foreground/80">Course price</span>
                        <span className="text-xl sm:text-2xl md:text-3xl font-bold text-primary font-variant-tabular">
                          {course.price.toLocaleString()} <span className="text-sm sm:text-base font-normal text-muted-foreground">MMK</span>
                        </span>
                      </div>
                      <Link to={`/payment/${course.id}`}>
                        <Button className="w-full py-2.5 sm:py-3 md:py-3.5 h-auto text-sm sm:text-base shadow-sm">
                          Enroll now to unlock access
                        </Button>
                      </Link>
                    </div>

                    <div className="flex items-start gap-2.5 sm:gap-3 p-3 sm:p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-xs sm:text-sm mb-0.5 sm:mb-1 text-primary/90">Course content locked</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          Enroll in this course to access all lessons and learning materials
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Lessons List (Purchased) */}
            {hasPurchased && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Course content</h2>

                {lessons.length === 0 ? (
                  <Card className="bg-muted/30 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-10 sm:py-12 px-4 text-center">
                      <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4 opacity-40" />
                      <h3 className="text-base sm:text-lg font-medium mb-1">No lessons available yet</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">The instructor is preparing the course content.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {lessons.map((lesson, index) => {
                      const isCompleted = progress[lesson.id]?.completed || false;

                      return (
                        <motion.div
                          key={lesson.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.05 }}
                        >
                          <Card className={`lesson-card transition-all duration-200 border-l-4 ${isCompleted ? 'border-l-accent bg-accent/5' : 'border-l-border hover:shadow-md'}`}>
                            <CardContent className="p-4 sm:p-5 md:p-6 flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-start">
                              <div className="flex items-center gap-3 sm:mt-1">
                                <Checkbox
                                  checked={isCompleted}
                                  onCheckedChange={() => handleToggleCompletion(lesson.id, isCompleted)}
                                  className={`h-5 w-5 sm:h-4 sm:w-4 ${isCompleted ? 'data-[state=checked]:bg-accent data-[state=checked]:border-accent' : ''}`}
                                />
                                <h3 className="text-base sm:text-lg font-medium sm:hidden line-clamp-1">{lesson.title}</h3>
                                {isCompleted && <CheckCircle2 className="h-4 w-4 text-accent sm:hidden shrink-0 ml-auto" />}
                              </div>

                              <div className="flex-grow flex flex-col gap-2 sm:gap-3 pl-8 sm:pl-0">
                                <div className="hidden sm:flex items-start justify-between gap-4">
                                  <h3 className={`text-base sm:text-lg font-medium ${isCompleted ? 'text-foreground/80' : 'text-foreground'}`}>{lesson.title}</h3>
                                  {isCompleted && <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />}
                                </div>

                                <p className={`text-xs sm:text-sm line-clamp-2 ${isCompleted ? 'text-muted-foreground/80' : 'text-muted-foreground'}`}>
                                  {lesson.content}
                                </p>

                                <div className="mt-1 sm:mt-2">
                                  <Button
                                    variant={isCompleted ? "ghost" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedLesson(lesson)}
                                    className={`gap-1.5 sm:gap-2 text-xs sm:text-sm py-1.5 sm:py-2 h-auto ${isCompleted ? 'hover:bg-accent/10 hover:text-accent-foreground' : ''}`}
                                  >
                                    <PlayCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    {isCompleted ? 'Review lesson' : 'Start lesson'}
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </main>

        {/* Lesson Detail Modal */}
        <Dialog open={!!selectedLesson} onOpenChange={(open) => !open && setSelectedLesson(null)}>
          <DialogContent className="w-[95vw] max-w-3xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-xl sm:rounded-2xl">
            <DialogHeader className="mb-4 sm:mb-6">
              <DialogTitle className="text-lg sm:text-xl md:text-2xl pr-6">{selectedLesson?.title}</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">Lesson content and materials</DialogDescription>
            </DialogHeader>

            <div className="space-y-5 sm:space-y-6">
              {selectedLesson?.videoUrl && (
                <div className="aspect-video bg-black/5 rounded-lg sm:rounded-xl flex items-center justify-center border overflow-hidden relative">
                  {/* Placeholder for video player */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                    <PlayCircle className="h-10 w-10 sm:h-12 sm:w-12 text-primary/40 mx-auto mb-2 sm:mb-3" />
                    <p className="text-xs sm:text-sm text-muted-foreground max-w-[80%] break-all bg-background/80 px-3 py-1 rounded-md backdrop-blur-sm">
                      {selectedLesson.videoUrl}
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-muted/30 p-4 sm:p-5 rounded-lg sm:rounded-xl border">
                <h3 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3 flex items-center gap-2 text-foreground/90">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Lesson notes
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedLesson?.content || "No notes provided for this lesson."}
                </p>
              </div>

              {selectedLesson?.materials && (
                <div className="bg-primary/5 p-4 sm:p-5 rounded-lg sm:rounded-xl border border-primary/10">
                  <h3 className="font-semibold text-sm sm:text-base mb-1 text-primary/90">Learning materials</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Additional materials available for download
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3 pt-4 sm:pt-5 border-t">
                <Checkbox
                  id="modal-complete-cb"
                  checked={progress[selectedLesson?.id]?.completed || false}
                  onCheckedChange={() =>
                    handleToggleCompletion(selectedLesson.id, progress[selectedLesson?.id]?.completed || false)
                  }
                  className="h-5 w-5 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                />
                <label htmlFor="modal-complete-cb" className="text-sm font-medium cursor-pointer select-none">
                  Mark this lesson as complete
                </label>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Footer />
      </div>
    </>
  );
};

export default CourseDetailPage;