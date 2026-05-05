import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { GraduationCap } from 'lucide-react';

const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await signup(formData.name, formData.email, formData.phone, formData.password);
      toast.success('Account created successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign Up - Grade 12 Math Academy</title>
        <meta name="description" content="Create an account to start learning mathematics at Grade 12 Math Academy." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-grow flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
          <Card className="w-full max-w-sm sm:max-w-md shadow-md sm:shadow-lg border-border/50">
            <CardHeader className="text-center pb-4 sm:pb-6 p-4 sm:p-6">
              <div className="flex justify-center mb-3 sm:mb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 sm:h-10 sm:w-10 text-primary" />
                </div>
              </div>
              <CardTitle className="text-xl sm:text-2xl">Create account</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Start your learning journey today</CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                <div className="space-y-1 sm:space-y-1.5">
                  <Label htmlFor="name" className="text-xs sm:text-sm">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Aung Kyaw"
                    required
                    className="text-foreground text-sm sm:text-base py-2 sm:py-2.5"
                  />
                </div>

                <div className="space-y-1 sm:space-y-1.5">
                  <Label htmlFor="email" className="text-xs sm:text-sm">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="student@example.com"
                    required
                    className="text-foreground text-sm sm:text-base py-2 sm:py-2.5"
                  />
                </div>

                <div className="space-y-1 sm:space-y-1.5">
                  <Label htmlFor="phone" className="text-xs sm:text-sm">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+95 9 123 456 789"
                    required
                    className="text-foreground text-sm sm:text-base py-2 sm:py-2.5"
                  />
                </div>

                <div className="space-y-1 sm:space-y-1.5">
                  <Label htmlFor="password" className="text-xs sm:text-sm">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 8 characters"
                    required
                    minLength={8}
                    className="text-foreground text-sm sm:text-base py-2 sm:py-2.5"
                  />
                </div>

                <div className="space-y-1 sm:space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-xs sm:text-sm">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    required
                    className="text-foreground text-sm sm:text-base py-2 sm:py-2.5"
                  />
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-3 sm:gap-4 p-4 sm:p-6 pt-0">
                <Button type="submit" className="w-full py-2 sm:py-2.5 h-auto text-sm sm:text-base" disabled={loading}>
                  {loading ? 'Creating account...' : 'Sign up'}
                </Button>

                <p className="text-xs sm:text-sm text-center text-muted-foreground">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Login
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default SignupPage;