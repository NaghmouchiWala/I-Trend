'use client';
import { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { NewProducts } from '@/components/tables/NewProducts';
import Product from '@/components/Product';
import { ProductRo } from '@/types/product';

export default function ProductsPage() {
  const [selectedProduct, setSelectedProduct] = useState<ProductRo | null>(null);

  return (
    <Tabs defaultValue="all">
      <TabsContent value="all">
        <NewProducts setSelectedProduct={setSelectedProduct} />
      </TabsContent>
      {selectedProduct && (
        <Product
          product={selectedProduct}
          isOpen={selectedProduct !== null}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </Tabs>
  );
}
