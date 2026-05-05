import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import apiServerClient from '@/lib/apiServerClient.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CreditCard } from 'lucide-react';

const PaymentForm = ({ course }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState(currentUser?.phone || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!phone || phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await apiServerClient.fetch('/kbz-pay/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course.id,
          studentId: currentUser.id,
          amount: course.price,
          phone: phone,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Payment creation failed');
      }

      const data = await response.json();
      
      sessionStorage.setItem('pendingTransaction', data.transactionId);
      window.open(data.paymentUrl, '_blank');
      navigate(`/payment-success?transactionId=${data.transactionId}`);
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <div className="bg-card rounded-xl p-4 sm:p-5 md:p-6 border shadow-sm">
        <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 text-card-foreground">Payment Details</h3>
        
        <div className="space-y-3 sm:space-y-4">
          <div className="space-y-1 sm:space-y-1.5">
            <Label htmlFor="name" className="text-xs sm:text-sm">Student Name</Label>
            <Input
              id="name"
              type="text"
              value={currentUser?.name || ''}
              disabled
              className="bg-muted text-foreground text-sm sm:text-base py-2 sm:py-2.5"
            />
          </div>

          <div className="space-y-1 sm:space-y-1.5">
            <Label htmlFor="email" className="text-xs sm:text-sm">Email</Label>
            <Input
              id="email"
              type="email"
              value={currentUser?.email || ''}
              disabled
              className="bg-muted text-foreground text-sm sm:text-base py-2 sm:py-2.5"
            />
          </div>

          <div className="space-y-1 sm:space-y-1.5">
            <Label htmlFor="phone" className="text-xs sm:text-sm">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+95 9 123 456 789"
              required
              className="text-foreground text-sm sm:text-base py-2 sm:py-2.5"
            />
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              Enter your KBZ PAY registered phone number
            </p>
          </div>

          <div className="pt-3 sm:pt-4 border-t mt-4 sm:mt-6">
            <div className="flex justify-between items-center mb-1 sm:mb-2">
              <span className="text-xs sm:text-sm text-muted-foreground">Course</span>
              <span className="text-sm sm:text-base font-medium text-card-foreground line-clamp-1 pl-4 text-right">{course.title}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-muted-foreground">Amount</span>
              <span className="font-bold text-lg sm:text-xl text-card-foreground font-variant-tabular">
                {course.price.toLocaleString()} MMK
              </span>
            </div>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full gap-2 py-2.5 sm:py-3 h-auto text-sm sm:text-base"
        disabled={loading}
      >
        {loading ? (
          <>Processing...</>
        ) : (
          <>
            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
            Pay with KBZ PAY
          </>
        )}
      </Button>

      <p className="text-[10px] sm:text-xs text-center text-muted-foreground px-2">
        You will be redirected to KBZ PAY to complete your payment securely
      </p>
    </form>
  );
};

export default PaymentForm;