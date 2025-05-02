"use client";
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Home, Pencil, CirclePlus, CircleArrowUp, CircleArrowDown, CircleArrowRight, User, LogOut, UserCircle } from 'lucide-react';
import { useGetStats, useGetAddedPerDatedash, useGetCategoryDistributiondash, useGetModifiedPerDatedash, useGetTopModifiedProductsdash } from '@/hooks/stats';
import { StatCard } from '@/components/ui/stat-card';
import CategoryDistribution from '@/components/stats/CategoryDistribution';
import TopModifiedProducts from '@/components/stats/TopModifiedProducts';
import PerDateChart from '@/components/stats/PerDateChart';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useProducts } from '@/hooks/products';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Helper function to check if an array has data
const hasData = (arr: unknown): boolean => {
  return Array.isArray(arr) && arr.length > 0;
};

// Empty data placeholder component
const EmptyDataPlaceholder: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">{message || "Aucune donnée disponible"}</p>
      </div>
    </div>
  );
};

// Chart wrapper component
const ChartWrapper: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({ title, description, children }) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
      {children}
    </div>
  );
};

export default function ProductsPage() {
  const router = useRouter();
  const [selectedCompany, setSelectedCompany] = useState<string>("tunisianet");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' });
  };

  const navigateToProfile = () => {
    router.push('/profile');
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Available companies
  const companies = [
    { value: 'tunisianet', label: 'Tunisianet' },
    { value: 'mytek', label: 'MyTek' },
    { value: 'spacenet', label: 'SpaceNet' },
  ];

  // List of implemented companies
  const implementedCompanies = ['tunisianet', 'mytek'];
  const isCompanyImplemented = implementedCompanies.includes(selectedCompany);

  // Use the updated products hook with company parameter
  const useGetProducts = useProducts({
    limit: 10,
    page: 1,
    company: selectedCompany,
    enabled: isCompanyImplemented // Only fetch if company is implemented
  });

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  // Update all stats hooks to include the company parameter
  const categoryDistribution = useGetCategoryDistributiondash({
    company: selectedCompany,
    enabled: isCompanyImplemented
  });
  
  const topModifiedProducts = useGetTopModifiedProductsdash({
    company: selectedCompany,
    enabled: isCompanyImplemented
  });
  
  const getModifiedPerDate = useGetModifiedPerDatedash({
    company: selectedCompany,
    enabled: isCompanyImplemented
  });
  
  const getAddedPerDate = useGetAddedPerDatedash({
    company: selectedCompany,
    enabled: isCompanyImplemented
  });

  const totalProducts = useGetProducts.data?.total_products;
  const stock_counts = useGetProducts.data?.stock_counts;
  const yesterday_counts = useGetProducts.data?.yesterday_counts;

  // For debugging
  useEffect(() => {
    console.log("Modified per date data:", getModifiedPerDate.data);
    console.log("Added per date data:", getAddedPerDate.data);
  }, [getModifiedPerDate.data, getAddedPerDate.data]);

  // Check if there is actual data for the charts
  const hasModifiedPerDayData = getModifiedPerDate.data && 
    hasData(getModifiedPerDate.data.modified_per_day);
  
  const hasAddedPerDayData = getAddedPerDate.data && 
    hasData(getAddedPerDate.data.added_per_day);
  
  const hasCategoryDistributionData = categoryDistribution.data && 
    hasData(categoryDistribution.data.category_distribution);
  
  const hasTopModifiedProductsData = topModifiedProducts.data && 
    hasData(topModifiedProducts.data.top_modified_products);

  // Authentication check
  useEffect(() => { 
    if (!localStorage.getItem('token')) {
        router.push('/login');
    }
  }, [router]);

  // Handle loading states
  const isLoading = 
    getModifiedPerDate.isLoading || 
    getAddedPerDate.isLoading || 
    categoryDistribution.isLoading || 
    topModifiedProducts.isLoading;

  return ( 
    <Tabs defaultValue="all">
       
      <TabsContent value="all">
        <Card className="bg-white shadow-md rounded-lg">
          {/* New Header with User Profile Dropdown */}
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Tableau de bord</h1>
              
              {/* User Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                >
                  <UserCircle className="w-6 h-6 text-gray-700" />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    <div className="py-2 px-4 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">
                        {session?.user?.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {session?.user?.email || ''}
                      </p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={navigateToProfile}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Profil
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Se Déconnecter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
          
          </div>

          <CardHeader className="pb-4 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Les Statistiques</CardTitle>
              </div>
              <div>
                <Select
                  value={selectedCompany}
                  onValueChange={setSelectedCompany}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Choisir une société" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.value} value={company.value}>
                        {company.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {!isCompanyImplemented ? (
              <div className="mt-4 text-center">
                <p className="text-muted-foreground">
                  Les produits de {companies.find(c => c.value === selectedCompany)?.label || selectedCompany} seront bientôt disponibles.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                <StatCard title="Tous les produits" number={totalProducts ?? 0}>
                  <Home />
                </StatCard>
                {yesterday_counts ? (
                  <>
                    <StatCard title="Produits modifiés" subText={yesterday.toLocaleDateString('fr-FR')} number={yesterday_counts.modified_yesterday}>
                      <Pencil />
                    </StatCard>
                    <StatCard title="Nouveaux produits" subText={yesterday.toLocaleDateString('fr-FR')} number={yesterday_counts.added_yesterday}>
                      <CirclePlus />
                    </StatCard>
                  </>
                ): null}
                {stock_counts && (
                  <>
                    <StatCard
                      title="Produits en stock"
                      number={stock_counts.nbre_product_instock}
                    >
                      <CircleArrowUp />
                    </StatCard>
                    <StatCard
                      title="Produits en rupture"
                      number={stock_counts.nbre_product_outofstock}
                    >
                      <CircleArrowDown />
                    </StatCard>
                    <StatCard
                      title="Produits sur commande"
                      number={stock_counts.nbre_product_surcommonde}
                    >
                      <CircleArrowRight />
                    </StatCard>
                  </>
                )}
              </div>
            )}
          </CardHeader>

          <CardContent>
            {isCompanyImplemented ? (
              isLoading ? (
                <div className="text-center p-8">
                  <p className="text-muted-foreground">Chargement des données...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                    {hasCategoryDistributionData ? (
                      <CategoryDistribution data={categoryDistribution.data.category_distribution} />
                    ) : (
                      <EmptyDataPlaceholder message="Aucune donnée de distribution par catégorie disponible" />
                    )}
                    
                    {hasTopModifiedProductsData ? (
                      <TopModifiedProducts data={topModifiedProducts.data.top_modified_products} />
                    ) : (
                      <EmptyDataPlaceholder message="Aucune donnée de produits modifiés disponible" />
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                    {hasModifiedPerDayData ? (
                      <ChartWrapper
                        title="Produits modifiés par date"
                        description="Nombre de produits modifiés par date"
                      >
                        <PerDateChart
                          title=""
                          description=""
                          data={getModifiedPerDate.data.modified_per_day}
                        />
                      </ChartWrapper>
                    ) : (
                      <EmptyDataPlaceholder message="Aucune donnée de modifications disponible pour cette période" />
                    )}
                    
                    {hasAddedPerDayData ? (
                      <ChartWrapper
                        title="Produits ajoutés par date"
                        description="Nombre de produits ajoutés par date"
                      >
                        <PerDateChart
                          title=""
                          description=""
                          data={getAddedPerDate.data.added_per_day}
                        />
                      </ChartWrapper>
                    ) : (
                      <EmptyDataPlaceholder message="Aucune donnée d'ajouts disponible pour cette période" />
                    )}
                  </div>
                </>
              )
            ) : (
              <div className="text-center p-8">
                <p className="text-muted-foreground">
                  Sélectionnez une société implémentée pour voir les statistiques des produits.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}