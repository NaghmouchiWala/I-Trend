'use client';
import { useState, FormEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email) {
      toast.error('Please enter your email address');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to send reset email');
        return;
      }

      setEmailSent(true);
      toast.success('If your email exists in our system, you will receive a password reset link.');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
      console.error('Error in forgot password form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-start md:items-center p-8 bg-gray-100">
      <Card className="w-full max-w-md p-6 shadow-lg rounded-lg bg-white">
        <CardHeader className="text-center">
          <Image src="/images/logo.png" alt="Logo" className="self-center mb-5" width={150} height={100} />
          <CardDescription className="text-gray-500 mt-5">
            {emailSent 
              ? 'If your email exists in our system, you will receive a password reset link shortly.' 
              : 'Enter your email address to receive a password reset link.'}
          </CardDescription>
        </CardHeader>
        
        {!emailSent ? (
          <form onSubmit={handleSubmit} className="w-full mt-4">
            <div className="mb-6">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <Button 
              type="submit"
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-white hover:text-black hover:border-black hover:border"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
            <div className="mt-4 text-center">
              <p className="text-gray-600">
                Remember your password?{' '}
                <Link href="/login" className="text-blue-600 hover:underline">
                  Login
                </Link>
              </p>
            </div>
          </form>
        ) : (
          <div className="mt-6">
            <Button 
              onClick={() => router.push('/login')}
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-white hover:text-black hover:border-black hover:border"
            >
              Back to Login
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}