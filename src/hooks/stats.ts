import { useQuery } from '@tanstack/react-query';


//added by me

interface StatsParams {
  company?: string;
  enabled?: boolean;
}

// Hook to get general stats including yesterday counts
export const useGetStatsdash = ({ company = 'tunisianet', enabled = true }: StatsParams = {}) => {
  return useQuery({
    queryKey: ['products/stats', company],
    queryFn: async () => {
      const response = await fetch(`/api/products/stats?company=${company}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    enabled
  });
};

export const useGetCategoryDistributiondash = ({ company = 'tunisianet', enabled = true }: StatsParams = {}) => {
  return useQuery({
    queryKey: ['stats', 'category_distribution', company],
    queryFn: async () => {
      const response = await fetch(`/api/stats?type=category_distribution&company=${company}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    enabled
  });
};

export const useGetTopModifiedProductsdash = ({ company = 'tunisianet', enabled = true }: StatsParams = {}) => {
  return useQuery({
    queryKey: ['stats', 'top_modified_products', company],
    queryFn: async () => {
      const response = await fetch(`/api/stats?type=top_modified_products&company=${company}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    enabled
  });
};

// Modified to also format yesterday stats into the expected format
export const useGetModifiedPerDatedash = ({ company = 'tunisianet', enabled = true }: StatsParams = {}) => {
  return useQuery({
    queryKey: ['stats', 'modified_per_day', company],
    queryFn: async () => {
      try {
        // First try to get detailed data by date
        const response = await fetch(`/api/stats?type=modified_per_day&company=${company}`);
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        
        // If data is empty, try to get yesterday stats
        if (!data.modified_per_day || data.modified_per_day.length === 0) {
          const statsResponse = await fetch(`/api/products/stats?company=${company}`);
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            
            if (statsData.yesterday_counts && statsData.yesterday_counts.modified_yesterday !== undefined) {
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              
              // Format date as YYYY-MM-DD
              const formattedDate = yesterday.toISOString().split('T')[0];
              
              // Return in the expected format
              return {
                modified_per_day: [
                  { date: formattedDate, count: statsData.yesterday_counts.modified_yesterday }
                ]
              };
            }
          }
        }
        
        return data;
      } catch (error) {
        console.error("Error fetching modified per date:", error);
        throw error;
      }
    },
    enabled
  });
};

// Similar approach for added per date
export const useGetAddedPerDatedash = ({ company = 'tunisianet', enabled = true }: StatsParams = {}) => {
  return useQuery({
    queryKey: ['stats', 'added_per_day', company],
    queryFn: async () => {
      try {
        // First try to get detailed data by date
        const response = await fetch(`/api/stats?type=added_per_day&company=${company}`);
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        
        // If data is empty, try to get yesterday stats
        if (!data.added_per_day || data.added_per_day.length === 0) {
          const statsResponse = await fetch(`/api/products/stats?company=${company}`);
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            
            if (statsData.yesterday_counts && statsData.yesterday_counts.added_yesterday !== undefined) {
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              
              // Format date as YYYY-MM-DD
              const formattedDate = yesterday.toISOString().split('T')[0];
              
              // Return in the expected format
              return {
                added_per_day: [
                  { date: formattedDate, count: statsData.yesterday_counts.added_yesterday }
                ]
              };
            }
          }
        }
        
        return data;
      } catch (error) {
        console.error("Error fetching added per date:", error);
        throw error;
      }
    },
    enabled
  });
};

// Legacy hooks
export const useGetStats = () => {
  return useQuery({
    queryKey: ['products/stats'],
    queryFn: async () => {
      const response = await fetch(`/api/products/stats`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });
};

export const useGetCategoryDistribution = () => {
  return useQuery({
    queryKey: ['stats?type=category_distribution'],
    queryFn: async () => {
      const response = await fetch(`/api/stats?type=category_distribution`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });
};

export const useGetTopModifiedProducts = () => {
  return useQuery({
    queryKey: ['stats?type=top_modified_products'],
    queryFn: async () => {
      const response = await fetch(`/api/stats?type=top_modified_products`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });
};

export const useGetModifiedPerDate = () => {
  return useQuery({
    queryKey: ['stats?type=modified_per_day'],
    queryFn: async () => {
      const response = await fetch(`/api/stats?type=modified_per_day`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });
};

export const useGetAddedPerDate = () => {
  return useQuery({
    queryKey: ['stats?type=added_per_day'],
    queryFn: async () => {
      const response = await fetch(`/api/stats?type=added_per_day`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });
};

//added by me

