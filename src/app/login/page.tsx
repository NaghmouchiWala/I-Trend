// app/login/page.tsx
'use client';

import { FormEvent, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader } from '@/components/ui/card';
import { toast } from "sonner";
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser } from '../actions/auth';

export default function LoginPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      setIsLoading(false);
      return;
    }
    
    try {
      const result = await loginUser({ email, password });
      
      if (result.error) {
        toast.error(result.error);
        setIsLoading(false);
        return;
      }
      
      toast.success('Login successful!');
      router.push('/dashfuck');
      router.refresh();
    } catch (error) {
      toast.error('An error occurred during login');
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
            Sign in to continue using our application.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} className="w-full mt-4">
          <div className="mb-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="mb-2">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="mb-4 text-right">
            <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <Button 
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-white hover:text-black hover:border-black hover:border"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Login'}
          </Button>
          <div className="mt-4 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="text-blue-600 hover:underline">
                Register
              </Link>
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
}