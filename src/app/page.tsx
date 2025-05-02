"use client";
import { useEffect } from 'react'
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  
  useEffect(() => {
    if (localStorage.getItem('token')) {
      router.push('/dashfuck');
    } else {
        router.push('/login');
    }
  }, [router]);
}
