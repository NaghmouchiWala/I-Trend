'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { UserCircle, Mail, Calendar, ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Enhanced authentication check
  useEffect(() => {
    // Wait until session status is determined
    if (status === 'loading') return;
    
    // Check both token and session - only redirect if neither exists
    if (!localStorage.getItem('token') && status === 'unauthenticated') {
      router.push('/login');
    }
  }, [router, status]);

  // Don't add navigation logic that could cause redirects
  const handleBack = () => {
    router.back();
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <Button 
          variant="outline" 
          onClick={handleBack}
          className="mb-6 flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gray-200 rounded-full p-6">
                <UserCircle className="h-24 w-24 text-gray-700" />
              </div>
            </div>
            <CardTitle className="text-2xl">{session?.user?.name || 'Utilisateur'}</CardTitle>
            <CardDescription>Informations du profil</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <Mail className="h-5 w-5 mr-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="font-medium">{session?.user?.email}</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <Calendar className="h-5 w-5 mr-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Date d'inscription</p>
                  <p className="font-medium">
                    {new Date().toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center border-t p-6">
            <Button 
              variant="outline"
              onClick={() => router.push('/')}
              className="w-full"
            >
              Retour au tableau de bord
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}