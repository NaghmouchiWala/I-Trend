import React, { useEffect, useState } from 'react';
import { ProductRo } from '@/types/product';
import Image from 'next/image';
import { Button } from '../ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ProductProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductRo;
}

interface MatchProduct {
  _id: string;
  tunisianet_name?: string;
  mytek_name?: string;
  tunisianet_reference?: string;
  mytek_reference?: string;
  reference_similarity_score?: number;
  name_similarity_score?: number;
  average_similarity_score?: number;
  price_difference?: number;
  price_difference_percentage?: number;
  tunisianet_price?: number;
  mytek_price?: number;
  best_deal?: 'tunisianet' | 'mytek' | 'equal';
}

const Product: React.FC<ProductProps> = ({ isOpen, onClose, product }) => {
  const [bestMatches, setBestMatches] = useState<MatchProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch best matches when product is opened
  useEffect(() => {
    if (isOpen && product) {
      fetchBestMatches();
    }
  }, [isOpen, product]);

  // Get appropriate reference for the product
  const getProductReference = () => {
    return product.Ref || product.reference || '';
  };


  const fetchBestMatches = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if product has a reference
      const reference = getProductReference();
      const name = product.Designation || '';
      
      if (!reference && !name) {
        setError("No reference or name found for this product");
        setIsLoading(false);
        return;
      }
      // Call the MongoDB API endpoint to get similar products
      // Use reference and name as query parameters for better matching
      const queryParams = new URLSearchParams();
      if (reference) queryParams.append('reference', reference);
      if (name) queryParams.append('name', name);
      queryParams.append('topN', '10'); // Request more products to filter locally
      
      const response = await fetch(`/api/db/best-match?${queryParams.toString()}`);
      
      if (!response.ok) {
        let errorText;
        try {
          errorText = await response.text();
          errorText = errorText.length > 100 ? 
            `Server error (Status: ${response.status})` : 
            errorText;
        } catch (e) {
          errorText = `Server error (Status: ${response.status})`;
        }
        
        console.error("Error fetching similar products:", errorText);
        setError(`Failed to load similar products. ${response.status === 404 ? "API endpoint not found." : "Please try again later."}`);
        setBestMatches([]);
        return;
      }
      
      // Parse response
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        setError("Invalid data format from server");
        setBestMatches([]);
        return;
      }
      
      // Filter products with 95% or greater similarity scores
      const highSimilarityMatches = data.filter(match => 
        match.average_similarity_score >= 0.80 && 
        match.reference_similarity_score >= 0.80
      );
      
      // Process the response data to add price comparison
      const processedMatches = highSimilarityMatches.map(match => {
        // Get prices for comparison
        const tunisianetPrice = product.Price; 
        const mytekPrice = match.mytek_price;
        
        // Calculate price difference if we have both prices
        let priceDiff: number | undefined = undefined;
        let priceDiffPercentage: number | undefined = undefined;
        let bestDeal: 'tunisianet' | 'mytek' | 'equal' | undefined = undefined;
        
        if (tunisianetPrice !== undefined && mytekPrice !== undefined) {
          priceDiff = tunisianetPrice - mytekPrice;
          // Calculate percentage difference relative to the higher price for consistency
          const higherPrice = Math.max(tunisianetPrice, mytekPrice);
          priceDiffPercentage = higherPrice > 0 ? Math.abs(priceDiff) / higherPrice : 0;
          
          if (priceDiff < -1) { // Tunisianet is cheaper by more than 1 unit
            bestDeal = 'tunisianet';
          } else if (priceDiff > 1) { // Mytek is cheaper by more than 1 unit
            bestDeal = 'mytek';
          } else { // Prices are essentially equal (within 1 unit difference)
            bestDeal = 'equal';
          }
        }
        
        return {
          ...match,
          tunisianet_price: tunisianetPrice,
          mytek_price: mytekPrice,
          price_difference: priceDiff,
          price_difference_percentage: priceDiffPercentage,
          best_deal: bestDeal
        };
      });
      
      setBestMatches(processedMatches);
      
      if (processedMatches.length === 0) {
        postMessage("No products with 80% or greater similarity found. Showing results as available.");
      } else {
        postMessage(""); // Clear message if matches are found
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Format percentage value
  const formatPercentage = (value?: number) => {
    if (value === undefined) return '-';
    return `${(value * 100).toFixed(0)}%`;
  };
  
  // Format price with currency
  const formatPrice = (value?: number) => {
    if (value === undefined) return '-';
    return `${value.toFixed(3)} DT`;
  };
  
  // Get best deal badge
  const getBestDealBadge = (bestDeal?: 'tunisianet' | 'mytek' | 'equal') => {
    if (!bestDeal) return null;
    
    switch (bestDeal) {
      case 'tunisianet':
        return <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">Best: Tunisianet</span>;
      case 'mytek':
        return <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">Best: Mytek</span>;
      case 'equal':
        return <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">Equal Pricing</span>;
    }
  };

  if (!isOpen) return null;

  // Prepare data for the chart
  const chartData = product.Modifications 
    ? [...product.Modifications]
        .sort((a, b) => new Date(a.dateModification).getTime() - new Date(b.dateModification).getTime())
        .map(mod => ({
          date: new Date(mod.dateModification).toLocaleDateString("fr-FR"),
          price: mod.ancienPrix
        }))
        .concat([{
          date: 'Aujourd\'hui',
          price: product.Price
        }])
    : [];

  // Check if similarity data exists
  const hasSimilarityData = product.tunisianet_name || product.mytek_name;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-6xl relative shadow-lg max-h-[90vh] w-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 flex items-start gap-3 justify-between border-b">
          <h2 className="text-xl font-bold">{product.Designation}</h2>
          <button 
            className="text-2xl border-none bg-transparent cursor-pointer hover:text-gray-700"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        <div className="p-5 gap-5 overflow-y-auto">
          <div className="flex flex-1 gap-8 md:flex-row flex-col">
            {product.Image && (
                <div className="flex-none md:w-48 h-48 relative">
                    <Image 
                        src={product.Image} 
                        alt={product.Designation} 
                        fill
                        className="rounded-md object-contain"
                        sizes="(max-width: 768px) 100vw, 192px"
                    />
                </div>
            )}
            
            <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Description:</h3>
                <p className="text-gray-600 leading-relaxed text-sm mb-4 text-justify">{product.Description}</p>
            </div>

            <div className="flex flex-col items-start gap-2 mb-4">
                <Button 
                    size="lg"
                    variant="default"
                    className="w-full flex items-center justify-center gap-2"
                >
                    {product.Price.toFixed(3)} DT
                </Button>
                <div className="flex gap-3 text-base text-black">
                    <span className="font-semibold">Concurrent: </span>
                    <span>{product.Company}</span>
                </div>
                <div className="flex gap-3 text-base text-black">
                    <span className="font-semibold">Catégorie: </span>
                    <span>{product.Category}</span>
                </div>
                <div className="flex gap-3 items-center text-base font-semibold">
                    <span className="text-black">Marque: </span>
                    <div className="relative h-5 w-20">
                        <Image 
                            src={product.BrandImage} 
                            alt={product.Brand} 
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>
                <div className="flex gap-3 text-base font-semibold">
                    <span className="text-black">Stock: </span>
                    <span className={
                        product.Stock === "En stock" ? "text-green-600" : "text-red-500"
                    }>{product.Stock}</span>
                </div>
                {product.Ref && (
                  <div className="flex gap-3 text-base text-black">
                    <span className="font-semibold">Référence: </span>
                    <span className="max-w-xs truncate">{product.Ref}</span>
                  </div>
                )}
            </div>
          </div>

          {/* Similarity data table */}
          {hasSimilarityData && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-3">Données de comparaison:</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/6">Source</TableHead>
                    <TableHead className="w-2/6">Désignation</TableHead>
                    <TableHead className="w-1/6">Référence</TableHead>
                    <TableHead className="w-2/6">Scores de similarité</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {product.tunisianet_name && (
                    <TableRow>
                      <TableCell className="font-medium">Mytek</TableCell>
                      <TableCell>{product.tunisianet_name}</TableCell>
                      <TableCell>{product.tunisianet_reference || '-'}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-xs">
                          <div>Nom: {product.name_similarity_score ? `${(product.name_similarity_score).toFixed(0)}%` : '-'}</div>
                          <div>Réf: {product.reference_similarity_score ? `${(product.reference_similarity_score).toFixed(0)}%` : '-'}</div>
                          <div className="font-bold">Moyenne: {product.average_similarity_score ? `${(product.average_similarity_score * 100).toFixed(0)}%` : '-'}</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {product.mytek_name && (
                    <TableRow>
                      <TableCell className="font-medium">Mytek</TableCell>
                      <TableCell>{product.mytek_name}</TableCell>
                      <TableCell>{product.mytek_reference || '-'}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-xs">
                          <div>Nom: {product.name_similarity_score ? `${(product.name_similarity_score * 100).toFixed(0)}%` : '-'}</div>
                          <div>Réf: {product.reference_similarity_score ? `${(product.reference_similarity_score * 100).toFixed(0)}%` : '-'}</div>
                          <div className="font-bold">Moyenne: {product.average_similarity_score ? `${(product.average_similarity_score * 100).toFixed(0)}%` : '-'}</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Best matches table */}
          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-3">Top 3 produits similaires:</h3>
            {isLoading ? (
              <div className="flex justify-center p-6">
                <svg className="animate-spin h-8 w-8 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : error ? (
              <div className="text-center py-4 text-red-500 flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={fetchBestMatches}
                >
                  Réessayer
                </Button>
              </div>
            ) : bestMatches.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead>Désignation</TableHead>
                    <TableHead>Référence</TableHead>
                    <TableHead>Score de similarité</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Meilleure offre</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bestMatches.map((match, index) => (
                    <TableRow key={match._id || index} className={index === 0 ? "bg-green-50" : ""}>
                      <TableCell>Mytek</TableCell>
                       <TableCell className="max-w-xs truncate">
                       {match.mytek_name || 'N/A'}
                      </TableCell>
                      <TableCell>
                       {match.mytek_reference || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-black h-2 rounded-full" 
                              style={{ width: `${match.average_similarity_score ? Math.min(match.average_similarity_score * 100, 100) : 0}%` }}
                            ></div>
                          </div>
                          {formatPercentage(match.average_similarity_score)}
                        </div>
                      </TableCell>
                      <TableCell>
                       {formatPrice(match.mytek_price)}
                      </TableCell>
                      <TableCell>
                        {getBestDealBadge(match.best_deal)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-4 text-gray-500">
                Aucun produit similaire trouvé.
              </div>
            )}
          </div>

          {chartData.length > 0 && (
            <div className="w-full h-[300px] mt-6">
                <h3 className="font-semibold text-lg mb-4">Historique des prix:</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                        data={chartData}
                        margin={{ top: 20, right: 20, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="date" 
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            interval={0}
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                            domain={['auto', 'auto']}
                            tickFormatter={(value: number) => `${value} DT`}
                            tick={{ fontSize: 12 }}
                        />
                        <Tooltip 
                            formatter={(value: number) => [`${value} DT`, 'Prix']}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="price" 
                            stroke="#020817" 
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 8 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="p-5 border-t mt-auto">
          <Button 
            variant="default"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => window.open(product.Link, '_blank')}
          >
            Voir sur le site
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Product;