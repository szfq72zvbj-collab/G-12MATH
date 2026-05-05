import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, TrendingUp, CheckCircle2, Clock, DollarSign } from 'lucide-react';

const StudentDashboard = () => {
  const { currentUser } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [courseProgress, setCourseProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const purchaseRecords = await pb.collection('purchases').getFullList({
          filter: `studentId="${currentUser.id}"`,
          expand: 'courseId',
          sort: '-purchaseDate',
          $autoCancel: false,
        });
        setPurchases(purchaseRecords);

        const courseRecords = await pb.collection('courses').getFullList({
          sort: 'createdAt',
          $autoCancel: false,
        });
        setAllCourses(courseRecords);

        const progressData = {};
        for (const purchase of purchaseRecords) {
          if (purchase.expand?.courseId) {
            const courseId = purchase.expand.courseId.id;
            
            const lessons = await pb.collection('lessons').getFullList({
              filter: `courseId="${courseId}"`,
              $autoCancel: false,
            });

            const completedLessons = await pb.collection('progress').getFullList({
              filter: `studentId="${currentUser.id}" && courseId="${courseId}" && completed=true`,
              $autoCancel: false,
            });

            progressData[courseId] = {
              total: lessons.length,
              completed: completedLessons.length,
              percentage: lessons.length > 0 ? Math.round((completedLessons.length / lessons.length) * 100) : 0,
            };
          }
        }
        setCourseProgress(progressData);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser.id]);

  const purchasedCourseIds = purchases.map(p => p.expand?.courseId?.id).filter(Boolean);
  const availableCourses = allCourses.filter(course => !purchasedCourseIds.includes(course.id));

  return (
    <>
      <Helmet>
        <title>Dashboard - Grade 12 Math Academy</title>
        <meta name="description" content="View your enrolled courses, track progress, and manage your learning at Grade 12 Math Academy." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-grow py-8 sm:py-10 md:py-12 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-7xl">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 sm:mb-10 md:mb-12"
            >
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">Welcome, {currentUser?.name}</h1>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground">Continue your mathematics learning journey</p>
            </motion.div>

            {/* Purchased Courses Section */}
            <section className="mb-10 sm:mb-12 md:mb-16">
              <div className="flex items-center gap-2 mb-4 sm:mb-5 md:mb-6">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <h2 className="text-xl sm:text-2xl font-semibold">My courses</h2>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                  {[1, 2].map((i) => (
                    <Card key={i} className="p-3 sm:p-4">
                      <CardHeader className="p-3 sm:p-4">
                        <Skeleton className="h-5 sm:h-6 w-3/4 mb-2" />
                        <Skeleton className="h-3 sm:h-4 w-1/2" />
                      </CardHeader>
                      <CardContent className="p-3 sm:p-4">
                        <Skeleton className="h-3 sm:h-4 w-full mb-2" />
                        <Skeleton className="h-2 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : purchases.length === 0 ? (
                <Card className="bg-muted/50 border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-8 sm:py-10 md:py-12 px-4 text-center">
                    <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4 opacity-50" />
                    <h3 className="text-lg sm:text-xl font-semibold mb-1.5 sm:mb-2">No courses yet</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground max-w-sm">
                      Start your learning journey by enrolling in a course below
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                  {purchases.map((purchase, index) => {
                    const course = purchase.expand?.courseId;
                    if (!course) return null;

                    const progress = courseProgress[course.id] || { total: 0, completed: 0, percentage: 0 };

                    return (
                      <motion.div
                        key={purchase.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <Card className="h-full flex flex-col shadow-sm sm:shadow-md hover:shadow-lg transition-all duration-200">
                          <CardHeader className="p-4 sm:p-5 pb-0 sm:pb-2">
                            <CardTitle className="text-lg sm:text-xl line-clamp-1">{course.title}</CardTitle>
                            <CardDescription className="text-xs sm:text-sm mt-1">{course.instructor}</CardDescription>
                          </CardHeader>
                          <CardContent className="flex-grow p-4 sm:p-5 pt-3 sm:pt-4">
                            <div className="space-y-2 sm:space-y-3">
                              <div className="flex justify-between text-xs sm:text-sm">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="font-medium font-variant-tabular">{progress.percentage}%</span>
                              </div>
                              <Progress value={progress.percentage} className="h-1.5 sm:h-2" />
                              <p className="text-[10px] sm:text-xs text-muted-foreground">
                                {progress.completed} of {progress.total} lessons completed
                              </p>
                            </div>
                          </CardContent>
                          <CardFooter className="mt-auto p-4 sm:p-5 pt-0">
                            <Link to={`/course/${course.id}`} className="w-full">
                              <Button className="w-full py-2 sm:py-2.5 h-auto text-sm sm:text-base">Continue learning</Button>
                            </Link>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Available Courses Section */}
            {availableCourses.length > 0 && (
              <section className="mb-10 sm:mb-12 md:mb-16">
                <div className="flex items-center gap-2 mb-4 sm:mb-5 md:mb-6">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-secondary" />
                  <h2 className="text-xl sm:text-2xl font-semibold">Available courses</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                  {availableCourses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: Math.min(index * 0.1, 0.4) }}
                    >
                      <Card className="h-full flex flex-col bg-muted/40 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="p-4 sm:p-5 pb-0 sm:pb-2">
                          <CardTitle className="text-base sm:text-lg line-clamp-1">{course.title}</CardTitle>
                          <CardDescription className="text-xs mt-1 line-clamp-1">{course.instructor}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow p-4 sm:p-5 pt-2 sm:pt-3">
                          <div className="flex items-baseline gap-1.5 mt-2">
                            <span className="text-lg sm:text-xl font-bold text-primary font-variant-tabular">
                              {course.price.toLocaleString()}
                            </span>
                            <span className="text-[10px] sm:text-xs text-muted-foreground">MMK</span>
                          </div>
                        </CardContent>
                        <CardFooter className="mt-auto p-4 sm:p-5 pt-0">
                          <Link to={`/course/${course.id}`} className="w-full">
                            <Button variant="outline" className="w-full py-1.5 sm:py-2 h-auto text-xs sm:text-sm">View details</Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Payment History Section */}
            <section>
              <div className="flex items-center gap-2 mb-4 sm:mb-5 md:mb-6">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
                <h2 className="text-xl sm:text-2xl font-semibold">Payment history</h2>
              </div>

              {loading ? (
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <Skeleton className="h-10 sm:h-12 w-full mb-3 sm:mb-4" />
                    <Skeleton className="h-10 sm:h-12 w-full" />
                  </CardContent>
                </Card>
              ) : purchases.length === 0 ? (
                <Card className="bg-muted/50 border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-8 sm:py-10 px-4 text-center">
                    <Clock className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4 opacity-50" />
                    <h3 className="text-base sm:text-lg font-semibold mb-1">No payment history</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Your payment transactions will appear here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="overflow-hidden shadow-sm">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs sm:text-sm">
                        <thead className="bg-muted/50 border-b">
                          <tr>
                            <th className="text-left p-3 sm:p-4 font-semibold text-muted-foreground whitespace-nowrap">Course</th>
                            <th className="text-left p-3 sm:p-4 font-semibold text-muted-foreground whitespace-nowrap hidden sm:table-cell">Date</th>
                            <th className="text-left p-3 sm:p-4 font-semibold text-muted-foreground whitespace-nowrap">Amount</th>
                            <th className="text-left p-3 sm:p-4 font-semibold text-muted-foreground whitespace-nowrap">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {purchases.map((purchase) => (
                            <tr key={purchase.id} className="hover:bg-muted/20 transition-colors">
                              <td className="p-3 sm:p-4 font-medium line-clamp-2 sm:line-clamp-1 max-w-[120px] sm:max-w-none">
                                {purchase.expand?.courseId?.title || 'Unknown Course'}
                                <div className="sm:hidden text-[10px] text-muted-foreground mt-1 font-normal">
                                  {new Date(purchase.purchaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                </div>
                              </td>
                              <td className="p-3 sm:p-4 text-muted-foreground hidden sm:table-cell">
                                {new Date(purchase.purchaseDate).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </td>
                              <td className="p-3 sm:p-4 font-medium font-variant-tabular whitespace-nowrap">
                                {purchase.amount.toLocaleString()} MMK
                              </td>
                              <td className="p-3 sm:p-4">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap ${
                                    purchase.paymentStatus === 'completed'
                                      ? 'bg-accent/10 text-accent'
                                      : purchase.paymentStatus === 'pending'
                                      ? 'bg-secondary/10 text-secondary'
                                      : 'bg-destructive/10 text-destructive'
                                  }`}
                                >
                                  {purchase.paymentStatus === 'completed' && <CheckCircle2 className="h-3 w-3 hidden sm:inline" />}
                                  {purchase.paymentStatus.charAt(0).toUpperCase() + purchase.paymentStatus.slice(1)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default StudentDashboard;