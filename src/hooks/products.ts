import { ProductRo } from '@/types/product';
import { useQuery } from '@tanstack/react-query';

interface UseProductsParams {
  limit: number;
  search?: string;
  page: number;
  company?: string;
  brand?: string;
  stock?: string;
  subcategory?: string;
  sort_by?: "price" | "date_modification";
  order?: "asc" | "desc";
  price_min?: string;
  price_max?: string;
  dateajout_min?: string;
  dateajout_max?: string;
  modification_date_min?: string;
  modification_date_max?: string;
  enabled?: boolean;
  source?: string;
}

interface ProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  stock?: string;
  brand?: string;
  subcategory?: string;
  sort_by?: string;
  order?: string;
  price_min?: string | undefined;
  price_max?: string | undefined;
  company?: string;
  enabled?: boolean;
}

interface NewProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  stock?: string;
  brand?: string;
  subcategory?: string;
  sort_by?: string;
  order?: string;
  price_min?: string | undefined;
  price_max?: string | undefined;
  dateajout_min?: string;
  dateajout_max?: string;
  company?: string;
  enabled?: boolean;
}

interface ProductResponse {
  products: ProductRo[];
  total_products: number;
  total_pages: number;
  stock_counts: {
    nbre_product_instock: number;
    nbre_product_outofstock: number;
    nbre_product_surcommonde: number;
  };
  yesterday_counts: {
    modified_yesterday: number;
    added_yesterday: number;
  };
}

interface ProductsParams {
  limit?: number;
  page?: number;
  search?: string;
  brand?: string;
  stock?: string;
  sort_by?: string;
  order?: string;
  price_min?: string;
  price_max?: string;
  subcategory?: string;
  company?: string;
  enabled?: boolean;
}

