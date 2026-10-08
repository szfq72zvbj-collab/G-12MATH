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
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });

  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.password) {
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
      const result = await signup(formData.name, formData.email, formData.phone, formData.password);
      if (result?.requiresVerification) {
        toast.success('Account created. Please verify your email, then log in.');
        navigate('/login');
        return;
      }
      toast.success('Account created successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Sign Up - Grade 12 Math Academy</title><meta name="description" content="Create an account to start learning mathematics." /></Helmet>
      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-grow flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
          <Card className="w-full max-w-md shadow-lg border-border/50">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4"><div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center"><GraduationCap className="h-10 w-10 text-primary" /></div></div>
              <CardTitle className="text-2xl">Create your Grade 12 account</CardTitle>
              <CardDescription>Save your learning progress and access your courses from any device.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div><Label htmlFor="name">Full name</Label><Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Aung Kyaw" required /></div>
                <div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="student@example.com" required /></div>
                <div><Label htmlFor="phone">Phone number</Label><Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+95 9 123 456 789" required /></div>
                <div><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="At least 8 characters" minLength={8} required /></div>
                <div><Label htmlFor="confirmPassword">Confirm password</Label><Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter your password" required /></div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? 'Creating account…' : 'Create account'}
                </Button>
                <p className="text-sm text-center text-muted-foreground">Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Log in</Link></p>
              </CardFooter>
            </form>
          </Card>
        </main>
      </div>
    </>
  );
};

export default SignupPage;
