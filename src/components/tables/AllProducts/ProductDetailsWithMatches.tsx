'use client';

import { ProductRo } from "@/types/product";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Image from "next/image";

function getSimilarityScore(base: ProductRo, other: ProductRo) {
  let score = 0;
  if (base.Brand === other.Brand) score += 3;
  if (base.Subcategory === other.Subcategory) score += 3;
  if (other.Designation.includes(base.Brand || "")) score += 1;
  const priceDiff = Math.abs(base.Price - other.Price);
  if (priceDiff < 50) score += 3;
  else if (priceDiff < 100) score += 2;
  else if (priceDiff < 200) score += 1;

  return score;
}

export default function ProductDetailsWithMatches({
  selectedProduct,
  allProducts,
}: {
  selectedProduct: ProductRo | null;
  allProducts: ProductRo[];
}) {
  if (!selectedProduct) return null;

  const bestMatches = allProducts
    .filter(p => p.Ref !== selectedProduct.Ref)
    .map(p => ({ ...p, score: getSimilarityScore(selectedProduct, p) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Top 3 Meilleurs Correspondances</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {bestMatches.map(product => (
          <div key={product.Ref} className="flex flex-col gap-2 border rounded-lg p-2">
            {product.Image && (
              <Image
                src={product.Image}
                alt={product.Designation}
                width={80}
                height={80}
                className="object-cover rounded"
              />
            )}
            <a
              href={product.Link}
              target="_blank"
              className="font-medium hover:underline text-sm"
            >
              {product.Designation}
            </a>
            <p className="text-sm text-muted-foreground">{product.Brand}</p>
            <p className="text-sm">{product.Price.toFixed(3)} DT</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
