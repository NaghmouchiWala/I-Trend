'use client';

import {
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  Table,
  SortableHeader
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Product } from './product';
import { ChevronLeft, ChevronRight, CircleArrowDown, CircleArrowRight, CircleArrowUp, Home, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNewProducts } from '@/hooks/products';
import { ProductRo } from '@/types/product';
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { SearchInput } from '@/components/shared/search';
import { StatCard } from '@/components/ui/stat-card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetFilter } from '@/hooks/filter';
import { DatePicker } from '@/components/ui/date-picker';


export function NewProducts({ setSelectedProduct }: { setSelectedProduct: (product: ProductRo) => void }) {
  const productsPerPage = 10;
 
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [selectedStock, setSelectedStock] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortBy, setSortBy] = useState<'price' | 'date_modification'>('price');
  const [selectedCompany, setSelectedCompany] = useState<string>("tunisianet");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [selectedMinDate, setSelectedMinDate] = useState<Date>(today);
  const [selectedMaxDate, setSelectedMaxDate] = useState<Date>(today);

  // Available companies
  const companies = [
    { value: 'tunisianet', label: 'Tunisianet' },
    { value: 'mytek', label: 'MyTek' },
    { value: 'spacenet', label: 'SpaceNet' },
  ];

  // List of implemented companies - add more as you implement them
  const implementedCompanies = ['tunisianet', 'mytek']; // Both are now implemented
  const isCompanyImplemented = implementedCompanies.includes(selectedCompany);

  function prevPage() {
    setPage(page - 1);
  }

  function nextPage() { 
    setPage(page + 1);
  }

  // Fetch filters based on selected company
  const getFilter = useGetFilter({
    company: selectedCompany,
    enabled: isCompanyImplemented
  });
  
  const filters = getFilter.data?.filters;
  const brands = filters?.brands;
  const stocks = filters?.stocks;
  const sub_categories = filters?.subcategories;

  // Handle company change
  const handleCompanyChange = (value: string) => {
    setSelectedCompany(value);
    resetFilters();
  };

  // Only fetch products if the company is implemented
  const useGetProducts = useNewProducts({
    limit: productsPerPage,
    search: search,
    page: page,
    stock: selectedStock === 'all' ? undefined : selectedStock,
    brand: selectedBrand === 'all' ? undefined : selectedBrand,
    subcategory: selectedSubCategory === 'all' ? undefined : selectedSubCategory,
    sort_by: sortBy,
    order: sortOrder,
    price_min: minPrice || undefined,
    price_max: maxPrice || undefined,
    dateajout_min: selectedMinDate.toISOString().split("T")[0],
    dateajout_max: selectedMaxDate.toISOString().split("T")[0],
    company: selectedCompany, // Pass the company to the hook
    enabled: isCompanyImplemented // Only fetch if company is implemented
  });

  const products = useGetProducts.data?.products;
  const totalProducts = useGetProducts.data?.total_products;
  const totalPages = useGetProducts.data?.total_pages;
  const stock_counts = useGetProducts.data?.stock_counts;
  const offset = page * productsPerPage;

  const handlePriceSort = () => {
    setSortOrder(current => current === 'asc' ? 'desc' : 'asc');
    setSortBy('price');
  };

  const handlePriceChange = (value: string, type: 'min' | 'max') => {
    const numberValue = value === '' ? '' : Math.min(Math.max(0, Number(value)), 40000).toString();
    
    if (type === 'min') {
      setMinPrice(numberValue);
    } else {
      setMaxPrice(numberValue);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedStock('all');
    setSelectedBrand('all');
    setSelectedSubCategory('all');
    setSortOrder('asc');
    setSortBy('price');
    setMinPrice('');
    setMaxPrice('');
    setPage(1);
    setSelectedMinDate(today);
    setSelectedMaxDate(today);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Nouveaux Produits</CardTitle>
            <CardDescription>
              Liste des produits récemment ajoutés.
            </CardDescription>
          </div>
          <div>
            <Select
              value={selectedCompany}
              onValueChange={handleCompanyChange}
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

        {isCompanyImplemented && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Nouveaux produits" number={totalProducts ?? 0}>
              <Home />
            </StatCard>
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

        {isCompanyImplemented && (
          <div className='flex items-center gap-4 flex-wrap'>
            <SearchInput search={search} setSearch={setSearch} />
            
            <Select
              value={selectedSubCategory}
              onValueChange={setSelectedSubCategory}
            >
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Catégories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Catégories</SelectItem>
                {sub_categories?.map((sub_category: string) => (
                  <SelectItem key={sub_category} value={sub_category}>
                    {sub_category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedBrand}
              onValueChange={setSelectedBrand}
            >
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Marques" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Marques</SelectItem>
                  {brands?.filter(Boolean).map((brand: string) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              value={selectedStock}
              onValueChange={setSelectedStock}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Disponibilité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Disponibilité</SelectItem>
                {stocks?.map((stock: string) => (
                  <SelectItem key={stock} value={stock}>
                    {stock}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <DatePicker date={selectedMinDate} setDate={setSelectedMinDate} />
              <span className="text-muted-foreground">-</span>
              <DatePicker date={selectedMaxDate} setDate={setSelectedMaxDate} />
            </div>

            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Prix min"
                value={minPrice}
                onChange={(e) => handlePriceChange(e.target.value, 'min')}
                className="w-[100px]"
                min={0}
                max={40000}
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="number"
                placeholder="Prix max"
                value={maxPrice}
                onChange={(e) => handlePriceChange(e.target.value, 'max')}
                className="w-[100px]"
                min={0}
                max={40000}
              />
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={resetFilters}
              className="h-10 w-10"
              title="Réinitialiser les filtres"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {!isCompanyImplemented ? (
          <div className="text-center text-muted-foreground p-16 w-full">
            <p className="text-center text-lg">
              Les produits de {companies.find(c => c.value === selectedCompany)?.label || selectedCompany} seront bientôt disponibles.
            </p>
          </div>
        ) : useGetProducts.isLoading ? (
          <div className="text-center text-muted-foreground p-16 w-full">
            <p className="text-center text-lg">Chargement des produits...</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Réf</TableHead>
                  <TableHead className="hidden md:table-cell">Image</TableHead>
                  <TableHead>Désignation</TableHead>
                  <TableHead className="hidden md:table-cell">Catégorie</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Marque
                  </TableHead>
                  <TableHead>Disponibilité</TableHead>
                  <TableHead className="hidden md:table-cell">Date d&apos;ajout</TableHead>
                  <SortableHeader 
                    className="hidden md:table-cell w-[100px]"
                    onSort={() => handlePriceSort()}
                  >
                    Prix
                  </SortableHeader>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products?.map((product: ProductRo, index: number) => (
                  <Product key={index} product={product} setSelectedProduct={setSelectedProduct} />
                ))}
              </TableBody>
            </Table>
            {products?.length === 0 ? (
              <div className="text-center text-muted-foreground p-4 w-full">
                <p className="text-center text-muted-foreground">Aucun produit trouvé</p>
              </div>
            ) : null}
          </>
        )}
      </CardContent>

      {isCompanyImplemented && products?.length > 0 ? (
        <CardFooter>
          <form className="flex items-center w-full justify-between">
            <div className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground">
                <strong>
                  {Math.max(
                    0,
                    Math.min(offset - productsPerPage, totalProducts) + 1
                  )}
                  -{offset}
                </strong>{' '}
                de <strong>{totalProducts}</strong> produits
              </div>
            </div>

            <div className="flex">
              <Button
                formAction={prevPage}
                variant="ghost"
                size="sm"
                type="submit"
                disabled={page === 1}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Préc
              </Button>
              <Button
                formAction={nextPage}
                variant="ghost"
                size="sm"
                type="submit"
                disabled={page === totalPages}
              >
                Suiv
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardFooter>
      ): null}
    </Card>
  );
}