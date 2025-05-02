"use client";

import Image from 'next/image';
import { TableCell, TableRow } from '@/components/ui/table';
import { ProductRo } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Props {
  product: ProductRo;
  setSelectedProduct: (product: ProductRo) => void;
}

export function Product({product, setSelectedProduct}: Props) {
  // Check if Modifications array exists and has items
  const hasModifications = product.Modifications && Array.isArray(product.Modifications) && product.Modifications.length > 0;
  
  // Safely get the last modification
  const lastModification = hasModifications
    ? product.Modifications[product.Modifications.length - 1]
    : null;
  
  // Get the current price from either modifications or direct price field
  const currentPrice = lastModification?.nouveauPrix || product.Price || 0;
  
  // Get the old price from either modifications or set it same as current (no change)
  const oldPrice = lastModification?.ancienPrix || currentPrice;
  
  // Calculate price difference
  const difference = currentPrice - oldPrice;
  
  // Format date safely
  const modificationDate = lastModification?.dateModification
    ? new Date(lastModification.dateModification).toLocaleDateString("fr-FR")
    : "N/A";
  
  // Check if the product is from Mytek (for debugging purposes)
  const isMytek = product.Source === 'mytek';

  return (
    <TableRow>
      <TableCell className="font-medium">{product.Ref}</TableCell>
      <TableCell className="hidden md:table-cell">
        {product.Image && (
          <Image
            alt="Product image"
            className="aspect-square rounded-md object-cover"
            height="64"
            src={product.Image}
            width="64"
          />
        )}
      </TableCell>
      <TableCell className="font-medium">
        <a href={product.Link} target="_blank" className="hover:underline">
          {product.Designation}
        </a>
      </TableCell>
      <TableCell className="hidden md:table-cell">{product.Subcategory}</TableCell>
      <TableCell className="hidden md:table-cell">{product.Brand}</TableCell>
      <TableCell>
        <Badge variant={product.Stock === "En stock" ? "success" : "alert"} className="capitalize">
          {product.Stock}
        </Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">{`${oldPrice.toFixed(3)} DT`}</TableCell>
      <TableCell className="hidden md:table-cell">
        {modificationDate}
      </TableCell>
      <TableCell className="hidden md:table-cell font-bold">{`${currentPrice.toFixed(3)} DT`}</TableCell>
      <TableCell className={cn(
        "hidden md:table-cell", 
        difference > 0 ? "text-success" : difference < 0 ? "text-alert" : ""
      )}>
        {`${difference > 0 ? "+" : ""}${difference.toFixed(3)} DT`}
      </TableCell>
      
      <TableCell>
        <Button variant="outline" onClick={() => {
          setSelectedProduct(product);
        }}>
          Voir
        </Button>
      </TableCell>
    </TableRow>
  );
}