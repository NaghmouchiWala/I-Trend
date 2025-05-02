"use client";
import { useEffect } from "react";
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="p-4">
      {/* Layout content is temporarily commented out */}
      {/* <div className="absolute inset-0 bg-black opacity-80" />
      <div className="flex flex-col items-center bg-white p-7 rounded relative z-10 gap-5">
        <h1 className="font-semibold text-2xl">Votre version d’essai a expiré.</h1>
        <p className="text-base">Découvrez dès maintenant nos abonnements mensuels et annuels pour continuer à profiter de nos services.</p>
        <Button size="sm" variant="default" onClick={() => window.open('https://itrend-technology.tn/#pricing', '_blank')}>
          Voir les abonnements
        </Button>
      </div> */}

      {children}
    </div>
  );
}
