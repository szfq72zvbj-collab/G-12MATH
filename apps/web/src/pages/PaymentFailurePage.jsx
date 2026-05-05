import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, RefreshCw, Home } from 'lucide-react';

const PaymentFailurePage = () => {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');
  const error = searchParams.get('error') || 'Payment was not completed';

  return (
    <>
      <Helmet>
        <title>Payment Failed - Grade 12 Math Academy</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Card className="shadow-lg border-destructive">
              <CardHeader className="text-center">
                <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <XCircle className="h-12 w-12 text-destructive" />
                </div>
                <CardTitle className="text-3xl mb-2 text-destructive">Payment failed</CardTitle>
                <CardDescription className="text-base">
                  Your payment could not be processed
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                  <p className="text-sm text-destructive-foreground">
                    <strong>Error:</strong> {error}
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Your payment was not completed. This could be due to:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Insufficient funds</li>
                    <li>Payment cancellation</li>
                    <li>Network connection issues</li>
                    <li>Invalid payment details</li>
                  </ul>
                </div>

                <div className="flex flex-col gap-3">
                  {courseId && (
                    <Link to={`/payment/${courseId}`}>
                      <Button className="w-full gap-2" size="lg">
                        <RefreshCw className="h-5 w-5" />
                        Try again
                      </Button>
                    </Link>
                  )}
                  <Link to="/dashboard">
                    <Button variant="outline" className="w-full gap-2" size="lg">
                      <Home className="h-5 w-5" />
                      Back to dashboard
                    </Button>
                  </Link>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  If you continue to experience issues, please contact our support team
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PaymentFailurePage;