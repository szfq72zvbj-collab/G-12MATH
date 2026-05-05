import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import PaymentForm from '@/components/PaymentForm.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { BookOpen, ShieldCheck, CreditCard } from 'lucide-react';

const PaymentPage = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseRecord = await pb.collection('courses').getOne(courseId, { $autoCancel: false });
        setCourse(courseRecord);
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Payment - Grade 12 Math Academy</title>
        </Helmet>
        <div className="min-h-screen flex flex-col bg-background">
          <Header />
          <main className="flex-grow py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto max-w-4xl space-y-6">
              <Skeleton className="h-8 sm:h-12 w-2/3 sm:w-1/2" />
              <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                <Skeleton className="h-64 sm:h-96 rounded-xl" />
                <Skeleton className="h-80 sm:h-96 rounded-xl" />
              </div>
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
        <Helmet>
          <title>Course Not Found - Grade 12 Math Academy</title>
        </Helmet>
        <div className="min-h-screen flex flex-col bg-background">
          <Header />
          <main className="flex-grow flex items-center justify-center py-12 px-4 text-center">
            <div>
              <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-3 sm:mb-4 opacity-50" />
              <h1 className="text-xl sm:text-2xl font-bold mb-2">Course not found</h1>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">The course you're trying to purchase doesn't exist</p>
              <Link to="/dashboard">
                <Button size="sm" className="py-2 h-auto text-sm sm:text-base">Back to dashboard</Button>
              </Link>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Payment - ${course.title} - Grade 12 Math Academy`}</title>
        <meta name="description" content={`Complete your enrollment for ${course.title}`} />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-grow py-6 sm:py-10 md:py-12 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 sm:mb-8"
            >
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 text-balance">Complete enrollment</h1>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground">Secure payment via KBZ PAY</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
              {/* Course Summary */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="order-2 md:order-1"
              >
                <Card className="shadow-sm sm:shadow-md border-border/60">
                  <CardHeader className="p-4 sm:p-5 md:p-6 pb-2 sm:pb-3">
                    <CardTitle className="text-lg sm:text-xl">Order summary</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Review your purchase details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-5 p-4 sm:p-5 md:p-6 pt-2">
                    <div className="bg-muted/30 p-3 sm:p-4 rounded-lg">
                      <h3 className="font-semibold text-base sm:text-lg mb-1 line-clamp-2">{course.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">by {course.instructor}</p>
                    </div>

                    <div className="pt-2 border-t space-y-2.5 sm:space-y-3">
                      <div className="flex items-start gap-2.5 sm:gap-3 p-2 hover:bg-muted/20 rounded-md transition-colors">
                        <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium text-xs sm:text-sm text-foreground/90">Lifetime access</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">Learn at your own pace anytime</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 sm:gap-3 p-2 hover:bg-muted/20 rounded-md transition-colors">
                        <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium text-xs sm:text-sm text-foreground/90">Secure payment</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">Protected directly by KBZ PAY</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 sm:gap-3 p-2 hover:bg-muted/20 rounded-md transition-colors">
                        <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium text-xs sm:text-sm text-foreground/90">Instant access</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">Start learning immediately after payment</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t mt-2">
                      <div className="flex justify-between items-end bg-primary/5 p-3 sm:p-4 rounded-lg border border-primary/10">
                        <span className="text-sm sm:text-base font-semibold text-foreground/80 mb-1">Total Due</span>
                        <div className="text-right">
                          <span className="text-2xl sm:text-3xl font-bold text-primary font-variant-tabular leading-none">
                            {course.price.toLocaleString()}
                          </span>
                          <span className="text-xs sm:text-sm text-muted-foreground ml-1 font-medium">MMK</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Payment Form */}
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="order-1 md:order-2"
              >
                <PaymentForm course={course} />
              </motion.div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PaymentPage;