import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiServerClient from '@/lib/apiServerClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, BookOpen, Download } from 'lucide-react';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const transactionId = searchParams.get('transactionId');
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!transactionId) {
        setError('No transaction ID provided');
        setLoading(false);
        return;
      }

      try {
        const response = await apiServerClient.fetch(`/kbz-pay/verify/${transactionId}`);
        
        if (!response.ok) {
          throw new Error('Payment verification failed');
        }

        const data = await response.json();
        setPayment(data);
      } catch (err) {
        console.error('Verification error:', err);
        setError(err.message || 'Failed to verify payment');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [transactionId]);

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Verifying Payment - Grade 12 Math Academy</title>
        </Helmet>
        <div className="min-h-screen flex flex-col bg-background">
          <Header />
          <main className="flex-grow flex items-center justify-center py-12 px-4">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
                  <Skeleton className="h-8 w-3/4 mx-auto mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                </div>
              </CardContent>
            </Card>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  if (error || !payment) {
    return (
      <>
        <Helmet>
          <title>Payment Error - Grade 12 Math Academy</title>
        </Helmet>
        <div className="min-h-screen flex flex-col bg-background">
          <Header />
          <main className="flex-grow flex items-center justify-center py-12 px-4">
            <Card className="w-full max-w-md border-destructive">
              <CardHeader className="text-center">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✕</span>
                </div>
                <CardTitle className="text-destructive">Payment verification failed</CardTitle>
                <CardDescription>{error || 'Unable to verify your payment'}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Link to="/dashboard">
                  <Button variant="outline" className="w-full">Back to dashboard</Button>
                </Link>
              </CardContent>
            </Card>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  const isCompleted = payment.status === 'completed';

  return (
    <>
      <Helmet>
        <title>{`Payment ${isCompleted ? 'Successful' : 'Pending'} - Grade 12 Math Academy`}</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl"
          >
            <Card className={`shadow-lg ${isCompleted ? 'border-accent' : 'border-secondary'}`}>
              <CardHeader className="text-center">
                <div className={`w-20 h-20 rounded-full ${isCompleted ? 'bg-accent/10' : 'bg-secondary/10'} flex items-center justify-center mx-auto mb-4`}>
                  {isCompleted ? (
                    <CheckCircle2 className="h-12 w-12 text-accent" />
                  ) : (
                    <span className="text-4xl">⏳</span>
                  )}
                </div>
                <CardTitle className="text-3xl mb-2">
                  {isCompleted ? 'Payment successful' : 'Payment pending'}
                </CardTitle>
                <CardDescription className="text-base">
                  {isCompleted
                    ? 'Your enrollment is complete. You can now access the course.'
                    : 'Your payment is being processed. This may take a few minutes.'}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="bg-muted rounded-xl p-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transaction ID</span>
                    <span className="font-medium font-variant-tabular">{payment.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium font-variant-tabular">{payment.amount.toLocaleString()} MMK</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className={`font-medium ${isCompleted ? 'text-accent' : 'text-secondary'}`}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                  </div>
                </div>

                {isCompleted && (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link to={`/course/${payment.courseId}`} className="flex-1">
                      <Button className="w-full gap-2" size="lg">
                        <BookOpen className="h-5 w-5" />
                        Access course
                      </Button>
                    </Link>
                    <Button variant="outline" className="gap-2" size="lg">
                      <Download className="h-5 w-5" />
                      Download receipt
                    </Button>
                  </div>
                )}

                {!isCompleted && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      You will receive a confirmation email once the payment is processed.
                    </p>
                    <Link to="/dashboard">
                      <Button variant="outline">Back to dashboard</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PaymentSuccessPage;