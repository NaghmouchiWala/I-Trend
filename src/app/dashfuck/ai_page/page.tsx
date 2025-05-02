"use client"

import React, { useState, useEffect } from 'react';
import { Search, BarChart2, Tag, Database, DollarSign, ChevronLeft, ChevronRight, Filter, Download, ArrowUpDown, RefreshCw } from 'lucide-react';

type Product = {
  id: number;
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

const ProductMatcherDashboard = () => {


  const [input, setInput] = useState({
    threshold: 90, // Changed from 80 to 90
    priceThreshold: 10, 
    similarityThreshold: 90, 
    reference: ''
  });
  
  // Change the initial activeTab to 'reference' and don't auto-fetch
  const [activeTab, setActiveTab] = useState<'duplicates' | 'anomalies' | 'reference'>('reference');
  const [results, setResults] = useState<Product[]>([]);
  
 
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const [stats, setStats] = useState({
    totalProducts: 0,
    matchRate: 0,
    duplicatesCount: 0,
    anomaliesCount: 0,
    avgPriceDifference: 0, 
    bestDeals: { tunisianet: 0, mytek: 0, equal: 0 } 
  });
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const totalPages = Math.ceil(results.length / itemsPerPage);
  
// Connect to the database on component mount
useEffect(() => {
  const checkConnection = async () => {
    try {
      const response = await fetch('/api/db/dashboard');
      if (response.ok) {
        setConnectionStatus('connected');
        fetchStats();
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      console.error("Database connection error:", error);
      setConnectionStatus('disconnected');
    }
  };
  
  checkConnection();
}, []);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [results]);
  
  // Fetch analytics data
  const fetchStats = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch('/api/db/dashboard');
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalProducts: data.totalProducts || 0,
          matchRate: data.averageMatchScore || 0,
          duplicatesCount: data.duplicatesCount || 0,
          anomaliesCount: data.anomaliesCount || 0,
          avgPriceDifference: data.avgPriceDifference || 0,
          bestDeals: data.bestDeals || { tunisianet: 0, mytek: 0, equal: 0 }
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  
  const processPriceData = (products: Product[]): Product[] => {
    return products.map(product => {
      if (product.tunisianet_price && product.mytek_price) {
        const avgPrice = (product.tunisianet_price + product.mytek_price) / 2;
        const priceDiffPercentage = Math.abs(product.tunisianet_price - product.mytek_price) / avgPrice * 100;
        
        let bestDeal: 'tunisianet' | 'mytek' | 'equal' = 'equal';
        if (product.tunisianet_price < product.mytek_price) {
          bestDeal = 'tunisianet';
        } else if (product.mytek_price < product.tunisianet_price) {
          bestDeal = 'mytek';
        }
        
        return {
          ...product,
          price_difference_percentage: priceDiffPercentage,
          best_deal: bestDeal
        };
      }
      return product;
    });
  };
  
  const fetchData = async (type: 'duplicates' | 'anomalies' | 'reference') => {
    // Don't proceed if it's a reference search with empty query
    if (type === 'reference' && !input.reference.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }
  
    setIsLoading(true);
    
    try {
      let url = '/api/db/';
      let params = new URLSearchParams();
      
      switch (type) {
        case 'duplicates':
          url += 'duplicates';
          params.append('threshold', input.threshold.toString());
          break;
        case 'anomalies':
          url += 'price-anomalies';
          params.append('threshold', input.priceThreshold.toString());
          params.append('similarityThreshold', input.similarityThreshold.toString()); 
          break;
        case 'reference':
          url += 'references';
          params.append('query', input.reference.trim());
          break;
      }
      
      const response = await fetch(`${url}?${params.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        const processedData = processPriceData(data);
        setResults(processedData);
        setSortConfig(null);
      } else {
        console.error("Error fetching data:", await response.text());
        setResults([]);
      }
    } catch (error) {
      console.error("Error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = () => {
    if (!sortConfig) return results;
    return [...results].sort((a, b) => {
      if (a[sortConfig.key as keyof Product] === undefined || b[sortConfig.key as keyof Product] === undefined) {
        return 0;
      }
      if ((a[sortConfig.key as keyof Product] ?? 0) < (b[sortConfig.key as keyof Product] ?? 0)) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if ((a[sortConfig.key as keyof Product] ?? 0) > (b[sortConfig.key as keyof Product] ?? 0)) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const getCurrentItems = () => {
    const sortedData = getSortedData();
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return sortedData.slice(indexOfFirstItem, indexOfLastItem);
  };
  
  const formatColumnName = (key: string) => {
    return key
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getPriceDifferenceClass = (percentage?: number) => {
    if (!percentage) return '';
    if (percentage > 20) return 'text-red-500 font-medium';
    if (percentage > 10) return 'text-amber-500 font-medium';
    return 'text-green-500 font-medium';
  };

  const getBestDealBadge = (bestDeal?: 'tunisianet' | 'mytek' | 'equal') => {
    if (!bestDeal) return null;
    switch (bestDeal) {
      case 'tunisianet':
        return <span className="px-2 py-1 text-xs font-semibold rounded bg-black text-white">Best: Tunisianet</span>;
      case 'mytek':
        return <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-700 text-white">Best: Mytek</span>;
      case 'equal':
        return <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-200 text-gray-800">Equal Pricing</span>;
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (endPage - startPage < 4) {
      if (startPage === 1) {
        endPage = Math.min(5, totalPages);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, totalPages - 4);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex space-x-1">
        <button 
          onClick={goToPreviousPage} 
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          <ChevronLeft size={16} />
        </button>
        
        {startPage > 1 && (
          <>
            <button 
              onClick={() => goToPage(1)} 
              className="px-3 py-1 border rounded text-sm hover:bg-gray-100"
            >
              1
            </button>
            {startPage > 2 && <span className="px-2 py-1">...</span>}
          </>
        )}
        
        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => goToPage(number)}
            className={`px-3 py-1 rounded text-sm ${
              currentPage === number ? 'bg-black text-white' : 'border hover:bg-gray-100'
            }`}
          >
            {number}
          </button>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2 py-1">...</span>}
            <button 
              onClick={() => goToPage(totalPages)} 
              className="px-3 py-1 border rounded text-sm hover:bg-gray-100"
            >
              {totalPages}
            </button>
          </>
        )}
        
        <button 
          onClick={goToNextPage} 
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    );
  };
  
  const renderItemsPerPageSelector = () => {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-500">Show</span>
        <select 
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="px-2 py-1 border rounded text-sm"
        >
          {[5, 10, 25, 50].map(value => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <span className="text-sm text-gray-500">per page</span>
      </div>
    );
  };

  const exportToCsv = () => {
    if (results.length === 0) return;
    
    const headers = Object.keys(results[0])
      .filter(key => !['id', '_id'].includes(key))
      .map(key => formatColumnName(key));
    
    const data = results.map(row => 
      Object.entries(row)
        .filter(([key]) => !['id', '_id'].includes(key))
        .map(([_, value]) => {
          if (typeof value === 'number') {
            return value.toString();
          }
          return value ? `"${value}"` : '';
        })
    );
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `product-matcher-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black">Product Matcher Dashboard</h1>
            <p className="text-gray-500">Compare and analyze products from Tunisianet & Mytek</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={fetchStats}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Refresh Statistics"
            >
              <RefreshCw size={20} className={`text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <div className="bg-white p-2 px-4 rounded-lg shadow flex items-center space-x-2 border">
              <div className={`h-3 w-3 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' : 
                connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm font-medium text-gray-700">
                {connectionStatus === 'connected' ? 'Connected to Database' : 
                connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex mb-6 bg-white rounded-lg shadow overflow-hidden">
  <button 
    className={`flex items-center px-6 py-4 ${activeTab === 'reference' ? 'bg-black text-white' : 'text-black hover:bg-gray-50'}`}
    onClick={() => setActiveTab('reference')}
  >
    <Database size={18} className="mr-2" />
    References
  </button>
  <button 
    className={`flex items-center px-6 py-4 ${activeTab === 'duplicates' ? 'bg-black text-white' : 'text-black hover:bg-gray-50'}`}
    onClick={() => setActiveTab('duplicates')}
  >
    <Tag size={18} className="mr-2" />
    Duplicates
  </button>
  <button 
    className={`flex items-center px-6 py-4 ${activeTab === 'anomalies' ? 'bg-black text-white' : 'text-black hover:bg-gray-50'}`}
    onClick={() => setActiveTab('anomalies')}
  >
    <DollarSign size={18} className="mr-2" />
    Price Comparison
  </button>
</div>
   
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-lg font-semibold text-black mb-4 flex items-center">
              {activeTab === 'reference' && <><Database size={18} className="mr-2 text-gray-600" /> Search by Reference</>}
              {activeTab === 'duplicates' && <><Tag size={18} className="mr-2 text-gray-600" /> Find Duplicate Products</>}
              {activeTab === 'anomalies' && <><DollarSign size={18} className="mr-2 text-gray-600" /> Find Price Differences</>}
            </h2>
            
            <div className="space-y-4">
              {activeTab === 'reference' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Product Reference:</label>
                    <input 
                      type="text" 
                      value={input.reference} 
                      placeholder="Enter reference code..."
                      onChange={(e) => setInput({ ...input, reference: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-black"
                    />
                    
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mt-4">
                      <p className="text-xs text-gray-600">
                        Search for products by their reference code across both platforms.
                        <br />You can enter full or partial references to find matching products from Tunisianet and Mytek.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'duplicates' && (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-black mb-1">Similarity Threshold (%):</label>
      <div className="relative">
        <input 
          type="range" 
          min="90"  // Changed from 0 to 90
          max="100" 
          value={input.threshold} 
          onChange={(e) => setInput({ ...input, threshold: Number(e.target.value) })}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="absolute w-full flex justify-between text-xs text-black px-2 mt-1">
          <span>90%</span>  {/* Changed from 0% to 90% */}
          
          <span>100%</span>
        </div>
      </div>
      <div className="text-center mt-4 text-lg font-semibold text-black">{input.threshold}%</div>
      
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mt-4">
        <p className="text-xs text-gray-600">
          Products with similarity scores higher than <span className="font-semibold">{input.threshold}%</span> will be considered potential duplicates.
          <br />The threshold starts at 90% for more precise matches.
        </p>
      </div>
    </div>
  </div>
)}
              
              {activeTab === 'anomalies' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Price Difference Threshold (%):</label>
                    <div className="relative">
                      <input 
                        type="range"
                        min="0"
                        max="50"
                        step="1"
                        value={input.priceThreshold} 
                        onChange={(e) => setInput({ ...input, priceThreshold: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="absolute w-full flex justify-between text-xs text-black px-2 mt-1">
                        <span>0%</span>
                        <span>50%</span>
                      </div>
                    </div>
                    <div className="text-center mt-4 text-lg font-semibold text-black">{input.priceThreshold}%</div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Similarity Threshold (%):</label>
                    <div className="relative">
                      <input 
                        type="range"
                        min="70"
                        max="100"
                        step="1"
                        value={input.similarityThreshold} 
                        onChange={(e) => setInput({ ...input, similarityThreshold: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="absolute w-full flex justify-between text-xs text-black px-2 mt-1">
                        <span>90%</span>
                        <span>100%</span>
                      </div>
                    </div>
                    <div className="text-center mt-4 text-lg font-semibold text-black">{input.similarityThreshold}%</div>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600">
                      Products with similarity scores higher than <span className="font-semibold">{input.similarityThreshold}%</span> and price differences greater than <span className="font-semibold">{input.priceThreshold}%</span> will be shown.
                      <br />These represent significant pricing opportunities for similar products.
                    </p>
                  </div>
                </div>
              )}
              
              <button 
  className="w-full mt-4 p-3 bg-black text-white hover:bg-gray-800 font-medium rounded transition-colors duration-200 flex items-center justify-center"
  onClick={() => fetchData(activeTab)}
  disabled={connectionStatus !== 'connected' || 
            (activeTab === 'reference' && !input.reference.trim())}
>
  {isLoading ? (
    <span className="flex items-center">
      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Processing...
    </span>
  ) : (
    <>
      {activeTab === 'reference' && 'Find References'}
      {activeTab === 'duplicates' && 'Find Duplicates'}
      {activeTab === 'anomalies' && 'Find Price Differences'}
    </>
  )}
</button>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow flex flex-col border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-black flex items-center">
                <BarChart2 size={18} className="mr-2 text-gray-600" /> Analysis Summary
              </h2>
              <span className="text-xs text-gray-500">Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 flex-grow">
              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                <div className="text-sm text-gray-600">Products Analyzed</div>
                <div className="text-2xl font-bold text-black">{stats.totalProducts.toLocaleString()}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                <div className="text-sm text-gray-600">Avg Match Rate</div>
                <div className="text-2xl font-bold text-black">{stats.matchRate.toFixed(1)}%</div>
              </div>
              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                <div className="text-sm text-gray-600">Avg Price Diff</div>
                <div className="text-2xl font-bold text-black">{stats.avgPriceDifference.toFixed(1)}%</div>
              </div>
              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                <div className="text-sm text-gray-600">Price Anomalies</div>
                <div className="text-2xl font-bold text-black">{stats.anomaliesCount}</div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-sm font-medium text-black mb-2">Best Deal Distribution</h3>
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden border">
                <div className="flex h-full">
                  {stats.totalProducts > 0 && (
                    <>
                      <div className="bg-black h-full" style={{ width: `${(stats.bestDeals.tunisianet / stats.totalProducts) * 100}%` }}></div>
                      <div className="bg-gray-700 h-full" style={{ width: `${(stats.bestDeals.mytek / stats.totalProducts) * 100}%` }}></div>
                      <div className="bg-gray-400 h-full" style={{ width: `${(stats.bestDeals.equal / stats.totalProducts) * 100}%` }}></div>
                    </>
                  )}
                </div>
              </div>
              <div className="flex justify-between text-xs mt-2">
                <span className="flex items-center"><span className="w-3 h-3 bg-black rounded-full mr-1"></span> Tunisianet: {stats.bestDeals.tunisianet}</span>
                <span className="flex items-center"><span className="w-3 h-3 bg-gray-700 rounded-full mr-1"></span> Mytek: {stats.bestDeals.mytek}</span>
                <span className="flex items-center"><span className="w-3 h-3 bg-gray-400 rounded-full mr-1"></span> Equal: {stats.bestDeals.equal}</span>
              </div>
            </div>
          </div>
        </div>
        
        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden border">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-black">Results</h2>
                <p className="text-sm text-gray-500">Showing {results.length} items</p>
              </div>
              <div className="flex space-x-2">
                <button 
                  className="flex items-center px-3 py-2 text-sm font-medium border rounded text-gray-700 hover:bg-gray-50"
                  onClick={() => setSortConfig(null)}
                >
                  <Filter size={16} className="mr-1" /> Reset Filters
                </button>
                <button 
                  className="flex items-center px-3 py-2 text-sm font-medium bg-black text-white rounded hover:bg-gray-800"
                  onClick={exportToCsv}
                >
                  <Download size={16} className="mr-1" /> Export CSV
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                  {results.length > 0 && Object.keys(results[0]).map(key => {
                      if (['id', '_id'].includes(key)) return null;
                      return (
                        <th 
                          key={key} 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => requestSort(key)}
                        >
                          <div className="flex items-center">
                            {formatColumnName(key)}
                            {sortConfig?.key === key && (
                              <ArrowUpDown size={14} className="ml-1" />
                            )}
                          </div>
                        </th>
                      );
                    }).filter(Boolean)}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Best Deal
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getCurrentItems().map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      {Object.entries(row).map(([key, value], valueIdx) => {
                        if (['id', '_id'].includes(key)) return null;
                        
                        return (
                          <td key={valueIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {key.includes('similarity') && typeof value === 'number' ? (
                              <div className="flex items-center">
                                <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                  <div className="bg-black text-white h-2 rounded-full" style={{ width: `${value > 100 ? 100 : value}%` }}></div>
                                </div>
                                {value.toFixed(1)}%
                              </div>
                            ) : key.includes('price_difference_percentage') && typeof value === 'number' ? (
                              <span className={getPriceDifferenceClass(value)}>
                                {value.toFixed(1)}%
                              </span>
                            ) : key.includes('price') && key !== 'price_difference' && typeof value === 'number' ? (
                              `${value.toFixed(2)} TND`
                            ) : key === 'price_difference' && typeof value === 'number' ? (
                              <span className={value > input.priceThreshold ? 'text-red-500 font-medium' : ''}>
                                {value.toFixed(2)} TND
                              </span>
                            ) : key === 'best_deal' ? (
                              null
                            ) : key.includes('name') && typeof value === 'string' ? (
                              <div className="max-w-xs truncate" title={value}>
                                {value}
                              </div>
                            ) : (
                              String(value || '-')
                            )}
                          </td>
                        );
                      }).filter(Boolean)}
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getBestDealBadge(row.best_deal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="px-4 py-3 border-t flex flex-wrap items-center justify-between bg-gray-50">
              <div className="text-sm text-gray-500 mb-2 md:mb-0">
                {results.length > 0 ? (
                  <>
                    Showing <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, results.length)}</span> to{' '}
                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, results.length)}</span> of{' '}
                    <span className="font-medium">{results.length}</span> results
                  </>
                ) : (
                  'No results found'
                )}
              </div>
              <div className="flex flex-wrap items-center space-x-4">
                {renderItemsPerPageSelector()}
                {renderPagination()}
              </div>
            </div>
          </div>
        )}

        {!isLoading && results.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center border">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-black mb-2">No Results Found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {activeTab === 'reference' && 'Check the reference code and try again or use a partial reference.'}
              {activeTab === 'duplicates' && 'Try lowering the similarity threshold to find more potential duplicates.'}
              {activeTab === 'anomalies' && 'Adjust price or similarity thresholds to discover pricing opportunities.'}
            </p>
          </div>
        )}

        {isLoading && (
          <div className="bg-white rounded-lg shadow p-12 text-center border">
            <div className="mx-auto w-16 h-16 flex items-center justify-center mb-4">
              <svg className="animate-spin h-8 w-8 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-black mb-2">Processing Your Request</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Please wait while we analyze and compare products from both platforms...
            </p>
          </div>
        )}

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} I-Trend. All rights reserved.</p>
          <p className="mt-1">A comparison tool for Tunisianet and Mytek product catalogs.</p>
        </div>
      </div>
    </div>
  );
};

export default ProductMatcherDashboard;