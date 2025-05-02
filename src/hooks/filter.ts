import { useQuery } from '@tanstack/react-query';

interface FilterParams {
  company?: string;
  enabled?: boolean;
}

interface FilterResponse {
  filters: {
    brands: string[];
    stocks: string[];
    subcategories: string[];
  }
}

export const useGetFilter = ({
  company = 'tunisianet',
  enabled = true
}: FilterParams = {}) => {
  return useQuery<FilterResponse>({
    queryKey: ['filters', company],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (company) params.append('company', company);
      
      const response = await fetch(`/api/filters?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      return response.json();
    },
    enabled
  });
};