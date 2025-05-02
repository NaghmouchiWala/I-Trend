// app/reset-password/page.tsx
'use client';

import { useState, FormEvent, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  // Verify token validity when the component mounts
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsVerifying(false);
        return;
      }

      try {
        const response = await fetch(`/api/verify-reset-token?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setIsTokenValid(true);
        } else {
          toast.error(data.error || 'Invalid or expired reset token');
        }
      } catch (error) {
        toast.error('Failed to verify reset token');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!password || !confirmPassword) {
      toast.error('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to reset password');
        return;
      }

      toast.success('Password reset successful!');
      router.push('/login');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>Verifying reset token...</p>
      </div>
    );
  }

  if (!token || !isTokenValid) {
    return (
      <div className="min-h-screen flex justify-center items-start md:items-center p-8 bg-gray-100">
        <Card className="w-full max-w-md p-6 shadow-lg rounded-lg bg-white">
          <CardHeader className="text-center">
            <Image src="/images/logo.png" alt="Logo" className="self-center mb-5" width={150} height={100} />
            <CardDescription className="text-gray-500 mt-5">
              Invalid or expired reset token. Please request a new password reset.
            </CardDescription>
          </CardHeader>
          <div className="mt-6">
            <Button 
              onClick={() => router.push('/forgot-password')}
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-white hover:text-black hover:border-black hover:border"
            >
              Request New Reset Link
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-start md:items-center p-8 bg-gray-100">
      <Card className="w-full max-w-md p-6 shadow-lg rounded-lg bg-white">
        <CardHeader className="text-center">
          <Image src="/images/logo.png" alt="Logo" className="self-center mb-5" width={150} height={100} />
          <CardDescription className="text-gray-500 mt-5">
            Enter a new password for your account.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} className="w-full mt-4">
          <div className="mb-4">
            <Input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="mb-6">
            <Input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <Button 
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-white hover:text-black hover:border-black hover:border"
            disabled={isLoading}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
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
      </Card>
    </div>
  );
}