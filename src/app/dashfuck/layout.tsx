"use client";
import {
  LineChart,
  Pencil,
  PlusCircle,
  PieChart,
} from 'lucide-react';
import Link from 'next/link';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

import { Analytics } from '@vercel/analytics/react';
//import { User } from '@/components/shared/user';
import Providers from './providers';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const queryClient = new QueryClient();

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <main className="flex min-h-screen w-full flex-row bg-muted/40">
        <DesktopNav />
        <div className="flex flex-1 flex-col sm:gap-4 sm:py-4">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <div className='flex-1' />
           { /*<User />*/ }
          </header>
          <main className="grid flex-1 items-start gap-2 p-4 sm:px-6 sm:py-0 md:gap-4 bg-muted/40">
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          </main>
        </div>
        <Analytics />
      </main>
    </Providers>
  );
}

function DesktopNav() {
  const pathname = usePathname();

  return (
    <aside className="h-screen sticky top-0 left-0 z-10 w-[220px] border-r bg-background">
      <nav className="flex flex-col gap-2 px-2 py-5 w-full h-full">
        <div className="flex justify-center mb-5">
          <Image
            src="/images/logo.png"
            alt="iTrend Technology Logo"
            width={100}
            height={100}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Link href="/dashfuck" className="w-full">
            {pathname === '/dashfuck' ? (
              <div className="bg-black w-full text-white py-3 px-5 rounded-md flex items-center gap-3">
                <LineChart className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">Dashboard</span>
              </div>
            ) : (
              <div className="text-black w-full hover:bg-muted rounded-md py-3 px-5 flex items-center gap-3">
                <LineChart className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">Dashboard</span>
              </div>
            )}
          </Link>

          <Link href="/dashfuck/all" className="w-full">
            {pathname === '/dashfuck/all' ? (
              <div className="bg-black w-full text-white py-3 px-5 rounded-md flex items-center gap-3">
                <PieChart className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">Tous les produits</span>
              </div>
            ) : (
              <div className="text-black w-full hover:bg-muted rounded-md py-3 px-5 flex items-center gap-3">
                <PieChart className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">Tous les produits</span>
              </div>
            )}
          </Link>

          <Link href="/dashfuck/new" className="w-full">
            {pathname === '/dashfuck/new' ? (
              <div className="bg-black w-full text-white py-3 px-5 rounded-md flex items-center gap-3">
                <Pencil className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">Produits Ajoutés</span>
              </div>
            ) : (
              <div className="text-black w-full hover:bg-muted rounded-md py-3 px-5 flex items-center gap-3">
                <Pencil className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">Produits Ajoutés</span>
              </div>
            )}
          </Link>

          <Link href="/dashfuck/updated" className="w-full">
            {pathname === '/dashfuck/updated' ? (
              <div className="bg-black w-full text-white py-3 px-5 rounded-md flex items-center gap-3">
                <PlusCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">Produits Modifiés</span>
              </div>
            ) : (
              <div className="text-black w-full hover:bg-muted rounded-md py-3 px-5 flex items-center gap-3">
                <PlusCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">Produits Modifiés</span>
              </div>
            )}
          </Link>
         
          <Link href="/dashfuck/ai_page" className="w-full">
            {pathname === '/dashfuck/ai_page' ? (
              <div className="bg-black w-full text-white py-3 px-5 rounded-md flex items-center gap-3">
                <PlusCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">Product Matcher</span>
              </div>
            ) : (
              <div className="text-black w-full hover:bg-muted rounded-md py-3 px-5 flex items-center gap-3">
                <PlusCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">Product Matcher</span>
              </div>
            )}
          </Link>
        </div>
      </nav>
    </aside>
  );
}
