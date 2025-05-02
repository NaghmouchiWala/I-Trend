// CompanyComparison.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';

interface CompanyMetric {
  name: string;
  tunisianet: number;
  mytek: number;
}

interface CompanyComparisonProps {
  implementedCompanies: string[];
}

export default function CompanyComparison({ implementedCompanies }: CompanyComparisonProps) {
  const [metric, setMetric] = useState<string>('products');

  // Fetch comparative data
  const comparisonData = useQuery({
    queryKey: ['company-comparison', metric],
    queryFn: async () => {
      const response = await fetch(`/api/stats/comparison?metric=${metric}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    enabled: implementedCompanies.length > 1,
  });

  const metrics = [
    { value: 'products', label: 'Total Products' },
    { value: 'stock', label: 'Stock Status' },
    { value: 'pricing', label: 'Pricing Trends' },
    { value: 'categories', label: 'Categories' },
  ];

  // Mock data structure for each metric type
  const mockDataMap: Record<string, CompanyMetric[]> = {
    products: [
      { name: 'Total Products', tunisianet: 12500, mytek: 9800 },
      { name: 'In Stock', tunisianet: 8200, mytek: 6300 },
      { name: 'Out of Stock', tunisianet: 3100, mytek: 2500 },
      { name: 'On Order', tunisianet: 1200, mytek: 1000 },
    ],
    stock: [
      { name: 'High Stock (>50)', tunisianet: 4200, mytek: 3100 },
      { name: 'Medium Stock (10-50)', tunisianet: 2800, mytek: 2200 },
      { name: 'Low Stock (<10)', tunisianet: 1200, mytek: 1000 },
      { name: 'Out of Stock', tunisianet: 3100, mytek: 2500 },
    ],
    pricing: [
      { name: '<100 TND', tunisianet: 3800, mytek: 2900 },
      { name: '100-500 TND', tunisianet: 5200, mytek: 4100 },
      { name: '500-1000 TND', tunisianet: 2300, mytek: 1800 },
      { name: '>1000 TND', tunisianet: 1200, mytek: 1000 },
    ],
    categories: [
      { name: 'Computers', tunisianet: 2800, mytek: 2200 },
      { name: 'Phones', tunisianet: 2100, mytek: 1700 },
      { name: 'Accessories', tunisianet: 3600, mytek: 2900 },
      { name: 'Other', tunisianet: 4000, mytek: 3000 },
    ],
  };

  // Use actual data if available, otherwise fall back to mock data
  const displayData = comparisonData.data?.data || mockDataMap[metric];

  // If we only have one company, no comparison needed
  if (implementedCompanies.length <= 1) {
    return null;
  }

  return (
    <Card className="bg-white shadow-md rounded-lg mb-10">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Comparaison des sociétés</CardTitle>
          <Tabs value={metric} onValueChange={setMetric} className="w-[400px]">
            <TabsList className="grid grid-cols-4 w-full">
              {metrics.map((m) => (
                <TabsTrigger key={m.value} value={m.value}>
                  {m.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={displayData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {implementedCompanies.includes('tunisianet') && (
                <Bar dataKey="tunisianet" name="Tunisianet" fill="#8884d8" />
              )}
              {implementedCompanies.includes('mytek') && (
                <Bar dataKey="mytek" name="MyTek" fill="#82ca9d" />
              )}
              {implementedCompanies.includes('spacenet') && (
                <Bar dataKey="spacenet" name="SpaceNet" fill="#ffc658" />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}