export const useProducts = ({
  limit = 10,
  page = 1,
  search = '',
  brand,
  stock,
  sort_by = 'price',
  order = 'asc',
  price_min,
  price_max,
  subcategory,
  company = 'tunisianet',
  enabled = true
}: ProductsParams = {}) => {
  return useQuery<ProductResponse>({
    queryKey: ['products', company, page, limit, search, brand, stock, sort_by, order, price_min, price_max, subcategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      // Add all parameters to the query
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      params.append('company', company);
      
      if (search) params.append('search', search);
      if (brand) params.append('brand', brand);
      if (stock) params.append('stock', stock);
      if (sort_by) params.append('sort_by', sort_by);
      if (order) params.append('order', order);
      if (price_min) params.append('price_min', price_min);
      if (price_max) params.append('price_max', price_max);
      if (subcategory) params.append('subcategory', subcategory);
      
      const response = await fetch(`/api/products?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      return response.json();
    },
    enabled
  });
};


export const useNewProducts = ({
  page = 1,
  limit = 10,
  search = '',
  stock,
  brand,
  subcategory,
  sort_by = 'price',
  order = 'asc',
  price_min,
  price_max,
  dateajout_min,
  dateajout_max,
  company = 'tunisianet', 
  enabled = true
}: NewProductsParams) => {
  return useQuery({
    queryKey: ['new-products', page, limit, search, stock, brand, subcategory, sort_by, order, price_min, price_max, dateajout_min, dateajout_max, company],
    queryFn: async () => {
      // Build the search params
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', String(limit));
      params.append('designation', search);
      if (stock) params.append('stock', stock);
      if (brand) params.append('brand', brand);
      if (subcategory) params.append('subcategory', subcategory);
      if (sort_by) params.append('sort_by', sort_by);
      if (order) params.append('order', order);
      if (price_min) params.append('price_min', price_min);
      if (price_max) params.append('price_max', price_max);
      if (dateajout_min) params.append('dateajout_min', dateajout_min);
      if (dateajout_max) params.append('dateajout_max', dateajout_max);
      if (company) params.append('company', company);

      const response = await fetch(`/api/new-products?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      return response.json();
    },
    enabled
  });
};


export const useUpdatedProducts = ({ limit, search, page, brand, stock, sort_by, order, modification_date_min, modification_date_max, price_min, price_max, subcategory, enabled = true ,source = 'tunisianet'}: UseProductsParams) => {
  return useQuery({
    queryKey: ['products', { limit, search, page, brand, stock, sort_by, order, modification_date_min, modification_date_max, price_min, price_max, subcategory }],
    queryFn: async () => {
      
      const searchParams = new URLSearchParams({
        limit: limit.toString(),
        page: page.toString(),
        ref: search ?? '',
        designation: search ?? '',
        subcategory: subcategory ?? '',
        ...(brand && brand !== 'all' && { brand }),
        ...(stock && stock !== 'all' && { stock }),
        ...(sort_by && { sort_by }),
        ...(order && { order }),
        ...(price_min && { price_min }),
        ...(price_max && { price_max }),
        ...(modification_date_max && { modification_date_max }),
        ...(modification_date_min && { modification_date_min }),
      });

      const response = await fetch(`/api/products/modified?${searchParams}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    enabled // Add enabled parameter to control when the query runs
  });
};



export const useUpdatedProductss = ({
  limit,
  search,
  page,
  brand,
  stock,
  sort_by,
  order,
  modification_date_min,
  modification_date_max,
  price_min,
  price_max,
  subcategory,
  enabled = true,
  source = 'tunisianet' // Changed from 'company' to match your API
}: UseProductsParams) => {
  return useQuery({
    queryKey: ['products', { 
      limit, 
      search, 
      page, 
      brand, 
      stock, 
      sort_by, 
      order, 
      modification_date_min, 
      modification_date_max, 
      price_min, 
      price_max, 
      subcategory,
      source // Include source in queryKey for proper caching
    }],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        limit: limit.toString(),
        page: page.toString(),
        ref: search ?? '',
        designation: search ?? '',
        subcategory: subcategory ?? '',
        company: source, // Add the company parameter
        ...(brand && brand !== 'all' && { brand }),
        ...(stock && stock !== 'all' && { stock }),
        ...(sort_by && { sort_by }),
        ...(order && { order }),
        ...(price_min && { price_min }),
        ...(price_max && { price_max }),
        ...(modification_date_max && { modification_date_max }),
        ...(modification_date_min && { modification_date_min }),
      });

      // Updated endpoint to just '/api/products' since the company is now a parameter
      const response = await fetch(`/api/products?${searchParams}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    enabled
  });
};

// inside your hooks/products.ts file

export function useUpdatedProductsss({
  page = 1,
  limit = 10,
  search = '',
  stock,
  brand,
  subcategory,
  sort_by = 'price',
  order = 'asc',
  price_min,
  price_max,
  modification_date_min,
  modification_date_max,
  company = 'tunisianet',
  enabled = true
}: {
  page?: number;
  limit?: number;
  search?: string;
  stock?: string;
  brand?: string;
  subcategory?: string;
  sort_by?: 'price' | 'date_modification';
  order?: 'asc' | 'desc';
  price_min?: string;
  price_max?: string;
  modification_date_min?: string;
  modification_date_max?: string;
  company?: string;
  enabled?: boolean;
}) {
  const queryKey = [
    'updatedProducts',
    page,
    limit,
    search,
    stock,
    brand,
    subcategory,
    sort_by,
    order,
    price_min,
    price_max,
    modification_date_min,
    modification_date_max,
    company
  ];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search) params.append('search', search);
      if (stock) params.append('stock', stock);
      if (brand) params.append('brand', brand);
      if (subcategory) params.append('subcategory', subcategory);
      if (sort_by) params.append('sort_by', sort_by);
      if (order) params.append('order', order);
      if (price_min) params.append('price_min', price_min);
      if (price_max) params.append('price_max', price_max);
      if (modification_date_min) params.append('modification_date_min', modification_date_min);
      if (modification_date_max) params.append('modification_date_max', modification_date_max);
      if (company) params.append('company', company);

      const response = await fetch(`/api/updated-products?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch updated products');
      }
      return response.json();
    },
    enabled
  });
}

export const useNewProductss = ({ limit, search, page, brand, stock, sort_by, order, dateajout_max, dateajout_min, price_min, price_max, subcategory, enabled = true }: UseProductsParams) => {
  return useQuery({
    queryKey: ['products', { limit, search, page, brand, stock, sort_by, order, dateajout_max, dateajout_min, price_min, price_max, subcategory }],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        limit: limit.toString(),
        page: page.toString(),
        ref: search ?? '',
        designation: search ?? '',
        subcategory: subcategory ?? '',
        ...(brand && brand !== 'all' && { brand }),
        ...(stock && stock !== 'all' && { stock }),
        ...(sort_by && { sort_by }),
        ...(order && { order }),
        ...(dateajout_min && { dateajout_min }),
        ...(dateajout_max && { dateajout_max }),
        ...(price_min && { price_min }),
        ...(price_max && { price_max }),
      });

      const response = await fetch(`/api/products/new?${searchParams}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    enabled // Add enabled parameter to control when the query runs
  });
};



//test


// Base hook configuration
export const useBaseProducts = (company: 'tunisianet' | 'mytek', params: UseProductsParams) => {
  return useQuery({
    queryKey: ['products', company, params],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        limit: params.limit.toString(),
        page: params.page.toString(),
        company, // Pass the company as a parameter
        ref: params.search ?? '',
        designation: params.search ?? '',
        subcategory: params.subcategory ?? '',
        ...(params.brand && params.brand !== 'all' && { brand: params.brand }),
        ...(params.stock && params.stock !== 'all' && { stock: params.stock }),
        ...(params.sort_by && { sort_by: params.sort_by }),
        ...(params.order && { order: params.order }),
        ...(params.price_min && { price_min: params.price_min }),
        ...(params.price_max && { price_max: params.price_max }),
        ...(params.modification_date_max && { modification_date_max: params.modification_date_max }),
        ...(params.modification_date_min && { modification_date_min: params.modification_date_min }),
      });

      const response = await fetch(`/api/products?${searchParams}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    enabled: params.enabled ?? true
  });
};

// Specific hooks for each company
export const useTunisianetProducts = (params: UseProductsParams) => {
  return useBaseProducts('tunisianet', params);
};

export const useMytekProducts = (params: UseProductsParams) => {
  return useBaseProducts('mytek', params);
};

// Fallback hook that selects based on company parameter
export const useCompanyProducts = (params: UseProductsParams & { company: 'tunisianet' | 'mytek' }) => {
  return params.company === 'tunisianet' 
    ? useTunisianetProducts(params) 
    : useMytekProducts(params);
};